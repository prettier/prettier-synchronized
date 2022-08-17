# @prettier/sync

[![Build Status][github_actions_badge]][github_actions_link]
[![Coverage][codecov_badge]][codecov_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[github_actions_badge]: https://img.shields.io/github/workflow/status/pettier/sync/CI/main?style=flat-square
[github_actions_link]: https://github.com/pettier/sync/actions?query=branch%3Amain
[codecov_badge]: https://codecov.io/gh/prettier/sync/branch/main/graph/badge.svg?token=Cvu6qhcepg
[codecov_link]: https://codecov.io/gh/prettier/sync
[license_badge]: https://img.shields.io/npm/l/@prettier/sync.svg?style=flat-square
[license_link]: https://github.com/pettier/sync/blob/main/license
[package_version_badge]: https://img.shields.io/npm/v/@prettier/sync.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/@prettier/sync

> Synchronous version of Prettier

## Install

```sh
yarn add @prettier/sync
```

## Usage

```js
import prettierSync from "@prettier/sync";

prettierSync.format("foo( )", { parser: "babel" });
// => 'foo();\n'
```
