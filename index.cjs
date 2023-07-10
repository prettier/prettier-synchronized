"use strict";

const {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} = require("worker_threads");

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

function createSyncFunction(functionName, prettierPath) {
  return (...args) => {
    const signal = new Int32Array(new SharedArrayBuffer(4));
    const { port1: localPort, port2: workerPort } = new MessageChannel();
    const worker = createWorker();

    worker.postMessage(
      { signal, port: workerPort, functionName, args, prettierPath },
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

function createSynchronizedPrettier({ prettierPath }) {
  const prettier = Object.defineProperties(
    Object.create(null),
    Object.fromEntries(
      [
        ...PRETTIER_ASYNC_FUNCTIONS.map((functionName) => [
          functionName,
          () => createSyncFunction(functionName, prettierPath),
        ]),
        ...PRETTIER_STATIC_PROPERTIES.map((property) => [
          property,
          () => require(prettierPath)[property],
        ]),
      ].map(([property, getter]) => [property, createDescriptor(getter)]),
    ),
  );

  return prettier;
}

module.exports = createSynchronizedPrettier({ prettierPath: "prettier" });
module.exports.createSynchronizedPrettier = createSynchronizedPrettier;
