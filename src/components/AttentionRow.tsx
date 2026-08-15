import type { ButtonHTMLAttributes, ReactNode } from "react";

export type AttentionTone = "amber" | "blue" | "lime" | "red" | "slate";

export interface AttentionRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
  readonly icon: ReactNode;
  readonly title: ReactNode;
  readonly detail?: ReactNode;
  readonly meta?: ReactNode;
  readonly tone?: AttentionTone;
  readonly action?: ReactNode;
}

export function AttentionRow({
  action,
  className,
  detail,
  icon,
  meta,
  title,
  tone = "slate",
  type = "button",
  ...props
}: AttentionRowProps) {
  return (
    <button
      {...props}
      className={["od-attention-row", className].filter(Boolean).join(" ")}
      data-tone={tone}
      type={type}
    >
      <span className="od-attention-icon">{icon}</span>
      <span className="od-attention-copy">
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      {meta ? <span className="od-attention-meta">{meta}</span> : null}
      {action ? <span className="od-attention-action">{action}</span> : null}
    </button>
  );
}
