import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useRef, useState, } from "react";
function isFileDrag(types) {
    return Array.from(types).includes("Files");
}
export function FileDropZone({ browseLabel = "Choose files", className, description, disabled = false, id, inputLabel, onFiles, title, "aria-describedby": ariaDescribedBy, ...inputProps }) {
    const generatedId = useId();
    const descriptionId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef(null);
    const dragDepth = useRef(0);
    const [dragActive, setDragActive] = useState(false);
    function emitFiles(files) {
        if (disabled || files.length === 0)
            return;
        onFiles(files);
    }
    function selectFiles(event) {
        const files = Array.from(event.currentTarget.files ?? []);
        event.currentTarget.value = "";
        emitFiles(files);
    }
    function handleDragEnter(event) {
        if (!isFileDrag(event.dataTransfer.types))
            return;
        event.preventDefault();
        dragDepth.current += 1;
        if (!disabled)
            setDragActive(true);
    }
    function handleDragLeave(event) {
        if (!isFileDrag(event.dataTransfer.types))
            return;
        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0)
            setDragActive(false);
    }
    function handleDragOver(event) {
        if (!isFileDrag(event.dataTransfer.types))
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = disabled ? "none" : "copy";
    }
    function handleDrop(event) {
        if (!isFileDrag(event.dataTransfer.types))
            return;
        event.preventDefault();
        dragDepth.current = 0;
        setDragActive(false);
        emitFiles(Array.from(event.dataTransfer.files));
    }
    return (_jsxs("div", { className: ["od-file-drop-zone", className].filter(Boolean).join(" "), "data-disabled": disabled || undefined, "data-drag-active": dragActive || undefined, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, children: [_jsx("input", { ...inputProps, ref: inputRef, "aria-describedby": [ariaDescribedBy, description ? descriptionId : undefined]
                    .filter(Boolean)
                    .join(" ") || undefined, "aria-label": inputLabel, className: "od-file-drop-zone-input", disabled: disabled, id: inputId, onChange: selectFiles, type: "file" }), _jsxs("label", { className: "od-file-drop-zone-label", htmlFor: inputId, children: [_jsx("strong", { children: title }), description ? _jsx("span", { id: descriptionId, children: description }) : null, _jsx("span", { className: "od-file-drop-zone-browse", children: browseLabel })] })] }));
}
//# sourceMappingURL=FileDropZone.js.map