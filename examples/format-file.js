import * as fs from "node:fs/promises";
import * as prettier from "prettier";
import makeSynchronized from "make-synchronized";

export default makeSynchronized(import.meta, async function formatFile(file) {
  const config = await prettier.resolveConfig(file);
  const content = await fs.readFile(file, "utf8");
  const formatted = await prettier.format(content, {...config,filepath: file});
  await fs.writeFile(file, formatted);
});
