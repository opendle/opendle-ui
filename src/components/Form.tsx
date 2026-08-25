import {
  cloneElement,
  isValidElement,
  useId,
  type AriaAttributes,
  type DetailsHTMLAttributes,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

type FieldRequirement = "required" | "optional";
type FormFieldOrientation = "stacked" | "inline";
type FormSectionColumns = 1 | 2;
type FormActionsAlignment = "start" | "end" | "between";

interface FormControlAccessibilityProps {
  readonly id?: string;
  readonly "aria-describedby"?: string;
  readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}

function joinIds(...ids: readonly (string | undefined)[]): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function hasContent(value: ReactNode | undefined): boolean {
  return value !== undefined && value !== null && value !== false;
}

export interface FieldHelpProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly children: ReactNode;
}

export function FieldHelp({ children, className, ...props }: FieldHelpProps) {
  return (
    <p
      {...props}
      className={["od-field-help", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly children: ReactNode;
}

export function FieldError({
  children,
  className,
  role = "alert",
  ...props
}: FieldErrorProps) {
  return (
    <p
      {...props}
      className={["od-field-error", className].filter(Boolean).join(" ")}
      role={role}
    >
      {children}
    </p>
  );
}

export interface FormFieldProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  readonly children: ReactElement<FormControlAccessibilityProps>;
  readonly controlId?: string;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly label: ReactNode;
  readonly orientation?: FormFieldOrientation;
  readonly requirement?: FieldRequirement;
}

export function FormField({
  children,
  className,
  controlId,
  error,
  help,
  label,
  orientation = "stacked",
  requirement,
  ...props
}: FormFieldProps) {
  const generatedControlId = useId();
  const generatedHelpId = useId();
  const generatedErrorId = useId();
  if (!isValidElement<FormControlAccessibilityProps>(children)) {
    throw new Error("FormField requires one control element.");
  }
  const id = children.props.id ?? controlId ?? generatedControlId;
  const helpId = hasContent(help) ? generatedHelpId : undefined;
  const errorId = hasContent(error) ? generatedErrorId : undefined;
  const describedBy = joinIds(
    children.props["aria-describedby"],
    helpId,
    errorId,
  );
  const controlAccessibilityProps: FormControlAccessibilityProps = {
    id,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(errorId
      ? { "aria-invalid": true }
      : children.props["aria-invalid"] !== undefined
        ? { "aria-invalid": children.props["aria-invalid"] }
        : {}),
  };
  const control = cloneElement(children, controlAccessibilityProps);

  return (
    <div
      {...props}
      className={["od-form-field", className].filter(Boolean).join(" ")}
      data-orientation={orientation}
    >
      <div className="od-form-field-heading">
        <label className="od-form-field-label" htmlFor={id}>
          {label}
        </label>
        {requirement ? (
          <span aria-hidden="true" className="od-form-field-requirement">
            {requirement}
          </span>
        ) : null}
      </div>
      <div className="od-form-field-control">{control}</div>
      {helpId ? <FieldHelp id={helpId}>{help}</FieldHelp> : null}
      {errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly alignment?: FormActionsAlignment;
  readonly children: ReactNode;
}

export function FormActions({
  alignment = "end",
  children,
  className,
  ...props
}: FormActionsProps) {
  return (
    <div
      {...props}
      className={["od-form-actions", className].filter(Boolean).join(" ")}
      data-alignment={alignment}
    >
      {children}
    </div>
  );
}

export interface FormSectionProps extends Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "children"
> {
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly columns?: FormSectionColumns;
  readonly description?: ReactNode;
  readonly legend: ReactNode;
}

export function FormSection({
  actions,
  children,
  className,
  columns = 1,
  description,
  legend,
  ...props
}: FormSectionProps) {
  const descriptionId = useId();
  const describedBy = description
    ? joinIds(props["aria-describedby"], descriptionId)
    : props["aria-describedby"];
  return (
    <fieldset
      {...props}
      aria-describedby={describedBy}
      className={["od-form-section", className].filter(Boolean).join(" ")}
    >
      <legend>{legend}</legend>
      {description ? (
        <p className="od-form-section-description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <div className="od-form-section-fields" data-columns={columns}>
        {children}
      </div>
      {actions ? <FormActions>{actions}</FormActions> : null}
    </fieldset>
  );
}

export interface AdvancedFieldsDisclosureProps extends Omit<
  DetailsHTMLAttributes<HTMLDetailsElement>,
  "children"
> {
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly summary?: ReactNode;
}

export function AdvancedFieldsDisclosure({
  children,
  className,
  description,
  summary = "Advanced fields",
  ...props
}: AdvancedFieldsDisclosureProps) {
  return (
    <details
      {...props}
      className={["od-advanced-fields", className].filter(Boolean).join(" ")}
    >
      <summary>{summary}</summary>
      <div className="od-advanced-fields-content">
        {description ? (
          <p className="od-advanced-fields-description">{description}</p>
        ) : null}
        {children}
      </div>
    </details>
  );
}

export type {
  FieldRequirement,
  FormActionsAlignment,
  FormFieldOrientation,
  FormSectionColumns,
};
