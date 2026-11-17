import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect.js";

export interface SearchableMultiSelectProps {
  readonly label: string;
  /** The selected values, in the order of the user. */
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
  readonly options: readonly SearchableSelectOption[];
  /** The accessible name of a remove button. It gets the option after it. */
  readonly removeLabel: string;
  readonly placeholder?: string;
  readonly noResultsLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * A searchable select that adds each choice to a list of removable chips.
 * The search shows only the options that are not selected.
 */
export function SearchableMultiSelect({
  className,
  disabled = false,
  label,
  noResultsLabel,
  onChange,
  options,
  placeholder,
  removeLabel,
  value,
}: SearchableMultiSelectProps) {
  const selected = new Set(value);
  const labels = new Map(options.map((option) => [option.value, option.label]));
  return (
    <div className={classes("od-multi-select", className)}>
      <SearchableSelect
        disabled={disabled}
        label={label}
        onChange={(choice) => {
          if (!selected.has(choice)) onChange([...value, choice]);
        }}
        options={options.filter((option) => !selected.has(option.value))}
        value=""
        {...(placeholder === undefined ? {} : { placeholder })}
        {...(noResultsLabel === undefined ? {} : { noResultsLabel })}
      />
      {value.length === 0 ? null : (
        <ul aria-label={label} className="od-multi-select-values">
          {value.map((item) => {
            const name = labels.get(item) ?? item;
            return (
              <li className="od-tag od-multi-select-value" key={item}>
                {name}
                {disabled ? null : (
                  <button
                    aria-label={`${removeLabel}: ${name}`}
                    className="od-tag-input-remove"
                    onClick={() => {
                      onChange(value.filter((entry) => entry !== item));
                    }}
                    title={`${removeLabel}: ${name}`}
                    type="button"
                  >
                    <Icon name="close" size={12} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
