import type { FieldsetHTMLAttributes, ReactNode, Ref } from "react";

import { AdvancedFieldsDisclosure } from "./Form.js";
import { CheckboxControl } from "./FormControls.js";

export interface CompactCheckboxGroupOption<Value extends string = string> {
  readonly value: Value;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface CompactCheckboxGroupProps<
  Value extends string = string,
> extends Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "children" | "onChange" | "name"
> {
  readonly label: string;
  readonly name?: string;
  readonly options: readonly CompactCheckboxGroupOption<Value>[];
  readonly value: readonly Value[];
  readonly onChange: (value: Value[]) => void;
  readonly ref?: Ref<HTMLFieldSetElement>;
  readonly summary?: (count: number) => ReactNode;
}

export function CompactCheckboxGroup<Value extends string = string>({
  className,
  label,
  name,
  onChange,
  options,
  summary,
  value,
  ...props
}: CompactCheckboxGroupProps<Value>) {
  const selected = new Set(value);
  const count = options.filter((option) => selected.has(option.value)).length;

  return (
    <fieldset
      {...props}
      className={["od-compact-checkbox-group", className]
        .filter(Boolean)
        .join(" ")}
    >
      <legend className="od-visually-hidden">{label}</legend>
      <AdvancedFieldsDisclosure
        summary={
          summary ? summary(count) : `${label} (${String(count)} selected)`
        }
        onKeyDown={(event) => {
          if (
            event.key !== "Escape" ||
            event.defaultPrevented ||
            !event.currentTarget.open
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }}
      >
        <div className="od-compact-checkbox-group-options">
          {options.map((option) => (
            <CheckboxControl
              checked={selected.has(option.value)}
              disabled={option.disabled}
              form={props.form}
              key={option.value}
              label={option.label}
              name={name}
              onChange={(event) => {
                const next = new Set(value);
                if (event.currentTarget.checked) next.add(option.value);
                else next.delete(option.value);
                const ordered: Value[] = [];
                for (const item of options) {
                  if (next.has(item.value)) ordered.push(item.value);
                }
                onChange(ordered);
              }}
              value={option.value}
            />
          ))}
        </div>
      </AdvancedFieldsDisclosure>
    </fieldset>
  );
}
