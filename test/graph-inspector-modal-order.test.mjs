import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

test(
  "GraphInspector retains foreground modal control across mode changes",
  { timeout: 180_000 },
  async () => {
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        fileURLToPath(
          new URL(
            "../scripts/graph-inspector-modal-order-browser.mjs",
            import.meta.url,
          ),
        ),
      ],
      { timeout: 170_000, maxBuffer: 1024 * 1024 },
    );
    assert.equal(JSON.parse(stdout).cases, 22);
  },
);
