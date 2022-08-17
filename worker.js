import { parentPort } from "worker_threads";
import * as prettier from "prettier";

parentPort.addListener(
  "message",
  async ({ signal, port, functionName, args }) => {
    const response = {};

    try {
      response.result = await prettier[functionName](...args);
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
