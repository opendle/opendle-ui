import { useRef, useState, type KeyboardEvent } from "react";

import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
import { Button } from "./Button.js";
import type { ConversationLabels } from "./conversationLabels.js";
import { EmojiPicker } from "./EmojiPicker.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface ReplyComposerProps {
  /** The accessible name of the textarea. */
  readonly label: string;
  /** The text that the reply starts with, for example the `@` mention. */
  readonly mention?: string;
  /** The character limit of the network, or `null` for none. */
  readonly limit?: number | null;
  readonly suggestions?: readonly string[];
  /** Send the text. A rejection keeps the text and shows the message. */
  readonly onSend: (text: string) => Promise<void>;
  readonly errorMessage: (error: unknown) => string | null;
  readonly labels: ConversationLabels;
}

const countFormat = new Intl.NumberFormat();
const noSuggestions: readonly string[] = [];

/**
 * A reply box: suggestions, a textarea that grows, an emoji button, a
 * character counter and the send button. Enter sends. Shift+Enter adds a line.
 */
export function ReplyComposer({
  errorMessage,
  label,
  labels,
  limit = null,
  mention = "",
  onSend,
  suggestions = noSuggestions,
}: ReplyComposerProps) {
  const prefix = mention === "" ? "" : `${mention} `;
  const [text, setText] = useState(prefix);
  const send = useAsyncAction(errorMessage);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const length = Array.from(text).length;
  const tooLong = limit !== null && length > limit;
  const ready = text.trim() !== "" && text.trim() !== mention && !tooLong;

  const focusEnd = (area: HTMLTextAreaElement | null) => {
    if (area === null || areaRef.current === area) return;
    areaRef.current = area;
    area.focus({ preventScroll: true });
    area.setSelectionRange(area.value.length, area.value.length);
  };

  const submit = () => {
    if (!ready || send.pending) return;
    void send.run(() => onSend(text.trim()));
  };

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  };

  const insert = (emoji: string) => {
    const area = areaRef.current;
    const start = area?.selectionStart ?? text.length;
    const end = area?.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    area?.focus();
  };

  return (
    <div className="od-reply">
      {suggestions.length === 0 ? null : (
        <fieldset
          aria-label={labels.suggestions}
          className="od-reply-suggestions"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setText(prefix + suggestion);
                areaRef.current?.focus();
              }}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </fieldset>
      )}
      <div className="od-reply-field" data-invalid={tooLong}>
        <AutoGrowTextarea
          aria-label={label}
          className="od-reply-text"
          disabled={send.pending}
          onChange={(event) => {
            setText(event.currentTarget.value);
          }}
          onKeyDown={keyDown}
          ref={focusEnd}
          rows={2}
          value={text}
        />
        <div className="od-reply-foot">
          <EmojiPicker
            disabled={send.pending}
            label={labels.emoji}
            onSelect={insert}
          />
          {limit === null ? null : (
            <span className="od-reply-counter" data-invalid={tooLong}>
              {countFormat.format(length)} / {countFormat.format(limit)}
            </span>
          )}
          <Button
            className="od-reply-send"
            disabled={!ready || send.pending}
            icon={<Icon name="send" size={15} />}
            onClick={submit}
          >
            {labels.send}
          </Button>
        </div>
      </div>
      {send.failure === null ? null : (
        <InlineAlert tone="error">{send.failure}</InlineAlert>
      )}
    </div>
  );
}
