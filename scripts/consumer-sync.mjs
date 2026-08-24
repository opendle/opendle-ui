import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
} from "node:fs";
import { isAbsolute, join, relative, sep } from "node:path";

function pathState(path, { allowMissing = false } = {}) {
  try {
    const state = lstatSync(path);
    if (state.isSymbolicLink()) {
      throw new TypeError(
        `The shared UI sync path is a symbolic link: ${path}`,
      );
    }
    return state;
  } catch (error) {
    if (allowMissing && error.code === "ENOENT") return null;
    throw error;
  }
}

function directoryState(path, options) {
  const state = pathState(path, options);
  if (state !== null && !state.isDirectory()) {
    throw new TypeError(`The shared UI sync path is not a directory: ${path}`);
  }
  return state;
}

function validateTree(root, { allowMissing = false } = {}) {
  const rootState = directoryState(root, { allowMissing });
  if (rootState === null) return null;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    const state = pathState(path);
    if (state.isDirectory()) {
      validateTree(path);
    } else if (!state.isFile()) {
      throw new TypeError(
        `The shared UI sync tree contains an unsupported entry: ${path}`,
      );
    } else if (state.nlink !== 1) {
      throw new TypeError(
        `The shared UI sync tree contains a hard-linked file: ${path}`,
      );
    }
  }
  return rootState;
}

function isNestedPath(parent, candidate) {
  const difference = relative(parent, candidate);
  return (
    difference !== "" &&
    difference !== ".." &&
    !difference.startsWith(`..${sep}`) &&
    !isAbsolute(difference)
  );
}

function validateRoots(sourceRoot, installedRoot) {
  const sourceState = directoryState(sourceRoot);
  const installedState = directoryState(installedRoot);
  if (
    sourceState.dev === installedState.dev &&
    sourceState.ino === installedState.ino
  ) {
    return false;
  }
  const sourceReal = realpathSync(sourceRoot);
  const installedReal = realpathSync(installedRoot);
  if (
    isNestedPath(sourceReal, installedReal) ||
    isNestedPath(installedReal, sourceReal)
  ) {
    throw new TypeError(
      "The shared UI source and installed package must be separate directories.",
    );
  }
  return true;
}

export function isSameDirectory(left, right) {
  const leftState = directoryState(left);
  const rightState = directoryState(right, { allowMissing: true });
  return (
    rightState !== null &&
    leftState.dev === rightState.dev &&
    leftState.ino === rightState.ino
  );
}

export function syncConsumerDirectories(
  sourceRoot,
  installedRoot,
  { copy = cpSync, rename = renameSync } = {},
) {
  if (!validateRoots(sourceRoot, installedRoot)) return;
  const directories = ["dist", "styles"].filter((directory) => {
    const source = join(sourceRoot, directory);
    const destination = join(installedRoot, directory);
    validateTree(source);
    validateTree(destination, { allowMissing: true });
    return !isSameDirectory(source, destination);
  });
  if (directories.length === 0) return;

  const temporaryRoot = mkdtempSync(join(installedRoot, ".opendle-ui-sync-"));
  const stagedRoot = join(temporaryRoot, "staged");
  const previousRoot = join(temporaryRoot, "previous");
  const replacements = [];
  let rollbackComplete = true;
  try {
    mkdirSync(stagedRoot);
    mkdirSync(previousRoot);
    for (const directory of directories) {
      const source = join(sourceRoot, directory);
      const staged = join(stagedRoot, directory);
      copy(source, staged, { recursive: true, force: true });
      validateTree(staged);
    }
    for (const directory of directories) {
      const destination = join(installedRoot, directory);
      const previous = join(previousRoot, directory);
      const hadPrevious =
        directoryState(destination, { allowMissing: true }) !== null;
      if (hadPrevious) rename(destination, previous);
      const replacement = { directory, hadPrevious, installed: false };
      replacements.push(replacement);
      rename(join(stagedRoot, directory), destination);
      replacement.installed = true;
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const replacement of replacements.reverse()) {
      const destination = join(installedRoot, replacement.directory);
      const previous = join(previousRoot, replacement.directory);
      try {
        if (replacement.installed) {
          validateTree(destination);
          rmSync(destination, { recursive: true });
        }
        if (replacement.hadPrevious) renameSync(previous, destination);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    rollbackComplete = rollbackErrors.length === 0;
    if (!rollbackComplete) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        "The shared UI sync failed and could not restore all prior files.",
      );
    }
    throw error;
  } finally {
    if (rollbackComplete)
      rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
