import {
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { Icon } from "../index.js";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";

export interface AgentSidebarProps {
  readonly isOpen: boolean;
  readonly isCollapsed?: boolean;
  readonly workspaceName: ReactNode;
  readonly agentName?: ReactNode;
  readonly contextLabel: ReactNode;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly onSend?: (message: string) => void;
  readonly composerLabel?: string;
  readonly placeholder?: string;
  readonly statusText?: ReactNode;
  readonly runStopped?: boolean;
  readonly onRunStop?: () => void;
  readonly safetyNote?: ReactNode;
  readonly className?: string;
}

export function AgentSidebar({
  children,
  className,
  agentName = "Agent",
  composerLabel = "Ask the agent to work on this page",
  contextLabel,
  isCollapsed = false,
  isOpen,
  onClose,
  onRunStop,
  onSend,
  placeholder = "Ask about this page…",
  runStopped = false,
  safetyNote = "Changes use your workspace policy",
  statusText = "Working",
  workspaceName,
}: AgentSidebarProps) {
  const messageId = useId();
  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [pageContextIncluded, setPageContextIncluded] = useState(true);
  const contextName =
    typeof contextLabel === "string" || typeof contextLabel === "number"
      ? String(contextLabel)
      : "page";

  function sendMessage(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setSentMessage(trimmed);
    setMessage("");
    onSend?.(trimmed);
  }

  function onMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (event.shiftKey || event.metaKey) {
      event.preventDefault();
      const textarea = event.currentTarget;
      textarea.setRangeText(
        "\n",
        textarea.selectionStart,
        textarea.selectionEnd,
        "end",
      );
      setMessage(textarea.value);
      return;
    }
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <>
      <button
        className="od-agent-backdrop agent-backdrop"
        data-open={isOpen}
        type="button"
        onClick={onClose}
        aria-label="Close agent"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        className={["od-agent-sidebar", "agent-panel", className]
          .filter(Boolean)
          .join(" ")}
        data-open={isOpen}
        data-collapsed={isCollapsed}
        aria-label="Agent"
      >
        <div className="od-agent-header agent-header">
          <div className="od-agent-identity agent-identity">
            <span className="od-agent-avatar agent-avatar">
              <Icon name="spark" size={18} />
            </span>
            <span>
              <strong>{agentName}</strong>
              <small>{workspaceName} workspace</small>
              <small>
                <i aria-hidden="true" /> Ready
              </small>
            </span>
          </div>
          <button
            className="od-icon-button agent-close icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close agent"
          >
            ×
          </button>
        </div>

        <div className="od-agent-context agent-context">
          <span>Using page context</span>
          {pageContextIncluded ? (
            <button
              type="button"
              aria-label={`Remove ${contextName} context`}
              onClick={() => {
                setPageContextIncluded(false);
              }}
            >
              <Icon name="file" size={14} />
              {contextLabel}
              <span aria-hidden="true">×</span>
            </button>
          ) : (
            <output>Page context removed</output>
          )}
        </div>

        <div
          className="od-agent-conversation agent-conversation"
          aria-live="polite"
        >
          {sentMessage ? (
            <div className="od-agent-user-message user-message">
              <p>{sentMessage}</p>
            </div>
          ) : null}
          {children}
        </div>

        <div className="od-agent-composer-area agent-composer-area">
          <div
            className="od-agent-run-status run-status"
            data-stopped={runStopped}
          >
            <span className="working-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {runStopped ? "Run stopped" : statusText}
            {onRunStop ? (
              <button
                type="button"
                aria-label="Stop current agent run"
                onClick={onRunStop}
                disabled={runStopped}
              >
                <span aria-hidden="true">■</span> Stop
              </button>
            ) : null}
          </div>
          <form
            className="od-agent-composer agent-composer"
            onSubmit={sendMessage}
          >
            <label htmlFor={messageId}>{composerLabel}</label>
            <AutoGrowTextarea
              id={messageId}
              aria-label={composerLabel}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
              }}
              onKeyDown={onMessageKeyDown}
              placeholder={placeholder}
              rows={1}
              maxHeight={180}
            />
            <div>
              <button
                className="od-agent-context-button composer-context-button"
                type="button"
                aria-pressed={pageContextIncluded}
                onClick={() => {
                  setPageContextIncluded((included) => !included);
                }}
              >
                <Icon name="activity" size={16} />{" "}
                {pageContextIncluded ? "Page context on" : "Add page context"}
              </button>
              <button
                className="od-button od-button-icon send-button"
                type="submit"
                aria-label="Send message"
                disabled={!message.trim()}
              >
                <Icon name="arrow-up" size={18} />
              </button>
            </div>
          </form>
          <p className="od-agent-safety-note agent-safety-note">
            <Icon name="shield" size={13} /> {safetyNote}
          </p>
        </div>
      </aside>
    </>
  );
}
