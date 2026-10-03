import { useId, useLayoutEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton.js";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect.js";

export interface OrderedChoiceItem {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly detail?: string;
}

export interface OrderedChoiceListProps {
  readonly label: string;
  readonly addLabel: string;
  readonly addPlaceholder?: string;
  readonly items: readonly OrderedChoiceItem[];
  readonly options: readonly SearchableSelectOption[];
  readonly disabled?: boolean;
  readonly maxItems?: number;
  readonly onAdd: (value: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onReorder: (ids: readonly string[]) => void;
}

function ActionIcon({
  kind,
}: {
  readonly kind: "grip" | "up" | "down" | "remove";
}) {
  const path = {
    grip: "M5 4h.01M11 4h.01M5 8h.01M11 8h.01M5 12h.01M11 12h.01",
    up: "M8 13V3M4 7l4-4 4 4",
    down: "M8 3v10M4 9l4 4 4-4",
    remove: "M4 4l8 8M12 4l-8 8",
  }[kind];
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={kind === "grip" ? 2.5 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

/** A compact controlled list with searchable additions and accessible reordering. */
export function OrderedChoiceList({
  label,
  addLabel,
  addPlaceholder,
  items,
  options,
  disabled = false,
  maxItems,
  onAdd,
  onRemove,
  onReorder,
}: OrderedChoiceListProps) {
  const instructionId = useId();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const addRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const pendingAddValue = useRef<string | null>(null);
  const pointerDrag = useRef<{
    id: string;
    pointerId: number;
    startY: number;
    targetIndex: number;
    started: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const ids = new Set(items.map((item) => item.id));
  if (
    ids.size !== items.length ||
    items.some((item) => !item.id.trim() || !item.label.trim())
  )
    throw new Error(
      "Ordered choices must have unique non-empty IDs and labels.",
    );
  if (
    maxItems !== undefined &&
    (!Number.isSafeInteger(maxItems) || maxItems < 1)
  )
    throw new Error("Ordered choice maximum must be a positive integer.");
  if (new Set(options.map((option) => option.value)).size !== options.length)
    throw new Error("Ordered choice option values must be unique.");
  const selectedValues = new Set(items.map((item) => item.value));
  const available = options.filter(
    (option) => !selectedValues.has(option.value),
  );
  const canAdd =
    !disabled &&
    (maxItems === undefined || items.length < maxItems) &&
    available.some((option) => !option.disabled && option.value !== "");

  useLayoutEffect(() => {
    const addedValue = pendingAddValue.current;
    if (addedValue !== null) {
      pendingAddValue.current = null;
      if (!canAdd) {
        pendingFocus.current =
          [...items].reverse().find((item) => item.value === addedValue)?.id ??
          null;
      }
    }
    if (pendingFocus.current === null) return;
    const row = rowRefs.current.get(pendingFocus.current);
    pendingFocus.current = null;
    const target =
      row?.querySelector<HTMLButtonElement>("button:not(:disabled)") ??
      addRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)");
    target?.focus({ preventScroll: true });
  }, [items, canAdd]);

  function move(id: string, targetIndex: number) {
    if (disabled || targetIndex < 0 || targetIndex >= items.length) return;
    const fromIndex = items.findIndex((item) => item.id === id);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    const order = items.map((item) => item.id);
    order.splice(fromIndex, 1);
    order.splice(targetIndex, 0, id);
    pendingFocus.current = id;
    onReorder(order);
    setAnnouncement(
      `${items[fromIndex]?.label ?? "Item"} moved to position ${String(targetIndex + 1)}.`,
    );
  }

  return (
    <div className="od-ordered-choice-list">
      <span className="od-visually-hidden" id={instructionId}>
        Use the up and down arrow keys to change the position.
      </span>
      <ol aria-label={label} className="od-ordered-choice-items">
        {items.map((item, index) => (
          <li
            className="od-ordered-choice-item"
            data-moving={movingId === item.id}
            data-drop-target={dropTargetId === item.id}
            key={item.id}
            ref={(element) => {
              if (element) rowRefs.current.set(item.id, element);
              else rowRefs.current.delete(item.id);
            }}
          >
            {items.length > 1 ? (
              <IconButton
                className="od-ordered-choice-handle"
                aria-label={`Reorder ${item.label}`}
                aria-describedby={instructionId}
                aria-keyshortcuts="ArrowUp ArrowDown"
                title={`Reorder ${item.label}`}
                icon={<ActionIcon kind="grip" />}
                disabled={disabled}
                onPointerDown={(event) => {
                  if (disabled || event.button !== 0) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  pointerDrag.current = {
                    id: item.id,
                    pointerId: event.pointerId,
                    startY: event.clientY,
                    targetIndex: index,
                    started: false,
                  };
                }}
                onPointerMove={(event) => {
                  const drag = pointerDrag.current;
                  if (drag?.pointerId !== event.pointerId || disabled) return;
                  if (
                    !drag.started &&
                    Math.abs(event.clientY - drag.startY) < 4
                  )
                    return;
                  drag.started = true;
                  setMovingId(drag.id);
                  let nearest = Infinity;
                  for (const [candidateIndex, candidate] of items.entries()) {
                    const bounds = rowRefs.current
                      .get(candidate.id)
                      ?.getBoundingClientRect();
                    if (!bounds) continue;
                    const distance = Math.abs(
                      event.clientY - (bounds.top + bounds.height / 2),
                    );
                    if (distance < nearest) {
                      nearest = distance;
                      drag.targetIndex = candidateIndex;
                    }
                  }
                  setDropTargetId(items[drag.targetIndex]?.id ?? null);
                  const scroller =
                    event.currentTarget.closest<HTMLElement>(".od-dialog-body");
                  if (scroller) {
                    const bounds = scroller.getBoundingClientRect();
                    if (event.clientY < bounds.top + 32)
                      scroller.scrollTop -= 16;
                    else if (event.clientY > bounds.bottom - 32)
                      scroller.scrollTop += 16;
                  }
                }}
                onPointerUp={(event) => {
                  const drag = pointerDrag.current;
                  pointerDrag.current = null;
                  setMovingId(null);
                  setDropTargetId(null);
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  if (!drag?.started) return;
                  suppressClick.current = true;
                  move(drag.id, drag.targetIndex);
                }}
                onPointerCancel={() => {
                  pointerDrag.current = null;
                  setMovingId(null);
                  setDropTargetId(null);
                }}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  setAnnouncement(
                    `${item.label}. Use the up and down arrow keys to change the position.`,
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    event.preventDefault();
                    move(item.id, index + (event.key === "ArrowUp" ? -1 : 1));
                  } else if (event.key === "Escape" && movingId !== null) {
                    event.preventDefault();
                    event.stopPropagation();
                    pointerDrag.current = null;
                    setMovingId(null);
                    setDropTargetId(null);
                  }
                }}
              />
            ) : null}
            <span
              className="od-ordered-choice-position"
              aria-label={`Position ${String(index + 1)}`}
            >
              #{index + 1}
            </span>
            <span className="od-ordered-choice-name">
              <strong>{item.label}</strong>
              {item.detail ? <span>{item.detail}</span> : null}
            </span>
            <span className="od-ordered-choice-actions">
              {index > 0 ? (
                <IconButton
                  aria-label={`Move ${item.label} up`}
                  title="Move up"
                  icon={<ActionIcon kind="up" />}
                  disabled={disabled}
                  onClick={() => {
                    move(item.id, index - 1);
                  }}
                />
              ) : null}
              {index < items.length - 1 ? (
                <IconButton
                  aria-label={`Move ${item.label} down`}
                  title="Move down"
                  icon={<ActionIcon kind="down" />}
                  disabled={disabled}
                  onClick={() => {
                    move(item.id, index + 1);
                  }}
                />
              ) : null}
              <IconButton
                aria-label={`Remove ${item.label}`}
                title="Remove"
                icon={<ActionIcon kind="remove" />}
                disabled={disabled}
                onClick={() => {
                  pendingFocus.current =
                    items[index + 1]?.id ?? items[index - 1]?.id ?? "";
                  setMovingId(null);
                  onRemove(item.id);
                  setAnnouncement(`${item.label} removed.`);
                }}
              />
            </span>
          </li>
        ))}
      </ol>
      <div className="od-ordered-choice-add" ref={addRef}>
        <SearchableSelect
          label={addLabel}
          {...(addPlaceholder ? { placeholder: addPlaceholder } : {})}
          options={available}
          value=""
          disabled={!canAdd}
          onChange={(value) => {
            if (
              !canAdd ||
              !value ||
              !available.some(
                (option) => option.value === value && !option.disabled,
              )
            )
              return;
            pendingAddValue.current = value;
            onAdd(value);
            setAnnouncement(
              `${options.find((option) => option.value === value)?.label ?? "Item"} added at position ${String(items.length + 1)}.`,
            );
          }}
        />
      </div>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="od-visually-hidden"
      >
        {announcement}
      </span>
    </div>
  );
}
