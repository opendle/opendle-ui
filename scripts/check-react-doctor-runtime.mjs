import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { parseSync } from "oxc-parser";
import { ResolverFactory } from "oxc-resolver";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
for (const [name, version] of [
  ["react-doctor", "0.2.2"],
  ["oxlint", "1.76.0"],
  ["oxlint-plugin-react-doctor", "0.2.3"],
]) {
  const path = new URL(`../node_modules/${name}/package.json`, import.meta.url);
  assert.equal(JSON.parse(readFileSync(path, "utf8")).version, version);
}
assert.deepEqual(parseSync("fixture.js", "export const value = 1;").errors, []);
assert.equal(
  typeof ResolverFactory.default().sync(process.cwd(), "react").path,
  "string",
);
console.log("React Doctor rules and native runtime checks passed.");
