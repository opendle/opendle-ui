import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  renameSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  isSameDirectory,
  syncConsumerDirectories,
} from "../scripts/consumer-sync.mjs";

function fixture(testContext) {
  const root = mkdtempSync(join(tmpdir(), "opendle-ui-consumer-sync-"));
  testContext.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, "source");
  mkdirSync(join(source, "dist"), { recursive: true });
  mkdirSync(join(source, "styles"));
  writeFileSync(
    join(source, "dist", "index.js"),
    "export const ready = true;\n",
  );
  writeFileSync(join(source, "styles", "tokens.css"), ":root {}\n");
  return { root, source };
}

test("same-inode directory aliases do not copy or remove package data", (testContext) => {
  const { root, source } = fixture(testContext);
  mkdirSync(join(root, "alias"));
  const secondPath = join(root, "alias", "..", "source");
  let copies = 0;
  syncConsumerDirectories(source, secondPath, {
    copy: () => {
      copies += 1;
    },
  });
  assert.equal(copies, 0);
  assert.equal(
    isSameDirectory(join(source, "dist"), join(secondPath, "dist")),
    true,
  );
  assert.equal(
    readFileSync(join(source, "dist", "index.js"), "utf8"),
    "export const ready = true;\n",
  );
});

test("distinct consumer directories receive the built package data", (testContext) => {
  const { root, source } = fixture(testContext);
  const installed = join(root, "installed");
  mkdirSync(installed);
  syncConsumerDirectories(source, installed);
  assert.equal(
    readFileSync(join(installed, "dist", "index.js"), "utf8"),
    "export const ready = true;\n",
  );
  assert.equal(
    readFileSync(join(installed, "styles", "tokens.css"), "utf8"),
    ":root {}\n",
  );
});

test("consumer sync removes obsolete built files", (testContext) => {
  const { root, source } = fixture(testContext);
  const installed = join(root, "installed");
  mkdirSync(join(installed, "dist"), { recursive: true });
  mkdirSync(join(installed, "styles"));
  writeFileSync(join(installed, "dist", "obsolete.js"), "unsafe\n");
  writeFileSync(join(installed, "styles", "obsolete.css"), "unsafe\n");
  syncConsumerDirectories(source, installed);
  assert.throws(() => readFileSync(join(installed, "dist", "obsolete.js")), {
    code: "ENOENT",
  });
  assert.throws(() => readFileSync(join(installed, "styles", "obsolete.css")), {
    code: "ENOENT",
  });
});

test("consumer sync preserves installed data when a staged copy fails", (testContext) => {
  const { root, source } = fixture(testContext);
  const installed = join(root, "installed");
  mkdirSync(join(installed, "dist"), { recursive: true });
  mkdirSync(join(installed, "styles"));
  writeFileSync(join(installed, "dist", "index.js"), "previous\n");
  writeFileSync(join(installed, "styles", "tokens.css"), "previous\n");
  assert.throws(() => {
    let copies = 0;
    syncConsumerDirectories(source, installed, {
      copy: (...arguments_) => {
        copies += 1;
        if (copies === 2) throw new Error("copy failed");
        cpSync(...arguments_);
      },
    });
  }, /copy failed/u);
  assert.equal(
    readFileSync(join(installed, "dist", "index.js"), "utf8"),
    "previous\n",
  );
  assert.equal(
    readFileSync(join(installed, "styles", "tokens.css"), "utf8"),
    "previous\n",
  );
  assert.deepEqual(
    readdirSync(installed).filter((name) =>
      name.startsWith(".opendle-ui-sync-"),
    ),
    [],
  );
});

test("missing and symbolic-link paths fail safely", (testContext) => {
  const { root, source } = fixture(testContext);
  const missing = join(root, "missing");
  assert.throws(
    () => syncConsumerDirectories(missing, join(root, "installed")),
    { code: "ENOENT" },
  );
  const unsafe = join(root, "unsafe");
  mkdirSync(unsafe);
  symlinkSync(join(source, "dist"), join(unsafe, "dist"));
  mkdirSync(join(unsafe, "styles"));
  const installed = join(root, "installed");
  mkdirSync(installed);
  assert.throws(
    () => syncConsumerDirectories(unsafe, installed),
    /symbolic link/u,
  );
  symlinkSync(join(source, "dist"), join(installed, "dist"));
  assert.throws(
    () => syncConsumerDirectories(source, installed),
    /symbolic link/u,
  );
  const unsafeRoot = join(root, "unsafe-installed");
  symlinkSync(installed, unsafeRoot);
  assert.throws(
    () => syncConsumerDirectories(source, unsafeRoot),
    /symbolic link/u,
  );
});

test("nested links and hard-linked files fail before replacement", (testContext) => {
  const { root, source } = fixture(testContext);
  const installed = join(root, "installed");
  mkdirSync(installed);
  symlinkSync(
    join(source, "styles", "tokens.css"),
    join(source, "dist", "unsafe"),
  );
  assert.throws(
    () => syncConsumerDirectories(source, installed),
    /symbolic link/u,
  );
  rmSync(join(source, "dist", "unsafe"));
  linkSync(
    join(source, "dist", "index.js"),
    join(source, "dist", "hard-link.js"),
  );
  assert.throws(
    () => syncConsumerDirectories(source, installed),
    /hard-linked file/u,
  );
  assert.deepEqual(readdirSync(installed), []);
});

test("nested package roots fail before replacement", (testContext) => {
  const { source } = fixture(testContext);
  const installed = join(source, "installed");
  mkdirSync(installed);
  assert.throws(
    () => syncConsumerDirectories(source, installed),
    /must be separate directories/u,
  );
});

test("consumer sync restores both directories after each staged rename failure", (testContext) => {
  const { root, source } = fixture(testContext);
  const installed = join(root, "installed");
  mkdirSync(join(installed, "dist"), { recursive: true });
  mkdirSync(join(installed, "styles"));
  writeFileSync(join(installed, "dist", "index.js"), "previous dist\n");
  writeFileSync(join(installed, "styles", "tokens.css"), "previous styles\n");

  for (const failedRename of [2, 4]) {
    let renames = 0;
    assert.throws(
      () =>
        syncConsumerDirectories(source, installed, {
          rename: (...arguments_) => {
            renames += 1;
            if (renames === failedRename)
              throw new Error("staged rename failed");
            renameSync(...arguments_);
          },
        }),
      /staged rename failed/u,
    );
    assert.equal(
      readFileSync(join(installed, "dist", "index.js"), "utf8"),
      "previous dist\n",
    );
    assert.equal(
      readFileSync(join(installed, "styles", "tokens.css"), "utf8"),
      "previous styles\n",
    );
    assert.deepEqual(
      readdirSync(installed).filter((name) =>
        name.startsWith(".opendle-ui-sync-"),
      ),
      [],
    );
  }
});

test("consumer build replaces an expired lock that names an active process", (testContext) => {
  const { root, source } = fixture(testContext);
  mkdirSync(join(source, "src"));
  writeFileSync(join(source, "src", "index.tsx"), "export {};\n");
  writeFileSync(
    join(source, "package.json"),
    JSON.stringify({ name: "@opendle/ui", type: "module" }),
  );
  const compiler = join(source, "node_modules", "typescript", "bin", "tsc");
  mkdirSync(join(source, "node_modules", "typescript", "bin"), {
    recursive: true,
  });
  writeFileSync(
    compiler,
    "// The test fixture already contains built files.\n",
  );

  const lock = join(source, "node_modules", ".cache", "opendle-ui-build.lock");
  mkdirSync(lock, { recursive: true });
  writeFileSync(join(lock, "owner"), `${process.pid} prior-owner\n`);
  const expired = new Date(Date.now() - 31 * 60 * 1000);
  utimesSync(lock, expired, expired);

  const consumer = join(root, "consumer");
  const installed = join(consumer, "node_modules", "@opendle", "ui");
  mkdirSync(join(installed, "dist"), { recursive: true });
  mkdirSync(join(installed, "styles"));
  writeFileSync(join(consumer, "package.json"), '{"type":"module"}\n');
  writeFileSync(
    join(installed, "package.json"),
    JSON.stringify({ name: "@opendle/ui", type: "module" }),
  );
  writeFileSync(join(installed, "dist", "index.js"), "export {};\n");
  writeFileSync(join(installed, "styles", "tokens.css"), ":root {}\n");

  const buildConsumer = fileURLToPath(
    new URL("../scripts/build-consumer.mjs", import.meta.url),
  );
  execFileSync(process.execPath, [buildConsumer], {
    cwd: consumer,
    env: { ...process.env, OPENDLE_UI_PATH: source },
    timeout: 5_000,
  });
  assert.throws(() => readFileSync(join(lock, "owner")), { code: "ENOENT" });
});
