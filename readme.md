# prettier-sync

[![Build Status][github_actions_badge]][github_actions_link]
[![Coverage][coveralls_badge]][coveralls_link]
[![Npm Version][package_version_badge]][package_link]
[![MIT License][license_badge]][license_link]

[github_actions_badge]: https://img.shields.io/github/workflow/status/fisker/prettier-sync/CI/master?style=flat-square
[github_actions_link]: https://github.com/fisker/prettier-sync/actions?query=branch%3Amaster
[coveralls_badge]: https://img.shields.io/coveralls/github/fisker/prettier-sync/master?style=flat-square
[coveralls_link]: https://coveralls.io/github/fisker/prettier-sync?branch=master
[license_badge]: https://img.shields.io/npm/l/prettier-sync.svg?style=flat-square
[license_link]: https://github.com/fisker/prettier-sync/blob/master/license
[package_version_badge]: https://img.shields.io/npm/v/prettier-sync.svg?style=flat-square
[package_link]: https://www.npmjs.com/package/prettier-sync

> Synchronous version of Prettier

## Install

```sh
yarn add prettier-sync
```

## Usage

```js
import prettierSync from 'prettier-sync'

prettierSync.format('foo( )', {parser: 'babel'})
// => 'foo();\n'
```
