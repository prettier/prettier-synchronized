type Prettier = typeof import("prettier");

type SynchronizedPrettier = {
  // Prettier static properties
  version: Prettier["version"];
  util: Prettier["util"];
  doc: Prettier["doc"];

  // Prettier functions
  formatWithCursor: PrettierSyncFunction<"formatWithCursor">;
  format: PrettierSyncFunction<"format">;
  check: PrettierSyncFunction<"check">;
  resolveConfig: PrettierSyncFunction<"resolveConfig">;
  resolveConfigFile: PrettierSyncFunction<"resolveConfigFile">;
  clearConfigCache: PrettierSyncFunction<"clearConfigCache">;
  getFileInfo: PrettierSyncFunction<"getFileInfo">;
  getSupportInfo: PrettierSyncFunction<"getSupportInfo">;
};

type PrettierSyncFunction<
  FunctionName extends
    | "formatWithCursor"
    | "format"
    | "check"
    | "resolveConfig"
    | "resolveConfigFile"
    | "clearConfigCache"
    | "getFileInfo"
    | "getSupportInfo",
> = (
  ...args: Parameters<Prettier[FunctionName]>
) => Awaited<ReturnType<Prettier[FunctionName]>>;

declare const prettierSync: SynchronizedPrettier & {
  createSynchronizedPrettier: (options: {
    prettierEntry: string | URL;
  }) => SynchronizedPrettier;
};

export = prettierSync;
