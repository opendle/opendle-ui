import type {
  AriaAttributes,
  ChangeEventHandler,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { FormField, type FieldRequirement } from "./Form.js";

interface ControlFieldProps {
  readonly className?: string;
  readonly controlClassName?: string;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly label: ReactNode;
  readonly requirement?: FieldRequirement;
}

interface ControlledInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "className" | "defaultChecked" | "defaultValue" | "type"
> {
  readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}

function controlClassName(name: string, className?: string): string {
  return ["od-form-control", name, className].filter(Boolean).join(" ");
}

function isControlRequired(
  required: boolean | undefined,
  requirement: FieldRequirement | undefined,
): boolean {
  return required === true || requirement === "required";
}

function requirementProps(
  required: boolean | undefined,
  requirement: FieldRequirement | undefined,
): { readonly requirement?: FieldRequirement } {
  const value = isControlRequired(required, requirement)
    ? "required"
    : requirement;
  return value ? { requirement: value } : {};
}

export interface TextControlProps
  extends ControlledInputProps, ControlFieldProps {
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly value: string;
}

export function TextControl({
  className,
  controlClassName: controlClass,
  error,
  help,
  label,
  onChange,
  requirement,
  required,
  ...props
}: TextControlProps) {
  return (
    <FormField
      className={["od-text-control", className].filter(Boolean).join(" ")}
      error={error}
      help={help}
      label={label}
      {...requirementProps(required, requirement)}
    >
      <input
        {...props}
        className={controlClassName("od-text-control-input", controlClass)}
        onChange={onChange}
        required={isControlRequired(required, requirement)}
        type="text"
      />
    </FormField>
  );
}

export interface NumberControlProps
  extends Omit<ControlledInputProps, "value">, ControlFieldProps {
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly value: number | "";
}

export function NumberControl({
  className,
  controlClassName: controlClass,
  error,
  help,
  label,
  requirement,
  required,
  ...props
}: NumberControlProps) {
  return (
    <FormField
      className={["od-number-control", className].filter(Boolean).join(" ")}
      error={error}
      help={help}
      label={label}
      {...requirementProps(required, requirement)}
    >
      <input
        {...props}
        className={controlClassName("od-number-control-input", controlClass)}
        required={isControlRequired(required, requirement)}
        type="number"
      />
    </FormField>
  );
}

export interface SelectControlProps
  extends
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "defaultValue">,
    ControlFieldProps {
  readonly children: ReactNode;
  readonly onChange: ChangeEventHandler<HTMLSelectElement>;
  readonly value: string | number | readonly string[];
}

export function SelectControl({
  children,
  className,
  controlClassName: controlClass,
  error,
  help,
  label,
  requirement,
  required,
  ...props
}: SelectControlProps) {
  return (
    <FormField
      className={["od-select-control", className].filter(Boolean).join(" ")}
      error={error}
      help={help}
      label={label}
      {...requirementProps(required, requirement)}
    >
      <select
        {...props}
        className={controlClassName("od-select-control-input", controlClass)}
        required={isControlRequired(required, requirement)}
      >
        {children}
      </select>
    </FormField>
  );
}

export interface TextareaControlProps
  extends
    Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      "className" | "defaultValue"
    >,
    ControlFieldProps {
  readonly onChange: ChangeEventHandler<HTMLTextAreaElement>;
  readonly value: string;
}

export function TextareaControl({
  className,
  controlClassName: controlClass,
  error,
  help,
  label,
  requirement,
  required,
  ...props
}: TextareaControlProps) {
  return (
    <FormField
      className={["od-textarea-control", className].filter(Boolean).join(" ")}
      error={error}
      help={help}
      label={label}
      {...requirementProps(required, requirement)}
    >
      <textarea
        {...props}
        className={controlClassName("od-textarea-control-input", controlClass)}
        required={isControlRequired(required, requirement)}
      />
    </FormField>
  );
}

export interface CheckboxControlProps
  extends Omit<ControlledInputProps, "checked" | "value">, ControlFieldProps {
  readonly checked: boolean;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly value?: string | number | readonly string[];
}

export function CheckboxControl({
  checked,
  className,
  controlClassName: controlClass,
  error,
  help,
  label,
  onChange,
  requirement,
  required,
  ...props
}: CheckboxControlProps) {
  return (
    <FormField
      className={["od-checkbox-control", className].filter(Boolean).join(" ")}
      error={error}
      help={help}
      label={label}
      orientation="inline"
      {...requirementProps(required, requirement)}
    >
      <input
        {...props}
        checked={checked}
        className={controlClassName("od-checkbox-control-input", controlClass)}
        onChange={onChange}
        required={isControlRequired(required, requirement)}
        type="checkbox"
      />
    </FormField>
  );
}

export interface SwitchControlProps
  extends
    Omit<ControlledInputProps, "aria-checked" | "checked" | "role" | "value">,
    ControlFieldProps {
  readonly checked: boolean;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly value?: string | number | readonly string[];
}

export function SwitchControl({
  checked,
  className,
  controlClassName: controlClass,
  error,
  help,
  label,
  onChange,
  requirement,
  required,
  ...props
}: SwitchControlProps) {
  return (
    <FormField
      className={["od-switch-control", className].filter(Boolean).join(" ")}
      error={error}
      help={help}
      label={label}
      orientation="inline"
      {...requirementProps(required, requirement)}
    >
      <input
        {...props}
        aria-checked={checked}
        checked={checked}
        className={controlClassName("od-switch-control-input", controlClass)}
        onChange={onChange}
        required={isControlRequired(required, requirement)}
        role="switch"
        type="checkbox"
      />
    </FormField>
  );
}
