import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { GraphInspectorFacts } from "../dist/index.js";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const browserCheck = fileURLToPath(
  new URL("../scripts/graph-inspector-facts-browser.mjs", import.meta.url),
);

test(
  "built GraphInspectorFacts selects tracks from live rendered text fit",
  { timeout: 120_000 },
  async () => {
    assert.equal(typeof GraphInspectorFacts, "function");
    const { stdout } = await run(process.execPath, [browserCheck], {
      cwd: root,
      maxBuffer: 1024 * 1024,
      timeout: 110_000,
    });
    const report = JSON.parse(stdout);
    assert.equal(report.axeCases, 7);
    assert.deepEqual(
      report.cases.map(({ mode, scale }) => [mode, scale]),
      [
        ["split", 1],
        ["overlay", 1],
        ["sheet", 1],
        ["split", 2],
        ["overlay", 2],
        ["sheet", 2],
        ["sheet", 2],
      ],
    );
    assert.equal(report.cases.at(-1).phone, true);
    assert.equal(report.screenshots.length, 7);
    const evidenceDirectory = resolve(report.screenshotDirectory);
    for (const path of report.screenshots) {
      assert.equal(dirname(resolve(path)), evidenceDirectory);
      assert.match(basename(path), /^[a-z0-9-]+\.png$/u);
      await access(path);
    }
    await access(join(evidenceDirectory, "results.json"));
  },
);
