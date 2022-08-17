const {
  Worker,
  receiveMessageOnPort,
  MessageChannel,
} = require("node:worker_threads");

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
    worker = new Worker("./worker.js");
    worker.unref();
  }

  return worker;
}

function createSyncFunction(functionName) {
  return (...args) => {
    const signal = new Int32Array(new SharedArrayBuffer(4));
    const subChannel = new MessageChannel();
    const worker = createWorker();

    worker.postMessage({ signal, port: subChannel.port1, functionName, args }, [
      subChannel.port1,
    ]);

    Atomics.wait(signal, 0, 0);

    const { result, error, errorData } = receiveMessageOnPort(
      subChannel.port2,
    ).message;

    if (error) {
      throw Object.assign(error, errorData);
    }

    return result;
  };
}

function createGetter(property) {
  return;
}

const prettier = Object.defineProperties(
  Object.create(null),
  Object.fromEntries([
    ...
      PRETTIER_ASYNC_FUNCTIONS.map((functionName) => [
        functionName,
        { get: () => createSyncFunction(functionName), enumerable: true },
      ]),
    ...PRETTIER_STATIC_PROPERTIES.map((property) => [
      property,
      { get: () => require("prettier")[property], enumerable: true },
    ]),
  ]),
);

module.exports = prettier;
