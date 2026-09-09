import {
  useId,
  type FieldsetHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { FieldError, FieldHelp } from "./Form.js";

export interface RadioGroupOption<Value extends string = string> {
  readonly value: Value;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface RadioGroupProps<Value extends string = string> extends Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "children" | "onChange" | "name"
> {
  readonly label: string;
  readonly name?: string;
  readonly options: readonly RadioGroupOption<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
  readonly help?: ReactNode;
  readonly error?: ReactNode;
  readonly ref?: Ref<HTMLFieldSetElement>;
}

function RadioChoice<Value extends string>({
  option,
  checked,
  name,
  form,
  describedBy,
  onChange,
}: {
  readonly option: RadioGroupOption<Value>;
  readonly checked: boolean;
  readonly name: string;
  readonly form: string | undefined;
  readonly describedBy: string | undefined;
  readonly onChange: (value: Value) => void;
}) {
  const id = useId();
  return (
    <label
      className="od-radio-group-choice"
      htmlFor={id}
      onFocus={(event) => {
        event.currentTarget.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }}
    >
      <input
        aria-describedby={describedBy}
        aria-labelledby={`${id}-label`}
        checked={checked}
        className="od-form-control od-radio-group-input"
        disabled={option.disabled}
        form={form}
        id={id}
        name={name}
        onChange={() => {
          onChange(option.value);
        }}
        type="radio"
        value={option.value}
      />
      <span className="od-radio-group-choice-label" id={`${id}-label`}>
        {option.label}
      </span>
    </label>
  );
}

export function RadioGroup<Value extends string = string>({
  className,
  error,
  help,
  label,
  name,
  options,
  value,
  onChange,
  ...props
}: RadioGroupProps<Value>) {
  const id = useId();
  const helpId =
    help !== undefined && help !== null && help !== false
      ? `${id}-help`
      : undefined;
  const errorId =
    error !== undefined && error !== null && error !== false
      ? `${id}-error`
      : undefined;
  const describedBy =
    [props["aria-describedby"], helpId, errorId].filter(Boolean).join(" ") ||
    undefined;
  const invalid = errorId ? true : props["aria-invalid"];
  return (
    <fieldset
      {...props}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      className={["od-radio-group", className].filter(Boolean).join(" ")}
    >
      <legend className="od-form-field-label">{label}</legend>
      {helpId ? <FieldHelp id={helpId}>{help}</FieldHelp> : null}
      <div
        className="od-radio-group-options"
        data-scrollable={options.length > 6 || undefined}
      >
        {options.map((option) => (
          <RadioChoice
            key={option.value}
            option={option}
            checked={value === option.value}
            name={name ?? id}
            form={props.form}
            describedBy={describedBy}
            onChange={onChange}
          />
        ))}
      </div>
      {errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}
