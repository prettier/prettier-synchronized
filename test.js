import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import prettier from "prettier";
import synchronizedPrettier, { createSynchronizedPrettier } from "./index.cjs";
import fakePrettier from "./a-fake-prettier-to-test.cjs";

test("format", async () => {
  const code = await fs.readFile("./index.cjs", "utf8");
  const formatOptions = { parser: "meriyah" };
  assert.equal(
    synchronizedPrettier.format(code, formatOptions),
    await prettier.format(code, formatOptions),
  );

  let error;
  try {
    synchronizedPrettier.format("foo(", formatOptions);
  } catch (formatError) {
    error = formatError;
  }
  assert.deepEqual(error.loc, { start: { line: 1, column: 4 } });
});

test("version", () => {
  assert.equal(synchronizedPrettier.version, prettier.version);
});

test("share env", () => {
  const code = "<script>foo(</script>";
  const formatOptions = { parser: "html" };
  assert.equal(
    synchronizedPrettier.format(code, formatOptions),
    "<script>\n  foo(\n</script>\n",
  );

  process.env.PRETTIER_DEBUG = "1";
  let error;
  try {
    synchronizedPrettier.format(code, formatOptions);
  } catch (formatError) {
    error = formatError;
  } finally {
    delete process.env.PRETTIER_DEBUG;
  }
  assert.deepEqual(error.loc, { start: { line: 1, column: 5 } });
});

{
  const fakePrettierRelatedPath = "./a-fake-prettier-to-test.cjs";
  const fakePrettierUrl = new URL(fakePrettierRelatedPath, import.meta.url);
  for (const prettierEntry of [
    fakePrettierRelatedPath,
    fakePrettierUrl,
    fakePrettierUrl.href,
    fileURLToPath(fakePrettierUrl),
  ]) {
    test(prettierEntry, async () => {
      const fakeSynchronizedPrettier = createSynchronizedPrettier({
        prettierEntry,
      });
      assert.equal(fakeSynchronizedPrettier.version, fakePrettier.version);
      assert.equal(
        fakeSynchronizedPrettier.format("code"),
        await fakePrettier.format("code"),
      );
    });
  }
}
