import { useId, useState, type FormEvent, type ReactNode } from "react";
import type { ReactElement } from "react";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";

export type ReviewPlanState = "pending" | "approved" | "rejected";

export interface ReviewPlanDetail {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly icon?: ReactNode;
}

export interface ReviewPlanCardProps {
  readonly state: ReviewPlanState;
  readonly text: string;
  readonly title: ReactNode;
  readonly ariaLabel: string;
  readonly meta: ReactNode;
  readonly age?: ReactNode;
  readonly channel?: ReactNode;
  readonly details?: readonly ReviewPlanDetail[];
  readonly rejectionMessage?: ReactNode;
  readonly approvedMessage?: ReactNode;
  readonly priority?: ReactNode;
  readonly compact?: boolean;
  readonly onApprove: () => void;
  readonly onEdit: (text: string) => void;
  readonly onRefuse: (feedback: string) => void;
  readonly onRestore: () => void;
  readonly renderIcon?: (state: ReviewPlanState) => ReactNode;
  readonly renderActions?: (actions: { approve: () => void; edit: () => void; refuse: () => void }) => ReactElement;
  readonly className?: string;
  readonly editLabel?: string;
  readonly saveEditLabel?: string;
  readonly refuseSubmitLabel?: string;
  readonly refuseEmptyLabel?: string;
  readonly textMaxLength?: number;
}

type ReviewMode = "idle" | "edit" | "refuse";

export function ReviewPlanCard({
  age = "now",
  ariaLabel,
  approvedMessage = "The plan is approved and ready for its next operation.",
  channel,
  compact = false,
  details,
  meta,
  onApprove,
  onEdit,
  onRefuse,
  onRestore,
  priority,
  rejectionMessage = "No change will run from this plan.",
  renderActions,
  renderIcon,
  state,
  text,
  title,
  className,
  editLabel = "Edit the plan",
  refuseEmptyLabel,
  saveEditLabel = "Save changes",
  textMaxLength,
  refuseSubmitLabel = "Refuse plan",
}: ReviewPlanCardProps) {
  const fieldId = useId();
  const [mode, setMode] = useState<ReviewMode>("idle");
  const [draft, setDraft] = useState(text);
  const [feedback, setFeedback] = useState("");

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    if (!next) return;
    onEdit(next);
    setMode("idle");
  }

  function refuse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRefuse(feedback.trim());
    setMode("idle");
  }

  const actions = { approve: onApprove, edit: () => { setDraft(text); setMode("edit"); }, refuse: () => setMode("refuse") };
  return (
    <article className={["od-plan-card", "shared-plan-card", className].filter(Boolean).join(" ")} aria-label={ariaLabel} data-compact={compact} data-state={state}>
      <div className="od-plan-heading plan-heading">
        <span>{renderIcon?.(state)}</span>
        <div>
          <small>{priority ? `${String(priority)} · ` : ""}{meta}</small>
          <strong>{title}</strong>
        </div>
        <span className="od-plan-age">{age}</span>
      </div>
      {state === "pending" ? (
        <>
          <div className="od-plan-copy plan-copy">
            {channel ? <span className="od-plan-channel channel-badge">{channel}</span> : null}
            <p>{text}</p>
          </div>
          {details?.length ? <dl className="od-plan-details plan-details">{details.map((detail, index) => <div key={index}><dt>{detail.label}</dt><dd>{detail.icon}{detail.value}</dd></div>)}</dl> : null}
          {mode === "edit" ? <form className="od-plan-inline-form plan-inline-form" onSubmit={saveEdit}><label htmlFor={`${fieldId}-edit`}>{editLabel}</label><AutoGrowTextarea id={`${fieldId}-edit`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={textMaxLength} rows={2} />{textMaxLength ? <small>{draft.length} / {textMaxLength}</small> : null}<div><button type="button" className="od-button od-button-quiet text-button" onClick={() => setMode("idle")}>Cancel</button><button type="submit" className="od-button od-button-primary primary-button" disabled={!draft.trim()}>{saveEditLabel}</button></div></form> : null}
          {mode === "refuse" ? <form className="od-plan-inline-form plan-inline-form" onSubmit={refuse}><label htmlFor={`${fieldId}-feedback`}>Tell the agent what to change</label><AutoGrowTextarea id={`${fieldId}-feedback`} value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={2} /><div><button type="button" className="od-button od-button-quiet text-button" onClick={() => setMode("idle")}>Cancel</button><button type="submit" className="od-button od-button-secondary secondary-button">{feedback.trim() || !refuseEmptyLabel ? refuseSubmitLabel : refuseEmptyLabel}</button></div></form> : null}
          {mode === "idle" ? <div className="od-plan-actions plan-actions">{renderActions?.(actions) ?? <><button type="button" className="od-button od-button-secondary secondary-button" onClick={actions.refuse}>Refuse</button><button type="button" className="od-button od-button-secondary secondary-button" onClick={actions.edit}>Edit</button><button type="button" className="od-button od-button-primary primary-button" onClick={actions.approve}>Approve</button></>}</div> : null}
        </>
      ) : <div className="od-plan-result plan-result"><p>{state === "approved" ? approvedMessage : rejectionMessage}</p><button type="button" className="od-button od-button-quiet" onClick={onRestore}>Restore plan</button></div>}
    </article>
  );
}
