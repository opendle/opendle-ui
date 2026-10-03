import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type FieldsetHTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";
import type { ButtonVariant } from "./Button.js";

export interface ActionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  readonly label: string;
  readonly icon: ReactElement;
  readonly variant?: Exclude<ButtonVariant, "icon">;
  readonly ref?: Ref<HTMLButtonElement>;
}

/** An action with a stable name and content that fits its allocated width. */
export function ActionButton({
  label,
  icon,
  variant = "secondary",
  className,
  type = "button",
  ref,
  ...props
}: ActionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const setButtonRef = useCallback(
    (button: HTMLButtonElement | null) => {
      buttonRef.current = button;
      if (typeof ref === "function") return ref(button);
      if (ref) ref.current = button;
    },
    [ref],
  );

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const iconElement = iconRef.current;
    const labelElement = labelRef.current;
    const view = button?.ownerDocument.defaultView;
    if (!button || !iconElement || !labelElement || !view) return;

    function measure() {
      if (!button || !iconElement || !labelElement || !view) return;
      const style = view.getComputedStyle(button);
      const available =
        button.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      if (available <= 0) return;
      const labelWidth = labelElement.getBoundingClientRect().width;
      const iconWidth = iconElement.getBoundingClientRect().width;
      const gap = parseFloat(style.columnGap) || 0;
      button.dataset.presentation =
        available >= labelWidth + iconWidth + gap
          ? "full"
          : available >= labelWidth
            ? "text"
            : "icon";
    }

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(button);
    observer?.observe(iconElement);
    observer?.observe(labelElement);
    const fonts = button.ownerDocument.fonts as FontFaceSet | undefined;
    let active = true;
    fonts?.addEventListener("loadingdone", measure);
    void fonts?.ready.then(() => {
      if (active) measure();
    });
    view.addEventListener("resize", measure);
    measure();
    return () => {
      active = false;
      observer?.disconnect();
      fonts?.removeEventListener("loadingdone", measure);
      view.removeEventListener("resize", measure);
    };
  }, [label, icon, className, variant]);

  return (
    <button
      {...props}
      ref={setButtonRef}
      type={type}
      aria-label={props["aria-label"] ?? label}
      title={props.title ?? label}
      className={[
        "od-button",
        `od-button-${variant}`,
        "od-action-button",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span ref={iconRef} className="od-action-button-icon" aria-hidden="true">
        {icon}
      </span>
      <span
        ref={labelRef}
        className="od-action-button-label"
        aria-hidden="true"
      >
        {label}
      </span>
    </button>
  );
}

export type ActionButtonGroupProps =
  FieldsetHTMLAttributes<HTMLFieldSetElement>;

/** One full-width row with equal space and a minimum touch target per action. */
export function ActionButtonGroup({
  className,
  ...props
}: ActionButtonGroupProps) {
  return (
    <fieldset
      {...props}
      className={["od-action-button-group", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
