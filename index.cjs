"use strict";

const {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} = require("worker_threads");
const url = require("url");
const path = require("path");

const PRETTIER_ASYNC_FUNCTIONS = [
  "formatWithCursor",
  "format",
  "check",
  "resolveConfig",
  "resolveConfigFile",
  "clearConfigCache",
  "getFileInfo",
  "getSupportInfo",
];

const PRETTIER_STATIC_PROPERTIES = ["version", "util", "doc"];

let worker;
function createWorker() {
  if (!worker) {
    worker = new Worker(require.resolve("./worker.js"));
    worker.unref();
  }

  return worker;
}

function createSyncFunction(functionName, prettierEntry) {
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

function getProperty(property, prettierEntry) {
  return require(prettierEntry)[property];
}

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

function toImportId(entry) {
  if (entry instanceof URL) {
    return entry.href;
  }

  if (typeof entry === "string" && path.isAbsolute(entry)) {
    return url.pathToFileURL(entry).href;
  }

  return entry;
}

function toRequireId(entry) {
  if (entry instanceof URL || entry.startsWith("file:")) {
    return url.fileURLToPath(entry);
  }

  return entry;
}

function createSynchronizedPrettier({ prettierEntry }) {
  const importId = toImportId(prettierEntry);
  const requireId = toRequireId(prettierEntry);

  const prettier = Object.defineProperties(
    Object.create(null),
    Object.fromEntries(
      [
        ...PRETTIER_ASYNC_FUNCTIONS.map((functionName) => [
          functionName,
          () => createSyncFunction(functionName, importId),
        ]),
        ...PRETTIER_STATIC_PROPERTIES.map((property) => [
          property,
          () => getProperty(property, requireId),
        ]),
      ].map(([property, getter]) => [property, createDescriptor(getter)]),
    ),
  );

  return prettier;
}

module.exports = createSynchronizedPrettier({ prettierEntry: "prettier" });
module.exports.createSynchronizedPrettier = createSynchronizedPrettier;
