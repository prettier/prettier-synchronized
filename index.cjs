"use strict";

const {
  MessageChannel,
  Worker,
  isMainThread,
  parentPort,
  receiveMessageOnPort,
} = require("worker_threads");

if (isMainThread) {
  const url = require("url");
  const path = require("path");

  /**
  @template {keyof PrettierSynchronizedFunctions} FunctionName
  @typedef {(...args: Parameters<Prettier[FunctionName]>) => Awaited<ReturnType<Prettier[FunctionName]>> } PrettierSyncFunction
  */

  /**
  @typedef {import("prettier")} Prettier
  @typedef {{ [FunctionName in typeof PRETTIER_ASYNC_FUNCTIONS[number]]: PrettierSyncFunction<FunctionName> }} PrettierSynchronizedFunctions
  @typedef {{ [PropertyName in typeof PRETTIER_STATIC_PROPERTIES[number]]: Prettier[PropertyName] }} PrettierStaticProperties
  @typedef {PrettierSynchronizedFunctions & PrettierStaticProperties} SynchronizedPrettier
  */

  const PRETTIER_ASYNC_FUNCTIONS = /** @type {const} */ ([
    "formatWithCursor",
    "format",
    "check",
    "resolveConfig",
    "resolveConfigFile",
    "clearConfigCache",
    "getFileInfo",
    "getSupportInfo",
  ]);

  const PRETTIER_STATIC_PROPERTIES = /** @type {const} */ ([
    "version",
    "util",
    "doc",
  ]);

  /** @type {Worker | undefined} */
  let worker;
  function createWorker() {
    if (!worker) {
      worker = new Worker(__filename);
      worker.unref();
    }

    return worker;
  }

  /**
   * @template {keyof PrettierSynchronizedFunctions} FunctionName
   * @param {FunctionName} functionName
   * @param {string} prettierEntry
   * @returns {PrettierSyncFunction<FunctionName>}
   */
  function createSynchronizedFunction(functionName, prettierEntry) {
    return (...args) => {
      const signal = new Int32Array(new SharedArrayBuffer(4));
      const { port1: localPort, port2: workerPort } = new MessageChannel();
      const worker = createWorker();

      worker.postMessage(
        { signal, port: workerPort, functionName, args, prettierEntry },
        [workerPort],
      );

      Atomics.wait(signal, 0, 0);

      const {
        message: { result, error, errorData },
      } = receiveMessageOnPort(localPort);

      if (error) {
        throw Object.assign(error, errorData);
      }

      return result;
    };
  }

  /**
   * @template {keyof PrettierStaticProperties} Property
   * @param {Property} property
   * @param {string} prettierEntry
   */
  function getProperty(property, prettierEntry) {
    return /** @type {Prettier} */ (require(prettierEntry))[property];
  }

  /**
   * @template {keyof SynchronizedPrettier} ExportName
   * @param {() => SynchronizedPrettier[ExportName]} getter
   */
  function createDescriptor(getter) {
    let value;
    return {
      get: () => {
        value ??= getter();
        return value;
      },
      enumerable: true,
    };
  }

  /**
   * @param {string | URL} entry
   */
  function toImportId(entry) {
    if (entry instanceof URL) {
      return entry.href;
    }

    if (typeof entry === "string" && path.isAbsolute(entry)) {
      return url.pathToFileURL(entry).href;
    }

    return entry;
  }

  /**
   * @param {string | URL} entry
   */
  function toRequireId(entry) {
    if (entry instanceof URL || entry.startsWith("file:")) {
      return url.fileURLToPath(entry);
    }

    return entry;
  }

  /**
   * @param {object} options
   * @param {string | URL} options.prettierEntry - Path or URL to prettier entry.
   * @returns {SynchronizedPrettier}
   */
  function createSynchronizedPrettier({ prettierEntry }) {
    const importId = toImportId(prettierEntry);
    const requireId = toRequireId(prettierEntry);

    const prettier = Object.defineProperties(
      Object.create(null),
      Object.fromEntries(
        [
          ...PRETTIER_ASYNC_FUNCTIONS.map((functionName) => {
            return /** @type {const} */ ([
              functionName,
              () => createSynchronizedFunction(functionName, importId),
            ]);
          }),
          ...PRETTIER_STATIC_PROPERTIES.map((property) => {
            return /** @type {const} */ ([
              property,
              () => getProperty(property, requireId),
            ]);
          }),
        ].map(([property, getter]) => {
          return /** @type {const} */ ([property, createDescriptor(getter)]);
        }),
      ),
    );

    return prettier;
  }

  module.exports = createSynchronizedPrettier({ prettierEntry: "prettier" });
  // @ts-expect-error Property 'createSynchronizedPrettier' for named export compatibility
  module.exports.createSynchronizedPrettier = createSynchronizedPrettier;
} else {
  async function callPrettierFunction({ functionName, args, prettierEntry }) {
    const prettier = await import(prettierEntry);
    return prettier[functionName](...args);
  }

  parentPort.addListener(
    "message",
    async ({ signal, port, functionName, args, prettierEntry }) => {
      const response = {};

      try {
        response.result = await callPrettierFunction({
          functionName,
          args,
          prettierEntry,
        });
      } catch (error) {
        response.error = error;
        response.errorData = { ...error };
      }

      try {
        port.postMessage(response);
      } catch {
        port.postMessage({
          error: new Error("Cannot serialize worker response"),
        });
      } finally {
        port.close();
        Atomics.store(signal, 0, 1);
        Atomics.notify(signal, 0);
      }
    },
  );
}
