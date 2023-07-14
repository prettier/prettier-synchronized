import {
  check,
  clearConfigCache,
  doc,
  format,
  formatWithCursor,
  getFileInfo,
  resolveConfig,
  resolveConfigFile,
  util,
} from "prettier";

type SyncFunction<T extends Function> = (...args: Parameters<T>) => Awaited<ReturnType<T>>

declare namespace prettierSync {
  interface PrettierSync {
    doc: typeof doc;

    util: typeof util;

    version: string;

    /**
     * `check` checks to see if the file has been formatted with Prettier given those options and returns a `Boolean`.
     * This is similar to the `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.
     */
    check: SyncFunction<typeof check>;

    /**
     * As you repeatedly call `resolveConfig`, the file system structure will be cached for performance. This function will clear the cache.
     * Generally this is only needed for editor integrations that know that the file system has changed since the last format took place.
     */
    clearConfigCache: SyncFunction<typeof clearConfigCache>

    /**
     * `format` is used to format text using Prettier. [Options](https://prettier.io/docs/en/options.html) may be provided to override the defaults.
     */
    format: SyncFunction<typeof format>

    /**
     * `formatWithCursor` both formats the code, and translates a cursor position from unformatted code to formatted code.
     * This is useful for editor integrations, to prevent the cursor from moving when code is formatted.
     *
     * The `cursorOffset` option should be provided, to specify where the cursor is. This option cannot be used with `rangeStart` and `rangeEnd`.
     */
    formatWithCursor: SyncFunction<typeof formatWithCursor>

    getFileInfo: SyncFunction<typeof getFileInfo>

    /**
     * `resolveConfig` can be used to resolve configuration for a given source file,
     * passing its path as the first argument. The config search will start at the
     * file path and continue to search up the directory.
     * (You can use `process.cwd()` to start searching from the current directory).
     *
     * A promise is returned which will resolve to:
     *
     *  - An options object, providing a [config file](https://prettier.io/docs/en/configuration.html) was found.
     *  - `null`, if no file was found.
     *
     * The promise will be rejected if there was an error parsing the configuration file.
     */
    resolveConfig: SyncFunction<typeof resolveConfig>

    /**
     * `resolveConfigFile` can be used to find the path of the Prettier configuration file,
     * that will be used when resolving the config (i.e. when calling `resolveConfig`).
     *
     * A promise is returned which will resolve to:
     *
     * - The path of the configuration file.
     * - `null`, if no file was found.
     *
     * The promise will be rejected if there was an error parsing the configuration file.
     */
    resolveConfigFile: SyncFunction<typeof resolveConfigFile>;
  }

  interface CreateSynchronizedPrettierOptions {
    /**
     * Path or URL to prettier entry.
     */
    prettierEntry: string | URL;
  }
}

declare const prettierSync: prettierSync.PrettierSync & {
  createSynchronizedPrettier: (
    options: CreateSynchronizedPrettierOptions,
  ) => prettierSync.PrettierSync;
};

export = prettierSync;
