import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import prettier from "prettier";
import prettierSync from "./index.cjs";

test("format", async () => {
  const code = await fs.readFile("./index.cjs", "utf8");
  const formatOptions = { parser: "meriyah" };
  assert.equal(
    prettierSync.format(code, formatOptions),
    await prettier.format(code, formatOptions),
  );

  let error;
  try {
    prettierSync.format("foo(", formatOptions);
  } catch (formatError) {
    error = formatError;
  }
  assert.deepEqual(error.loc, { start: { line: 1, column: 4 } });
});

test("version", () => {
  assert.equal(prettierSync.version, prettier.version);
});
