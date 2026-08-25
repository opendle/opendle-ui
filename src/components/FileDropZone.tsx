import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface FileDropZoneProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "onChange" | "title" | "type"
> {
  readonly browseLabel?: ReactNode;
  readonly description?: ReactNode;
  readonly inputLabel?: string;
  readonly onFiles: (files: readonly File[]) => void;
  readonly title: ReactNode;
}

function isFileDrag(types: readonly string[]): boolean {
  return Array.from(types).includes("Files");
}

export function FileDropZone({
  browseLabel = "Choose files",
  className,
  description,
  disabled = false,
  id,
  inputLabel,
  onFiles,
  title,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: FileDropZoneProps) {
  const generatedId = useId();
  const descriptionId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragActive, setDragActive] = useState(false);

  function emitFiles(files: readonly File[]) {
    if (disabled || files.length === 0) return;
    onFiles(files);
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    emitFiles(files);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event.dataTransfer.types)) return;
    event.preventDefault();
    dragDepth.current += 1;
    if (!disabled) setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event.dataTransfer.types)) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragActive(false);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event.dataTransfer.types)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? "none" : "copy";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event.dataTransfer.types)) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragActive(false);
    emitFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div
      className={["od-file-drop-zone", className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-drag-active={dragActive || undefined}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        {...inputProps}
        ref={inputRef}
        aria-describedby={
          [ariaDescribedBy, description ? descriptionId : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
        aria-label={inputLabel}
        className="od-file-drop-zone-input"
        disabled={disabled}
        id={inputId}
        onChange={selectFiles}
        type="file"
      />
      <label className="od-file-drop-zone-label" htmlFor={inputId}>
        <strong>{title}</strong>
        {description ? <span id={descriptionId}>{description}</span> : null}
        <span className="od-file-drop-zone-browse">{browseLabel}</span>
      </label>
    </div>
  );
}
