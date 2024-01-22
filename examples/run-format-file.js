import * as url from "node:url";
import formatFile from "./format-file.js";

console.log(
  formatFile(url.fileURLToPath(new URL("../readme.md", import.meta.url))),
);
