import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useRef, useState, } from "react";
import { classes } from "./classes.js";
/**
 * Text that the user edits in place. A double click or the Enter key starts
 * the edit. Enter saves and Escape cancels.
 */
export function InlineEditableText({ className, label, maxLength, onSave, value, }) {
    const [draft, setDraft] = useState(null);
    const [pending, setPending] = useState(false);
    const buttonRef = useRef(null);
    const restoreFocus = useRef(false);
    const focusInput = useCallback((input) => {
        if (input === null)
            return;
        input.focus();
        input.select();
    }, []);
    const focusButton = useCallback((button) => {
        buttonRef.current = button;
        if (button !== null && restoreFocus.current) {
            restoreFocus.current = false;
            button.focus();
        }
    }, []);
    const stop = useCallback(() => {
        restoreFocus.current = true;
        setDraft(null);
    }, []);
    const save = useCallback(async () => {
        const next = (draft ?? "").trim();
        if (next === "" || next === value) {
            stop();
            return;
        }
        setPending(true);
        try {
            await onSave(next);
            stop();
        }
        catch {
            // The host shows the failure. The editor stays open for a new attempt.
        }
        finally {
            setPending(false);
        }
    }, [draft, onSave, stop, value]);
    if (draft === null) {
        return (_jsx("button", { "aria-label": label, className: classes("od-inline-editable", className), onClick: (event) => {
                // A keyboard activation has no click count.
                if (event.detail === 0)
                    setDraft(value);
            }, onDoubleClick: () => {
                setDraft(value);
            }, ref: focusButton, title: label, type: "button", children: value }));
    }
    return (_jsx("input", { "aria-label": label, className: classes("od-inline-editable-input", className), readOnly: pending, maxLength: maxLength, onBlur: () => {
            if (!pending)
                setDraft(null);
        }, onChange: (event) => {
            setDraft(event.currentTarget.value);
        }, onKeyDown: (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                void save();
            }
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                stop();
            }
        }, ref: focusInput, value: draft }));
}
//# sourceMappingURL=InlineEditableText.js.map