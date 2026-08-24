import { useId, type HTMLAttributes, type ReactNode } from "react";

import {
  ONTOLOGY_PAGE_LIMIT,
  assertBoundedItems,
  assertFiniteNumber,
  assertIdentifier,
  assertRfc3339DateTime,
  assertTextMaximum,
  assertUniqueIdentifiers,
  formatOntologyFileSize,
  type OntologyFileMetadata,
} from "../OntologyExplorerContract.js";

export type FileTransferState =
  "ready" | "uploading" | "downloading" | "failed";

export interface ManagedFileItem {
  readonly metadata: OntologyFileMetadata;
  readonly state?: FileTransferState;
  readonly progress?: number;
  readonly message?: string;
}

export interface ManagedFileListProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect" | "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly items: readonly ManagedFileItem[];
  readonly selectedId?: string;
  readonly onSelect?: (file: OntologyFileMetadata) => void;
  readonly empty?: ReactNode;
  readonly nextPage?: ReactNode;
}

function hasForbiddenFileNameCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      character === "/" ||
      character === "\\" ||
      codePoint === undefined ||
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f)
    ) {
      return true;
    }
  }
  return false;
}

function validateFiles(items: readonly ManagedFileItem[]) {
  assertBoundedItems("Managed files", items, ONTOLOGY_PAGE_LIMIT);
  assertUniqueIdentifiers(
    "Managed file identifier",
    items.map((item) => item.metadata.fileId),
  );
  for (const item of items) {
    const file = item.metadata;
    assertTextMaximum("Managed file identifier", file.fileId, 200);
    assertIdentifier("Managed file name", file.name);
    assertTextMaximum("Managed file name", file.name, 255);
    if (hasForbiddenFileNameCharacter(file.name)) {
      throw new TypeError("Managed file name contains a forbidden character.");
    }
    assertIdentifier("Managed file media type", file.mediaType);
    assertTextMaximum("Managed file media type", file.mediaType, 200);
    if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(file.mediaType)) {
      throw new TypeError("Managed file media type is invalid.");
    }
    formatOntologyFileSize(file.size);
    if (file.size > 10_485_760) {
      throw new RangeError(
        "Managed file size exceeds the public 10 MiB maximum.",
      );
    }
    if (!/^[0-9a-f]{64}$/.test(file.sha256)) {
      throw new TypeError(
        "Managed file SHA-256 must use 64 lowercase hexadecimal characters.",
      );
    }
    assertRfc3339DateTime("Managed file creation time", file.createdAt);
    const state: unknown = item.state;
    if (
      state !== undefined &&
      state !== "ready" &&
      state !== "uploading" &&
      state !== "downloading" &&
      state !== "failed"
    ) {
      throw new TypeError("Managed file transfer state is invalid.");
    }
    if (item.message !== undefined) {
      assertTextMaximum("Managed file transfer message", item.message, 2_000);
    }
    if (item.progress !== undefined) {
      assertFiniteNumber("Managed file transfer progress", item.progress);
      if (item.progress < 0 || item.progress > 100) {
        throw new RangeError(
          "Managed file transfer progress must be from 0 to 100.",
        );
      }
    }
  }
}

/** A bounded file metadata and transfer-state list. Hosts own byte transfer. */
export function ManagedFileList({
  className,
  description,
  empty,
  items,
  nextPage,
  onSelect,
  selectedId,
  title,
  ...props
}: ManagedFileListProps) {
  validateFiles(items);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <section
      {...props}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={["od-managed-files", className].filter(Boolean).join(" ")}
    >
      <header className="od-managed-files-heading">
        <h2 id={titleId}>{title}</h2>
        {description ? <p id={descriptionId}>{description}</p> : null}
      </header>
      {items.length === 0 ? (
        <output className="od-managed-files-empty">{empty}</output>
      ) : (
        <ul className="od-managed-file-list">
          {items.map(
            ({ metadata: file, message, progress, state = "ready" }) => {
              const content = (
                <>
                  <span aria-hidden="true" className="od-managed-file-icon" />
                  <span className="od-managed-file-copy">
                    <strong>{file.name}</strong>
                    <span>
                      {file.mediaType} · {formatOntologyFileSize(file.size)}
                    </span>
                    <code>{file.fileId}</code>
                    <code className="od-managed-file-digest">
                      <span className="od-visually-hidden">SHA-256 </span>
                      {file.sha256}
                    </code>
                    {file.createdAt ? (
                      <time dateTime={file.createdAt}>{file.createdAt}</time>
                    ) : null}
                  </span>
                  <span
                    aria-live={state === "failed" ? "assertive" : "polite"}
                    className="od-managed-file-state"
                    data-state={state}
                  >
                    <span>{message ?? state}</span>
                    {progress === undefined &&
                    state !== "uploading" &&
                    state !== "downloading" ? null : (
                      <progress
                        aria-label={`${file.name} transfer progress`}
                        max={100}
                        value={progress}
                      >
                        {progress === undefined ? null : `${String(progress)}%`}
                      </progress>
                    )}
                  </span>
                </>
              );
              return (
                <li
                  data-selected={selectedId === file.fileId}
                  key={file.fileId}
                >
                  {onSelect ? (
                    <button
                      aria-label={`Open ${file.name}`}
                      aria-pressed={selectedId === file.fileId}
                      onClick={() => {
                        onSelect(file);
                      }}
                      type="button"
                    >
                      {content}
                    </button>
                  ) : (
                    <article>{content}</article>
                  )}
                </li>
              );
            },
          )}
        </ul>
      )}
      {nextPage ? (
        <footer className="od-managed-files-pagination">{nextPage}</footer>
      ) : null}
    </section>
  );
}
