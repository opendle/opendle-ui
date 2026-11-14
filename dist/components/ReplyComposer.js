import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
import { Button } from "./Button.js";
import { EmojiPicker } from "./EmojiPicker.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { useAsyncAction } from "./useAsyncAction.js";
const countFormat = new Intl.NumberFormat();
const noSuggestions = [];
/**
 * A reply box: suggestions, a textarea that grows, an emoji button, a
 * character counter and the send button. Enter sends. Shift+Enter adds a line.
 */
export function ReplyComposer({ errorMessage, label, labels, limit = null, mention = "", onSend, suggestions = noSuggestions, }) {
    const prefix = mention === "" ? "" : `${mention} `;
    const [text, setText] = useState(prefix);
    const send = useAsyncAction(errorMessage);
    const areaRef = useRef(null);
    const length = Array.from(text).length;
    const tooLong = limit !== null && length > limit;
    const ready = text.trim() !== "" && text.trim() !== mention && !tooLong;
    const focusEnd = (area) => {
        if (area === null || areaRef.current === area)
            return;
        areaRef.current = area;
        area.focus({ preventScroll: true });
        area.setSelectionRange(area.value.length, area.value.length);
    };
    const submit = () => {
        if (!ready || send.pending)
            return;
        void send.run(() => onSend(text.trim()));
    };
    const keyDown = (event) => {
        if (event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
        }
    };
    const insert = (emoji) => {
        const area = areaRef.current;
        const start = area?.selectionStart ?? text.length;
        const end = area?.selectionEnd ?? text.length;
        setText(text.slice(0, start) + emoji + text.slice(end));
        area?.focus();
    };
    return (_jsxs("div", { className: "od-reply", children: [suggestions.length === 0 ? null : (_jsx("fieldset", { "aria-label": labels.suggestions, className: "od-reply-suggestions", children: suggestions.map((suggestion) => (_jsx("button", { onClick: () => {
                        setText(prefix + suggestion);
                        areaRef.current?.focus();
                    }, type: "button", children: suggestion }, suggestion))) })), _jsxs("div", { className: "od-reply-field", "data-invalid": tooLong, children: [_jsx(AutoGrowTextarea, { "aria-label": label, className: "od-reply-text", disabled: send.pending, onChange: (event) => {
                            setText(event.currentTarget.value);
                        }, onKeyDown: keyDown, ref: focusEnd, rows: 2, value: text }), _jsxs("div", { className: "od-reply-foot", children: [_jsx(EmojiPicker, { disabled: send.pending, label: labels.emoji, onSelect: insert }), limit === null ? null : (_jsxs("span", { className: "od-reply-counter", "data-invalid": tooLong, children: [countFormat.format(length), " / ", countFormat.format(limit)] })), _jsx(Button, { className: "od-reply-send", disabled: !ready || send.pending, icon: _jsx(Icon, { name: "send", size: 15 }), onClick: submit, children: labels.send })] })] }), send.failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: send.failure }))] }));
}
//# sourceMappingURL=ReplyComposer.js.map