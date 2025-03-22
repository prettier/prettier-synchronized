type Prettier = typeof import("prettier");
type SynchronizedPrettier = typeof import("./index.cjs");

export function createSynchronizedPrettier(options: {
  prettierEntry: string | URL;
}): SynchronizedPrettier;

declare const synchronizedPrettier: SynchronizedPrettier;
export default synchronizedPrettier;
