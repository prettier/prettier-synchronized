import { parentPort } from "worker_threads";

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
