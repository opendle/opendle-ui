import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
export class ShellErrorBoundary extends Component {
    state = { failed: false, resetKey: this.props.resetKey };
    static getDerivedStateFromError(_error) {
        return { failed: true };
    }
    static getDerivedStateFromProps(props, state) {
        return props.resetKey === state.resetKey ? null : { failed: false, resetKey: props.resetKey };
    }
    componentDidCatch(_error, _errorInfo) {
        // A host telemetry adapter can record a value-free failure class here.
    }
    render() {
        if (this.state.failed) {
            return (_jsxs("main", { className: this.props.fallbackClassName ?? "od-error-shell", role: "alert", children: [_jsx("h1", { children: this.props.fallbackTitle ?? "This interface is not available" }), _jsx("p", { children: this.props.fallbackMessage ?? "Reload the page. No change was sent." })] }));
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ShellErrorBoundary.js.map