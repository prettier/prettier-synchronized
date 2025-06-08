import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import prettier from "prettier";
import synchronizedPrettier, { createSynchronizedPrettier } from "./index.cjs";
import fakePrettier from "./a-fake-prettier-to-test.cjs";

const code = await fs.readFile("./index.cjs", "utf8");

if (process.env.TEST_RUNTIME === "Bun") {
  assert(typeof Bun !== "undefined");
}

test("format", async () => {
  const formatOptions = { parser: "meriyah" };
  const formattedBySynchronizedPrettier = synchronizedPrettier.format(
    code,
    formatOptions,
  );
  assert.equal(typeof formattedBySynchronizedPrettier, "string");

  const formattedByPrettier = await prettier.format(code, formatOptions);
  assert.equal(formattedBySynchronizedPrettier, formattedByPrettier);

  let error;
  try {
    synchronizedPrettier.format("foo(", formatOptions);
  } catch (formatError) {
    error = formatError;
  }
  assert.deepEqual(error.loc, {
    start: { line: 1, column: 4 },
    end: { line: 1, column: 5 },
  });
});

test("version", () => {
  assert.equal(synchronizedPrettier.version, prettier.version);
});

test("functions not exported directly", async () => {
  const parseOptions = { parser: "meriyah" };
  const { ast: astParsedBySynchronizedPrettier } =
    synchronizedPrettier.__debug.parse(code, parseOptions);

  assert.equal(astParsedBySynchronizedPrettier.type, "Program");

  const { ast: astParsedByPrettier } = await prettier.__debug.parse(
    code,
    parseOptions,
  );
  assert.deepEqual(astParsedBySynchronizedPrettier, astParsedByPrettier);
});

{
  const fakePrettierRelatedPath = "./a-fake-prettier-to-test.cjs";
  const fakePrettierUrl = new URL(fakePrettierRelatedPath, import.meta.url);
  for (const prettierEntry of [
    fakePrettierUrl,
    fakePrettierUrl.href,
    fileURLToPath(fakePrettierUrl),
  ]) {
    test(
      prettierEntry instanceof URL
        ? `[URL]${prettierEntry.href}`
        : prettierEntry,
      async () => {
        const fakeSynchronizedPrettier = createSynchronizedPrettier({
          prettierEntry,
        });
        assert.equal(fakeSynchronizedPrettier.version, fakePrettier.version);
        assert.equal(
          fakeSynchronizedPrettier.format("code"),
          await fakePrettier.format("code"),
        );
      },
    );
  }
}
