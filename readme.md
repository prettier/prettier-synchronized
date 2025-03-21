# @prettier/sync

[![Build Status][github_actions_badge]][github_actions_link]
[![Coverage][codecov_badge]][codecov_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[github_actions_badge]: https://img.shields.io/github/actions/workflow/status/prettier/prettier-synchronized/continuous-integration.yml?style=flat-square
[github_actions_link]: https://github.com/prettier/prettier-synchronized/actions?query=branch%3Amain
[codecov_badge]: https://img.shields.io/codecov/c/github/prettier/prettier-synchronized?style=flat-square
[codecov_link]: https://codecov.io/gh/prettier/prettier-synchronized
[license_badge]: https://img.shields.io/npm/l/@prettier/sync.svg?style=flat-square
[license_link]: https://github.com/prettier/prettier-synchronized/blob/main/license
[package_version_badge]: https://img.shields.io/npm/v/@prettier/sync.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/@prettier/sync

> Synchronous version of Prettier

## Installation

```sh
yarn add prettier @prettier/sync
```

## Usage

```js
import synchronizedPrettier from "@prettier/sync";

synchronizedPrettier.format("foo( )", { parser: "babel" });
// => 'foo();\n'
```

This package is a simple wrapper of [`make-synchronized`](https://github.com/fisker/make-synchronized).

For more complex use cases, it's better to use [`make-synchronized`](https://github.com/fisker/make-synchronized) directly:

Example 1:

```js
// utilities.js
import * as fs from "node:fs/promises";
import * as prettier from "prettier";

export async function formatFile(file) {
  const config = await prettier.resolveConfig(file);
  const content = await fs.readFile(file, "utf8");
  const formatted = await prettier.format(content, {
    ...config,
    filepath: file,
  });
  await fs.writeFile(file, formatted);
}

// index.js
import makeSynchronized from "make-synchronized";

const utilities = makeSynchronized(new URL("./utilities.js", import.meta.url));

utilities.formatFile("/path/to/file.js");
```

Example 2:

```js
import * as fs from "node:fs/promises";
import * as prettier from "prettier";
import makeSynchronized from "make-synchronized";

export default makeSynchronized(import.meta, async function formatFile(file) {
  const config = await prettier.resolveConfig(file);
  const content = await fs.readFile(file, "utf8");
  const formatted = await prettier.format(content, {
    ...config,
    filepath: file,
  });
  await fs.writeFile(file, formatted);
});
```

Alternatively you can also use [`synckit`](https://github.com/un-ts/synckit) or [`make-synchronous`](https://github.com/sindresorhus/make-synchronous).

### `createSynchronizedPrettier(options)`

#### `options`

Type: `object`

##### `prettierEntry`

Type: `string | URL`

Path or URL to prettier entry.

```js
import { createSynchronizedPrettier } from "@prettier/sync";

const synchronizedPrettier = createSynchronizedPrettier({
  prettierEntry: "/path/to/prettier/index.js",
});

synchronizedPrettier.format("foo( )", { parser: "babel" });
// => 'foo();\n'
```
