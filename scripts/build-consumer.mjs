import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import { syncConsumerDirectories } from "./consumer-sync.mjs";

const helperRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const consumerRoot = process.cwd();
const requiredExports = [
  "AccountMenu",
  "AgentSidebar",
  "AttentionRow",
  "CalendarBoard",
  "ConfirmationDialog",
  "HealthBar",
  "MobileNavigation",
  "MediaLightbox",
  "NavigationItem",
  "NavigationLink",
  "Panel",
  "ReviewPlanCard",
  "Toast",
  "WorkspaceSelector",
];

function packageRoot(packageName) {
  const consumerPackage = join(consumerRoot, "package.json");
  const requireFromConsumer = createRequire(pathToFileURL(consumerPackage));
  try {
    return dirname(requireFromConsumer.resolve(`${packageName}/package.json`));
  } catch {
    throw new Error(
      `Cannot find ${packageName} from ${consumerRoot}. Run npm install first.`,
    );
  }
}

function isSharedPackage(candidate) {
  const packageFile = join(candidate, "package.json");
  if (!existsSync(packageFile)) return false;
  try {
    return JSON.parse(readFileSync(packageFile, "utf8")).name === "@opendle/ui";
  } catch {
    return false;
  }
}

function findSourceRoot() {
  const candidates = [
    process.env.OPENDLE_UI_PATH,
    resolve(consumerRoot, "../opendle-ui"),
    resolve(consumerRoot, "../../opendle-ui"),
    helperRoot,
  ].filter(Boolean);
  return (
    candidates.find(
      (candidate) =>
        isSharedPackage(candidate) &&
        existsSync(join(candidate, "src/index.tsx")),
    ) ?? null
  );
}

function buildSource(sourceRoot) {
  const compiler = join(sourceRoot, "node_modules/typescript/bin/tsc");
  if (!existsSync(compiler)) {
    throw new Error(
      `Cannot build @opendle/ui at ${sourceRoot}: TypeScript is not installed there.`,
    );
  }
  execFileSync(
    process.execPath,
    [compiler, "--project", join(sourceRoot, "tsconfig.build.json")],
    {
      cwd: sourceRoot,
      stdio: "inherit",
    },
  );
}

function lockName(sourceRoot) {
  return join(sourceRoot, "node_modules/.cache/opendle-ui-build.lock");
}

async function withBuildLock(sourceRoot, action) {
  const lock = lockName(sourceRoot);
  const ownerFile = join(lock, "owner");
  const ownerIdentity = `${process.pid} ${randomUUID()}\n`;
  const staleAfter = 30 * 60 * 1000;
  mkdirSync(dirname(lock), { recursive: true });
  while (true) {
    try {
      mkdirSync(lock);
      try {
        writeFileSync(ownerFile, ownerIdentity, { flag: "wx" });
      } catch (ownerError) {
        rmSync(lock, { recursive: true, force: true });
        throw ownerError;
      }
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      let ownerIsActive = false;
      let ownerWasRead = false;
      try {
        const [ownerText] = readFileSync(ownerFile, "utf8")
          .trim()
          .split(/\s+/u);
        const owner = Number(ownerText);
        ownerIsActive = Number.isSafeInteger(owner) && owner > 0;
        if (ownerIsActive) {
          ownerWasRead = true;
          try {
            process.kill(owner, 0);
          } catch (ownerError) {
            ownerIsActive = ownerError.code !== "ESRCH";
          }
        }
      } catch {
        // A new lock can exist briefly before its owner file is ready.
      }
      try {
        const lockAge = Date.now() - statSync(lock).mtimeMs;
        if ((ownerWasRead && !ownerIsActive) || lockAge > staleAfter)
          rmSync(lock, { recursive: true, force: true });
      } catch {
        // The lock can disappear between the owner and age checks.
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
  }
  try {
    return await action();
  } finally {
    try {
      if (readFileSync(ownerFile, "utf8") === ownerIdentity)
        rmSync(lock, { recursive: true, force: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

function syncBuild(sourceRoot, installedRoot) {
  if (resolve(sourceRoot) === resolve(installedRoot)) return;
  try {
    syncConsumerDirectories(sourceRoot, installedRoot);
  } catch (error) {
    if (error.code === "EACCES" || error.code === "EROFS") {
      console.warn(
        "The installed @opendle/ui package is read-only. Export verification will confirm it is current.",
      );
      return;
    }
    throw error;
  }
}

async function verify(installedRoot, expectedRoot = null) {
  const query = `?consumer-check=${Date.now()}`;
  const installedEntry = pathToFileURL(
    join(installedRoot, "dist/index.js"),
  ).href;
  const installed = await import(`${installedEntry}${query}`);
  const expected = expectedRoot
    ? await import(
        `${pathToFileURL(join(expectedRoot, "dist/index.js")).href}${query}`
      )
    : null;
  const expectedExports = expected ? Object.keys(expected) : requiredExports;
  const missing = expectedExports.filter((name) => !(name in installed));
  if (missing.length > 0) {
    throw new Error(
      `@opendle/ui is missing exports: ${missing.join(", ")}. ` +
        "Refresh the Git dependency or set OPENDLE_UI_PATH to the shared repository.",
    );
  }
}

const installedRoot = packageRoot("@opendle/ui");
const sourceRoot = findSourceRoot();

if (sourceRoot) {
  await withBuildLock(sourceRoot, async () => {
    buildSource(sourceRoot);
    syncBuild(sourceRoot, installedRoot);
    await verify(installedRoot, sourceRoot);
  });
  console.log(`Built @opendle/ui from ${sourceRoot}.`);
} else {
  console.log(
    "No local @opendle/ui source found. Checking the installed package.",
  );
  await verify(installedRoot);
}
console.log("@opendle/ui exports are ready for this consumer.");
