import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, } from "react";
import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { conversationLabels, } from "./conversationLabels.js";
import { Icon } from "./Icon.js";
import { ReplyComposer } from "./ReplyComposer.js";
const countFormat = new Intl.NumberFormat(undefined, { notation: "compact" });
const noError = () => null;
const noSuggestions = [];
/**
 * The comments of one post, or the messages of one thread, in order. One
 * message at a time has an open reply box.
 */
export function Conversation({ className, emoji, errorMessage = noError, labels = conversationLabels, limit = null, mention, messages, onIgnore, onLike, onReply, onReplyRequest, onRestore, post, selectedId = null, suggestions = noSuggestions, savedReplies, savedRepliesLabel, messageActions, }) {
    // Until the user opens or closes a reply box, the selected message has it.
    const [chosenId, setOpenId] = useState(undefined);
    const openId = chosenId === undefined ? selectedId : chosenId;
    // Show the selected message when the view opens. A scrolling container
    // centres it; the page scrolls only as far as necessary.
    const reveal = useCallback((row) => {
        if (row === null)
            return;
        let box = row.parentElement;
        while (box !== null && box !== document.body) {
            const { overflowY } = getComputedStyle(box);
            if ((overflowY === "auto" || overflowY === "scroll") &&
                box.scrollHeight > box.clientHeight) {
                const offset = row.getBoundingClientRect().top - box.getBoundingClientRect().top;
                box.scrollTop += offset - (box.clientHeight - row.offsetHeight) / 2;
                return;
            }
            box = box.parentElement;
        }
        row.scrollIntoView({ block: "nearest" });
    }, []);
    return (_jsxs("div", { className: classes("od-conversation", className), children: [post, _jsx("ol", { className: "od-conversation-thread", children: messages.map((message) => {
                    const canReply = message.canReply && !message.own;
                    // A message with a reply box has its ignore button in that box.
                    const hasBox = onReply !== undefined && canReply;
                    const open = openId === message.id && hasBox;
                    const translation = message.translation ?? null;
                    return (_jsxs("li", { className: "od-message", "data-own": message.own, "data-selected": message.id === selectedId, "data-state": message.state, ref: message.id === selectedId ? reveal : undefined, style: {
                            "--od-message-depth": Math.min(message.depth, 3),
                        }, children: [_jsx(Avatar, { name: message.authorName, src: message.avatarUrl }), _jsxs("div", { className: "od-message-body", children: [_jsxs("div", { className: "od-message-head", children: [_jsx("strong", { children: message.authorName }), message.authorHandle === "" ? null : (_jsx("span", { className: "od-message-handle", children: message.authorHandle })), _jsx("time", { dateTime: message.createdAt, children: message.when })] }), _jsx("p", { className: "od-message-text", children: message.text }), translation === null ? null : (_jsx("p", { className: "od-message-translation", lang: translation.language, children: translation.text })), message.own ? null : (_jsxs("div", { className: "od-message-actions", children: [messageActions?.(message), message.canLike && onLike !== undefined ? (_jsxs("button", { "aria-label": labels.like, "aria-pressed": message.liked, className: "od-message-action", onClick: () => {
                                                    onLike(message.id, !message.liked);
                                                }, title: labels.like, type: "button", children: [_jsx(Icon, { name: "heart", size: 15 }), message.likeCount === null ||
                                                        message.likeCount === 0 ? null : (_jsx("span", { children: countFormat.format(message.likeCount) }))] })) : message.likeCount === null ||
                                                message.likeCount === 0 ? null : (_jsxs("span", { className: "od-message-action", "data-static": "true", children: [_jsx(Icon, { name: "heart", size: 15 }), _jsx("span", { children: countFormat.format(message.likeCount) })] })), canReply &&
                                                (onReply !== undefined || onReplyRequest !== undefined) ? (_jsxs("button", { "aria-expanded": onReplyRequest === undefined ? open : undefined, className: "od-message-action", onClick: () => {
                                                    if (onReplyRequest === undefined) {
                                                        setOpenId(open ? null : message.id);
                                                    }
                                                    else {
                                                        onReplyRequest(message.id);
                                                    }
                                                }, type: "button", children: [_jsx(Icon, { name: "reply", size: 15 }), _jsx("span", { children: labels.reply })] })) : null, message.state === "ignored" ? (onRestore === undefined ? null : (_jsx("button", { "aria-label": labels.restore, className: "od-message-action", onClick: () => {
                                                    onRestore(message.id);
                                                }, title: labels.restore, type: "button", children: _jsx(Icon, { name: "eye", size: 15 }) }))) : onIgnore === undefined || hasBox ? null : (_jsx("button", { "aria-label": labels.ignore, className: "od-message-action", onClick: () => {
                                                    onIgnore(message.id);
                                                }, title: labels.ignore, type: "button", children: _jsx(Icon, { name: "eye-off", size: 15 }) }))] })), open ? (_jsx(ReplyComposer, { ...(emoji === undefined ? {} : { emoji }), errorMessage: errorMessage, label: `${labels.replyTo} ${message.authorName}`, labels: labels, limit: limit, mention: mention?.(message) ?? "", onSend: async (text) => {
                                            await onReply(message.id, text);
                                            setOpenId(null);
                                        }, ...(onIgnore === undefined || message.state !== "new"
                                            ? {}
                                            : {
                                                onIgnore: () => {
                                                    onIgnore(message.id);
                                                    setOpenId(null);
                                                },
                                            }), suggestions: message.id === selectedId ? suggestions : [], ...(savedReplies === undefined ? {} : { savedReplies }), ...(savedRepliesLabel === undefined
                                            ? {}
                                            : { savedRepliesLabel }) }, message.id)) : null] })] }, message.id));
                }) })] }));
}
//# sourceMappingURL=Conversation.js.map