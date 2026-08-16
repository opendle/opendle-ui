import { cpSync, existsSync, readFileSync } from "node:fs";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const helperRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const consumerRoot = process.cwd();
const requiredExports = [
  "AccountMenu",
  "AgentSidebar",
  "AttentionRow",
  "CalendarBoard",
  "HealthBar",
  "MobileNavigation",
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
    throw new Error(`Cannot find ${packageName} from ${consumerRoot}. Run npm install first.`);
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
  return candidates.find((candidate) => isSharedPackage(candidate) && existsSync(join(candidate, "src/index.tsx"))) ?? null;
}

function buildSource(sourceRoot) {
  const compiler = join(sourceRoot, "node_modules/typescript/bin/tsc");
  if (!existsSync(compiler)) {
    throw new Error(`Cannot build @opendle/ui at ${sourceRoot}: TypeScript is not installed there.`);
  }
  execFileSync(process.execPath, [compiler, "--project", join(sourceRoot, "tsconfig.build.json")], {
    cwd: sourceRoot,
    stdio: "inherit",
  });
}

function lockName(sourceRoot) {
  const digest = createHash("sha256").update(resolve(sourceRoot)).digest("hex").slice(0, 16);
  return join("/tmp", `opendle-ui-build-${digest}.lock`);
}

async function withBuildLock(sourceRoot, action) {
  const lock = lockName(sourceRoot);
  const staleAfter = 5 * 60 * 1000;
  while (true) {
    try {
      mkdirSync(lock);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        if (Date.now() - statSync(lock).mtimeMs > staleAfter) rmSync(lock, { recursive: true, force: true });
      } catch {
        // The lock can disappear between the check and the read.
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
  }
  try {
    return await action();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

function syncBuild(sourceRoot, installedRoot) {
  if (resolve(sourceRoot) === resolve(installedRoot)) return;
  cpSync(join(sourceRoot, "dist"), join(installedRoot, "dist"), { recursive: true, force: true });
  cpSync(join(sourceRoot, "styles"), join(installedRoot, "styles"), { recursive: true, force: true });
}

async function verify(installedRoot, expectedRoot = null) {
  const query = `?consumer-check=${Date.now()}`;
  const installedEntry = pathToFileURL(join(installedRoot, "dist/index.js")).href;
  const installed = await import(`${installedEntry}${query}`);
  const expected = expectedRoot
    ? await import(`${pathToFileURL(join(expectedRoot, "dist/index.js")).href}${query}`)
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
  console.log("No local @opendle/ui source found. Checking the installed package.");
  await verify(installedRoot);
}
console.log("@opendle/ui exports are ready for this consumer.");
