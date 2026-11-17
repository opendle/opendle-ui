import {
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import {
  conversationLabels,
  type ConversationLabels,
  type ConversationMessage,
} from "./conversationLabels.js";
import { Icon } from "./Icon.js";
import { ReplyComposer, type ReplyComposerProps } from "./ReplyComposer.js";

export interface ConversationProps {
  readonly messages: readonly ConversationMessage[];
  /** The message that the view opens at, with its reply box open. */
  readonly selectedId?: string | null;
  /** The post that the comments are under. */
  readonly post?: ReactNode;
  /** The text that a reply starts with on this network. */
  readonly mention?: (message: ConversationMessage) => string;
  readonly limit?: number | null;
  /** The suggestions for a reply to the selected message. */
  readonly suggestions?: readonly string[];
  readonly savedReplies?: ReplyComposerProps["savedReplies"];
  readonly savedRepliesLabel?: string;
  readonly messageActions?: (message: ConversationMessage) => ReactNode;
  /** Without it, the messages have no reply box. */
  readonly onReply?: (id: string, text: string) => Promise<void>;
  /** With it, the reply link calls the host and no reply box opens. */
  readonly onReplyRequest?: (id: string) => void;
  readonly onLike?: (id: string, liked: boolean) => void;
  readonly onIgnore?: (id: string) => void;
  readonly onRestore?: (id: string) => void;
  readonly errorMessage?: (error: unknown) => string | null;
  readonly labels?: ConversationLabels;
  readonly className?: string;
}

const countFormat = new Intl.NumberFormat(undefined, { notation: "compact" });
const noError = () => null;
const noSuggestions: readonly string[] = [];

/**
 * The comments of one post, or the messages of one thread, in order. One
 * message at a time has an open reply box.
 */
export function Conversation({
  className,
  errorMessage = noError,
  labels = conversationLabels,
  limit = null,
  mention,
  messages,
  onIgnore,
  onLike,
  onReply,
  onReplyRequest,
  onRestore,
  post,
  selectedId = null,
  suggestions = noSuggestions,
  savedReplies,
  savedRepliesLabel,
  messageActions,
}: ConversationProps) {
  // Until the user opens or closes a reply box, the selected message has it.
  const [chosenId, setOpenId] = useState<string | null | undefined>(undefined);
  const openId = chosenId === undefined ? selectedId : chosenId;
  // Show the selected message when the view opens. A scrolling container
  // centres it; the page scrolls only as far as necessary.
  const reveal = useCallback((row: HTMLLIElement | null) => {
    if (row === null) return;
    let box = row.parentElement;
    while (box !== null && box !== document.body) {
      const { overflowY } = getComputedStyle(box);
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        box.scrollHeight > box.clientHeight
      ) {
        const offset =
          row.getBoundingClientRect().top - box.getBoundingClientRect().top;
        box.scrollTop += offset - (box.clientHeight - row.offsetHeight) / 2;
        return;
      }
      box = box.parentElement;
    }
    row.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <div className={classes("od-conversation", className)}>
      {post}
      <ol className="od-conversation-thread">
        {messages.map((message) => {
          const canReply = message.canReply && !message.own;
          const open =
            openId === message.id && onReply !== undefined && canReply;
          return (
            <li
              className="od-message"
              data-own={message.own}
              data-selected={message.id === selectedId}
              data-state={message.state}
              key={message.id}
              ref={message.id === selectedId ? reveal : undefined}
              style={
                {
                  "--od-message-depth": Math.min(message.depth, 3),
                } as CSSProperties
              }
            >
              <Avatar name={message.authorName} src={message.avatarUrl} />
              <div className="od-message-body">
                <div className="od-message-head">
                  <strong>{message.authorName}</strong>
                  {message.authorHandle === "" ? null : (
                    <span className="od-message-handle">
                      {message.authorHandle}
                    </span>
                  )}
                  <time dateTime={message.createdAt}>{message.when}</time>
                </div>
                <p className="od-message-text">{message.text}</p>
                {message.own ? null : (
                  <div className="od-message-actions">
                    {messageActions?.(message)}
                    {message.canLike && onLike !== undefined ? (
                      <button
                        aria-label={labels.like}
                        aria-pressed={message.liked}
                        className="od-message-action"
                        onClick={() => {
                          onLike(message.id, !message.liked);
                        }}
                        title={labels.like}
                        type="button"
                      >
                        <Icon name="heart" size={15} />
                        {message.likeCount === null ||
                        message.likeCount === 0 ? null : (
                          <span>{countFormat.format(message.likeCount)}</span>
                        )}
                      </button>
                    ) : message.likeCount === null ||
                      message.likeCount === 0 ? null : (
                      <span className="od-message-action" data-static="true">
                        <Icon name="heart" size={15} />
                        <span>{countFormat.format(message.likeCount)}</span>
                      </span>
                    )}
                    {canReply &&
                    (onReply !== undefined || onReplyRequest !== undefined) ? (
                      <button
                        aria-expanded={
                          onReplyRequest === undefined ? open : undefined
                        }
                        className="od-message-action"
                        onClick={() => {
                          if (onReplyRequest === undefined) {
                            setOpenId(open ? null : message.id);
                          } else {
                            onReplyRequest(message.id);
                          }
                        }}
                        type="button"
                      >
                        <Icon name="reply" size={15} />
                        <span>{labels.reply}</span>
                      </button>
                    ) : null}
                    {message.state === "ignored" ? (
                      onRestore === undefined ? null : (
                        <button
                          aria-label={labels.restore}
                          className="od-message-action"
                          onClick={() => {
                            onRestore(message.id);
                          }}
                          title={labels.restore}
                          type="button"
                        >
                          <Icon name="eye" size={15} />
                        </button>
                      )
                    ) : onIgnore === undefined ? null : (
                      <button
                        aria-label={labels.ignore}
                        className="od-message-action"
                        onClick={() => {
                          onIgnore(message.id);
                        }}
                        title={labels.ignore}
                        type="button"
                      >
                        <Icon name="eye-off" size={15} />
                      </button>
                    )}
                  </div>
                )}
                {open ? (
                  <ReplyComposer
                    errorMessage={errorMessage}
                    key={message.id}
                    label={`${labels.replyTo} ${message.authorName}`}
                    labels={labels}
                    limit={limit}
                    mention={mention?.(message) ?? ""}
                    onSend={async (text) => {
                      await onReply(message.id, text);
                      setOpenId(null);
                    }}
                    suggestions={message.id === selectedId ? suggestions : []}
                    {...(savedReplies === undefined ? {} : { savedReplies })}
                    {...(savedRepliesLabel === undefined
                      ? {}
                      : { savedRepliesLabel })}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
