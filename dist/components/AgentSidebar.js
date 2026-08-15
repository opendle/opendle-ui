import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { Icon } from "../index.js";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
export function AgentSidebar({ children, className, agentName = "Agent", composerLabel = "Ask the agent to work on this page", contextLabel, isCollapsed = false, isOpen, onClose, onRunStop, onSend, placeholder = "Ask about this page…", runStopped = false, safetyNote = "Changes use your workspace policy", statusText = "Working", workspaceName, }) {
    const messageId = useId();
    const [message, setMessage] = useState("");
    const [sentMessage, setSentMessage] = useState(null);
    const [pageContextIncluded, setPageContextIncluded] = useState(true);
    function sendMessage(event) {
        event.preventDefault();
        const trimmed = message.trim();
        if (!trimmed)
            return;
        setSentMessage(trimmed);
        setMessage("");
        onSend?.(trimmed);
    }
    function onMessageKeyDown(event) {
        if (event.key !== "Enter" || event.nativeEvent.isComposing)
            return;
        if (event.shiftKey || event.metaKey) {
            event.preventDefault();
            const textarea = event.currentTarget;
            textarea.setRangeText("\n", textarea.selectionStart, textarea.selectionEnd, "end");
            setMessage(textarea.value);
            return;
        }
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
    }
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: "od-agent-backdrop agent-backdrop", "data-open": isOpen, type: "button", onClick: onClose, "aria-label": "Close agent", tabIndex: isOpen ? 0 : -1 }), _jsxs("aside", { className: ["od-agent-sidebar", "agent-panel", className].filter(Boolean).join(" "), "data-open": isOpen, "data-collapsed": isCollapsed, "aria-label": "Agent", children: [_jsxs("div", { className: "od-agent-header agent-header", children: [_jsxs("div", { className: "od-agent-identity agent-identity", children: [_jsx("span", { className: "od-agent-avatar agent-avatar", children: _jsx(Icon, { name: "spark", size: 18 }) }), _jsxs("span", { children: [_jsx("strong", { children: agentName }), _jsxs("small", { children: [workspaceName, " workspace"] }), _jsxs("small", { children: [_jsx("i", { "aria-hidden": "true" }), " Ready"] })] })] }), _jsx("button", { className: "od-icon-button agent-close icon-button", type: "button", onClick: onClose, "aria-label": "Close agent", children: "\u00D7" })] }), _jsxs("div", { className: "od-agent-context agent-context", children: [_jsx("span", { children: "Using page context" }), pageContextIncluded ? _jsxs("button", { type: "button", "aria-label": `Remove ${String(contextLabel)} context`, onClick: () => setPageContextIncluded(false), children: [_jsx(Icon, { name: "file", size: 14 }), contextLabel, _jsx("span", { "aria-hidden": "true", children: "\u00D7" })] }) : _jsx("output", { children: "Page context removed" })] }), _jsxs("div", { className: "od-agent-conversation agent-conversation", "aria-live": "polite", children: [sentMessage ? _jsx("div", { className: "od-agent-user-message user-message", children: _jsx("p", { children: sentMessage }) }) : null, children] }), _jsxs("div", { className: "od-agent-composer-area agent-composer-area", children: [_jsxs("div", { className: "od-agent-run-status run-status", "data-stopped": runStopped, children: [_jsxs("span", { className: "working-dots", "aria-hidden": "true", children: [_jsx("i", {}), _jsx("i", {}), _jsx("i", {})] }), runStopped ? "Run stopped" : statusText, onRunStop ? _jsxs("button", { type: "button", "aria-label": "Stop current agent run", onClick: onRunStop, disabled: runStopped, children: [_jsx("span", { "aria-hidden": "true", children: "\u25A0" }), " Stop"] }) : null] }), _jsxs("form", { className: "od-agent-composer agent-composer", onSubmit: sendMessage, children: [_jsx("label", { htmlFor: messageId, children: composerLabel }), _jsx(AutoGrowTextarea, { id: messageId, "aria-label": composerLabel, value: message, onChange: (event) => setMessage(event.target.value), onKeyDown: onMessageKeyDown, placeholder: placeholder, rows: 1, maxHeight: 180 }), _jsxs("div", { children: [_jsxs("button", { className: "od-agent-context-button composer-context-button", type: "button", "aria-pressed": pageContextIncluded, onClick: () => setPageContextIncluded((included) => !included), children: [_jsx(Icon, { name: "activity", size: 16 }), " ", pageContextIncluded ? "Page context on" : "Add page context"] }), _jsx("button", { className: "od-button od-button-icon send-button", type: "submit", "aria-label": "Send message", disabled: !message.trim(), children: _jsx(Icon, { name: "arrow-up", size: 18 }) })] })] }), _jsxs("p", { className: "od-agent-safety-note agent-safety-note", children: [_jsx(Icon, { name: "shield", size: 13 }), " ", safetyNote] })] })] })] }));
}
//# sourceMappingURL=AgentSidebar.js.map