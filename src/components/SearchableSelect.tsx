import {
  useId,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AriaAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { FormField, type FieldRequirement } from "./Form.js";

export interface SearchableSelectOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly searchText?: string;
  readonly disabled?: boolean;
}

export interface SearchableSelectProps {
  readonly className?: string;
  readonly disabled?: boolean;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly id?: string;
  readonly label: ReactNode;
  readonly maxVisibleOptions?: number;
  readonly name?: string;
  readonly noResultsLabel?: string;
  readonly onChange: (value: string, option: SearchableSelectOption) => void;
  readonly onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly options: readonly SearchableSelectOption[];
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly requirement?: FieldRequirement;
  readonly value: string;
  readonly "aria-describedby"?: string;
  readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function filterOptions(
  options: readonly SearchableSelectOption[],
  query: string,
): readonly SearchableSelectOption[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return options;
  return options.filter((option) =>
    normalizeSearchText(
      `${option.label} ${option.value} ${option.searchText ?? ""} ${option.description ?? ""}`,
    ).includes(normalized),
  );
}

function limitOptions(
  options: readonly SearchableSelectOption[],
  maximum: number,
  selectedValue: string,
  keepSelection: boolean,
): readonly SearchableSelectOption[] {
  const limited = options.slice(0, maximum);
  if (
    !keepSelection ||
    limited.some((option) => option.value === selectedValue)
  ) {
    return limited;
  }
  const selected = options.find((option) => option.value === selectedValue);
  if (!selected) return limited;
  return [...limited.slice(0, Math.max(0, maximum - 1)), selected];
}

function validateOptions(options: readonly SearchableSelectOption[]): void {
  const values = new Set<string>();
  for (const option of options) {
    if (values.has(option.value)) {
      throw new Error("SearchableSelect option values must be unique.");
    }
    values.add(option.value);
  }
}

function enabledIndex(
  options: readonly SearchableSelectOption[],
  start: number,
  direction: -1 | 1,
): number {
  if (options.length === 0) return -1;
  let index = Math.min(Math.max(start, 0), options.length - 1);
  let count = 0;
  while (count < options.length) {
    if (!options[index]?.disabled) return index;
    index = (index + direction + options.length) % options.length;
    count += 1;
  }
  return -1;
}

function moveEnabledIndex(
  options: readonly SearchableSelectOption[],
  current: number,
  direction: -1 | 1,
): number {
  if (options.length === 0) return -1;
  let index = current;
  let count = 0;
  while (count < options.length) {
    index = (index + direction + options.length) % options.length;
    if (!options[index]?.disabled) return index;
    count += 1;
  }
  return current;
}

export function SearchableSelect({
  className,
  disabled = false,
  error,
  help,
  id,
  label,
  maxVisibleOptions = 50,
  name,
  noResultsLabel = "No matching options",
  onChange,
  onInputKeyDown,
  options,
  placeholder = "Search options",
  required = false,
  requirement,
  value,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: SearchableSelectProps) {
  validateOptions(options);
  if (!Number.isSafeInteger(maxVisibleOptions) || maxVisibleOptions < 1) {
    throw new Error("SearchableSelect maxVisibleOptions must be positive.");
  }

  const generatedInputId = useId();
  const labelId = useId();
  const listboxId = useId();
  const inputId = id ?? generatedInputId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedOption = options.find((option) => option.value === value);
  const query = draftQuery ?? selectedOption?.label ?? "";
  const filteredOptions = useMemo(
    () => filterOptions(options, draftQuery ?? ""),
    [draftQuery, options],
  );
  const visibleOptions = limitOptions(
    filteredOptions,
    maxVisibleOptions,
    value,
    draftQuery === null,
  );
  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < visibleOptions.length ? activeIndex : -1;
  const activeOption =
    safeActiveIndex >= 0 ? visibleOptions[safeActiveIndex] : undefined;
  const hasUncommittedQuery = draftQuery !== null;
  const selectionInvalid =
    !disabled &&
    ((required && (!selectedOption || value === "")) ||
      hasUncommittedQuery ||
      (Boolean(value) && !selectedOption));

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      selectionInvalid ? "Select an option from the list." : "",
    );
  }, [selectionInvalid]);

  function openList() {
    if (disabled) return;
    const unfilteredOptions = limitOptions(
      options,
      maxVisibleOptions,
      value,
      true,
    );
    setDraftQuery(null);
    setOpen(true);
    const selectedIndex = unfilteredOptions.findIndex(
      (option) => option.value === value && !option.disabled,
    );
    setActiveIndex(
      selectedIndex >= 0
        ? selectedIndex
        : enabledIndex(unfilteredOptions, 0, 1),
    );
  }

  function closeList() {
    setOpen(false);
    setDraftQuery(null);
    setActiveIndex(-1);
  }

  function commit(option: SearchableSelectOption) {
    if (disabled || option.disabled) return;
    onChange(option.value, option);
    closeList();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!disabled) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        if (!open) {
          openList();
        } else {
          setActiveIndex((current) =>
            moveEnabledIndex(
              visibleOptions,
              current >= 0
                ? current
                : direction === 1
                  ? visibleOptions.length - 1
                  : 0,
              direction,
            ),
          );
        }
      } else if (event.key === "Home" && open) {
        event.preventDefault();
        setActiveIndex(enabledIndex(visibleOptions, 0, 1));
      } else if (event.key === "End" && open) {
        event.preventDefault();
        setActiveIndex(
          enabledIndex(visibleOptions, visibleOptions.length - 1, -1),
        );
      } else if (event.key === "Enter" && open && activeOption) {
        event.preventDefault();
        commit(activeOption);
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        closeList();
      }
    }
    onInputKeyDown?.(event);
  }

  return (
    <div
      className={["od-searchable-select", className].filter(Boolean).join(" ")}
      data-open={open || undefined}
    >
      <FormField
        controlId={inputId}
        error={error}
        help={help}
        label={<span id={labelId}>{label}</span>}
        {...(requirement || required
          ? { requirement: requirement ?? "required" }
          : {})}
      >
        <input
          ref={inputRef}
          aria-activedescendant={
            open && safeActiveIndex >= 0
              ? `${listboxId}-option-${String(safeActiveIndex)}`
              : undefined
          }
          aria-autocomplete="list"
          aria-controls={open ? listboxId : undefined}
          aria-describedby={ariaDescribedBy}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={selectionInvalid ? true : ariaInvalid}
          aria-labelledby={labelId}
          aria-required={required || undefined}
          autoComplete="off"
          className="od-searchable-select-input"
          disabled={disabled}
          onBlur={closeList}
          onChange={(event) => {
            const nextQuery = event.currentTarget.value;
            const nextOptions = filterOptions(options, nextQuery).slice(
              0,
              maxVisibleOptions,
            );
            setDraftQuery(nextQuery);
            setOpen(true);
            setActiveIndex(enabledIndex(nextOptions, 0, 1));
          }}
          onClick={() => {
            if (!open) openList();
          }}
          onFocus={() => {
            if (!open) openList();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          role="combobox"
          type="search"
          value={query}
        />
      </FormField>
      {name ? (
        <input disabled={disabled} name={name} type="hidden" value={value} />
      ) : null}
      {open ? (
        <select
          aria-labelledby={labelId}
          className="od-searchable-select-listbox"
          id={listboxId}
          onChange={(event) => {
            const option = visibleOptions.find(
              (item) => item.value === event.currentTarget.value,
            );
            if (option) commit(option);
          }}
          onPointerDown={(event) => {
            if (!(event.target instanceof HTMLOptionElement)) return;
            const optionValue = event.target.value;
            const option = visibleOptions.find(
              (item) => item.value === optionValue,
            );
            if (!option) return;
            event.preventDefault();
            commit(option);
          }}
          size={Math.min(
            Math.max(
              visibleOptions.length +
                (visibleOptions.length === 0 ? 1 : 0) +
                (filteredOptions.length > visibleOptions.length ? 1 : 0),
              2,
            ),
            8,
          )}
          tabIndex={-1}
          value={activeOption?.value ?? selectedOption?.value ?? ""}
        >
          {visibleOptions.map((option, index) => (
            <option
              className="od-searchable-select-option"
              data-active={index === safeActiveIndex || undefined}
              disabled={option.disabled}
              id={`${listboxId}-option-${String(index)}`}
              key={option.value}
              value={option.value}
            >
              {option.label}
              {option.description ? ` — ${option.description}` : ""}
            </option>
          ))}
          {visibleOptions.length === 0 ? (
            <option className="od-searchable-select-empty" disabled>
              {noResultsLabel}
            </option>
          ) : null}
          {filteredOptions.length > visibleOptions.length ? (
            <option className="od-searchable-select-limit" disabled>
              Refine the search to see more options.
            </option>
          ) : null}
        </select>
      ) : null}
    </div>
  );
}
