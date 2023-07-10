import { parentPort } from "worker_threads";
import { pathToFileURL } from "url";
import { isAbsolute } from "path";

async function callPrettierFunction({ functionName, args, prettierEntry }) {
  const prettierEntryUrl =
    isAbsolute(prettierEntry) || prettierEntry.startsWith(".")
      ? pathToFileURL(prettierEntry)
      : prettierEntry;
  const prettier = await import(prettierEntryUrl);
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
