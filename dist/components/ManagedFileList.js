import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId } from "react";
import { ONTOLOGY_PAGE_LIMIT, assertBoundedItems, assertFiniteNumber, assertIdentifier, assertRfc3339DateTime, assertTextMaximum, assertUniqueIdentifiers, formatOntologyFileSize, } from "../OntologyExplorerContract.js";
function hasForbiddenFileNameCharacter(value) {
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (character === "/" ||
            character === "\\" ||
            codePoint === undefined ||
            codePoint <= 0x1f ||
            (codePoint >= 0x7f && codePoint <= 0x9f)) {
            return true;
        }
    }
    return false;
}
function validateFiles(items) {
    assertBoundedItems("Managed files", items, ONTOLOGY_PAGE_LIMIT);
    assertUniqueIdentifiers("Managed file identifier", items.map((item) => item.metadata.fileId));
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
            throw new RangeError("Managed file size exceeds the public 10 MiB maximum.");
        }
        if (!/^[0-9a-f]{64}$/.test(file.sha256)) {
            throw new TypeError("Managed file SHA-256 must use 64 lowercase hexadecimal characters.");
        }
        assertRfc3339DateTime("Managed file creation time", file.createdAt);
        const state = item.state;
        if (state !== undefined &&
            state !== "ready" &&
            state !== "uploading" &&
            state !== "downloading" &&
            state !== "failed") {
            throw new TypeError("Managed file transfer state is invalid.");
        }
        if (item.message !== undefined) {
            assertTextMaximum("Managed file transfer message", item.message, 2_000);
        }
        if (item.progress !== undefined) {
            assertFiniteNumber("Managed file transfer progress", item.progress);
            if (item.progress < 0 || item.progress > 100) {
                throw new RangeError("Managed file transfer progress must be from 0 to 100.");
            }
        }
    }
}
/** A bounded file metadata and transfer-state list. Hosts own byte transfer. */
export function ManagedFileList({ className, description, empty, items, nextPage, onSelect, selectedId, title, ...props }) {
    validateFiles(items);
    const titleId = useId();
    const descriptionId = useId();
    return (_jsxs("section", { ...props, "aria-describedby": description ? descriptionId : undefined, "aria-labelledby": titleId, className: ["od-managed-files", className].filter(Boolean).join(" "), children: [_jsxs("header", { className: "od-managed-files-heading", children: [_jsx("h2", { id: titleId, children: title }), description ? _jsx("p", { id: descriptionId, children: description }) : null] }), items.length === 0 ? (_jsx("output", { className: "od-managed-files-empty", children: empty })) : (_jsx("ul", { className: "od-managed-file-list", children: items.map(({ metadata: file, message, progress, state = "ready" }) => {
                    const content = (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", className: "od-managed-file-icon" }), _jsxs("span", { className: "od-managed-file-copy", children: [_jsx("strong", { children: file.name }), _jsxs("span", { children: [file.mediaType, " \u00B7 ", formatOntologyFileSize(file.size)] }), _jsx("code", { children: file.fileId }), _jsxs("code", { className: "od-managed-file-digest", children: [_jsx("span", { className: "od-visually-hidden", children: "SHA-256 " }), file.sha256] }), file.createdAt ? (_jsx("time", { dateTime: file.createdAt, children: file.createdAt })) : null] }), _jsxs("span", { "aria-live": state === "failed" ? "assertive" : "polite", className: "od-managed-file-state", "data-state": state, children: [_jsx("span", { children: message ?? state }), progress === undefined &&
                                        state !== "uploading" &&
                                        state !== "downloading" ? null : (_jsx("progress", { "aria-label": `${file.name} transfer progress`, max: 100, value: progress, children: progress === undefined ? null : `${String(progress)}%` }))] })] }));
                    return (_jsx("li", { "data-selected": selectedId === file.fileId, children: onSelect ? (_jsx("button", { "aria-label": `Open ${file.name}`, "aria-pressed": selectedId === file.fileId, onClick: () => {
                                onSelect(file);
                            }, type: "button", children: content })) : (_jsx("article", { children: content })) }, file.fileId));
                }) })), nextPage ? (_jsx("footer", { className: "od-managed-files-pagination", children: nextPage })) : null] }));
}
//# sourceMappingURL=ManagedFileList.js.map