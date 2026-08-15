import { useLayoutEffect, useRef } from "react";
import type { InputEvent as ReactInputEvent, TextareaHTMLAttributes } from "react";

export interface AutoGrowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly maxHeight?: number;
}

function resizeTextarea(textarea: HTMLTextAreaElement | null, maxHeight: number) {
  if (!textarea) return;
  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}

export function AutoGrowTextarea({
  maxHeight = 240,
  onInput,
  rows = 2,
  style,
  value,
  defaultValue,
  ...props
}: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    resizeTextarea(textareaRef.current, maxHeight);
  }, [defaultValue, maxHeight, value]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || typeof ResizeObserver === "undefined") return;
    let observedWidth = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width === observedWidth) return;
      observedWidth = entry.contentRect.width;
      resizeTextarea(textarea, maxHeight);
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [maxHeight]);

  function resizeForContent(event: ReactInputEvent<HTMLTextAreaElement>) {
    resizeTextarea(event.currentTarget, maxHeight);
    onInput?.(event);
  }

  return (
    <textarea
      {...props}
      ref={textareaRef}
      rows={rows}
      value={value}
      defaultValue={defaultValue}
      onInput={resizeForContent}
      style={{
        ...style,
        height: "auto",
        minHeight: 0,
        maxHeight,
        overflowY: "hidden",
        resize: "none",
      }}
    />
  );
}
