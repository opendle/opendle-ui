import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import {
  AutoGrowTextarea as BaseAutoGrowTextarea,
  type AutoGrowTextareaProps,
} from "../components/AutoGrowTextarea.js";
import { classes } from "./classes.js";

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children"
> {
  readonly label: ReactNode;
  readonly error?: string | null;
}

/** A labelled one-line text input with an optional error message. */
export function TextField({
  className,
  error = null,
  id,
  label,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className={classes("pp-field", className)}>
      <label className="pp-field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...props}
        aria-describedby={error === null ? undefined : errorId}
        aria-invalid={error === null ? undefined : true}
        className="pp-input"
        id={inputId}
      />
      {error === null ? null : (
        <p className="pp-field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export type { AutoGrowTextareaProps };

/** A textarea that grows with its content up to `maxHeight`. */
export function AutoGrowTextarea({
  className,
  ...props
}: AutoGrowTextareaProps) {
  return (
    <BaseAutoGrowTextarea
      {...props}
      className={classes("pp-textarea", className)}
    />
  );
}
