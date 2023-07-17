type Prettier = typeof import("prettier");

type SynchronizedPrettier = {
  // Prettier static properties
  version: Prettier["version"];
  util: Prettier["util"];
  doc: Prettier["doc"];

  // Prettier functions
  formatWithCursor: PrettierSynchronizedFunction<"formatWithCursor">;
  format: PrettierSynchronizedFunction<"format">;
  check: PrettierSynchronizedFunction<"check">;
  resolveConfig: PrettierSynchronizedFunction<"resolveConfig">;
  resolveConfigFile: PrettierSynchronizedFunction<"resolveConfigFile">;
  clearConfigCache: PrettierSynchronizedFunction<"clearConfigCache">;
  getFileInfo: PrettierSynchronizedFunction<"getFileInfo">;
  getSupportInfo: PrettierSynchronizedFunction<"getSupportInfo">;
};

type PrettierSynchronizedFunction<
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

declare const synchronizedPrettier: SynchronizedPrettier & {
  createSynchronizedPrettier: (options: {
    prettierEntry: string | URL;
  }) => SynchronizedPrettier;
};

export = synchronizedPrettier;
