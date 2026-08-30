import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useImperativeHandle, useLayoutEffect, useRef, useState, } from "react";
async function createCodeMirrorRuntime() {
    const [autocomplete, commands, yamlLanguage, language, lint, search, state, view,] = await Promise.all([
        import("@codemirror/autocomplete"),
        import("@codemirror/commands"),
        import("@codemirror/lang-yaml"),
        import("@codemirror/language"),
        import("@codemirror/lint"),
        import("@codemirror/search"),
        import("@codemirror/state"),
        import("@codemirror/view"),
    ]);
    return {
        autocomplete,
        commands,
        language,
        lint,
        search,
        state,
        view,
        yamlLanguage,
    };
}
let codeMirrorRuntimePromise;
function loadCodeMirrorRuntime() {
    if (!codeMirrorRuntimePromise) {
        const attempt = createCodeMirrorRuntime();
        codeMirrorRuntimePromise = attempt;
        void attempt.catch(() => {
            if (codeMirrorRuntimePromise === attempt) {
                codeMirrorRuntimePromise = undefined;
            }
        });
    }
    return codeMirrorRuntimePromise;
}
const noCompletionSources = [];
const noDiagnostics = [];
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function joinIds(...values) {
    const joined = values.filter(Boolean).join(" ");
    return joined || undefined;
}
function validateDiagnostics(diagnostics) {
    for (const diagnostic of diagnostics) {
        const to = diagnostic.to ?? diagnostic.from;
        if (!Number.isSafeInteger(diagnostic.from) ||
            !Number.isSafeInteger(to) ||
            diagnostic.from < 0 ||
            to < diagnostic.from) {
            throw new Error("YamlEditor diagnostic positions must be non-negative ordered integers.");
        }
        if (diagnostic.message.trim() === "") {
            throw new Error("YamlEditor diagnostic messages must not be blank.");
        }
    }
}
function normalizeDiagnostics(diagnostics, documentLength) {
    return diagnostics.map((diagnostic) => {
        const from = Math.min(diagnostic.from, documentLength);
        const requestedTo = diagnostic.to ?? diagnostic.from;
        const to = Math.max(from, Math.min(requestedTo, documentLength));
        return {
            from,
            message: diagnostic.message,
            severity: diagnostic.severity,
            to,
        };
    });
}
function lineNumberAt(source, position) {
    const boundedPosition = Math.min(position, source.length);
    let line = 1;
    for (let index = 0; index < boundedPosition; index += 1) {
        if (source[index] === "\n")
            line += 1;
    }
    return line;
}
function diagnosticStatus(source, diagnostics) {
    if (diagnostics.length === 0)
        return "No YAML diagnostics.";
    const first = diagnostics[0];
    if (!first)
        return "No YAML diagnostics.";
    const count = `${String(diagnostics.length)} YAML diagnostic${diagnostics.length === 1 ? "" : "s"}.`;
    const severity = first.severity.charAt(0).toUpperCase() + first.severity.slice(1);
    return `${count} ${severity} on line ${String(lineNumberAt(source, first.from))}: ${first.message}`;
}
function configurationExtensions(runtime, { completionSources, describedBy, disabled, id, labelId, readOnly, hasErrors, }) {
    const { autocompletion } = runtime.autocomplete;
    const { EditorState } = runtime.state;
    const { EditorView } = runtime.view;
    const attributes = {
        "aria-invalid": hasErrors ? "true" : "false",
        "aria-labelledby": labelId,
        "aria-multiline": "true",
        id,
        spellcheck: "false",
    };
    if (describedBy)
        attributes["aria-describedby"] = describedBy;
    if (disabled) {
        attributes["aria-disabled"] = "true";
        attributes.tabindex = "-1";
    }
    if (readOnly || disabled)
        attributes["aria-readonly"] = "true";
    return [
        EditorState.readOnly.of(readOnly || disabled),
        EditorView.editable.of(!readOnly && !disabled),
        EditorView.contentAttributes.of(attributes),
        autocompletion({ override: completionSources }),
    ];
}
function replaceDocument(mounted, value) {
    const { controlledUpdate, runtime, view } = mounted;
    if (view.state.doc.toString() === value)
        return;
    view.dispatch({
        annotations: [
            controlledUpdate.of(true),
            runtime.state.Transaction.addToHistory.of(false),
        ],
        changes: { from: 0, to: view.state.doc.length, insert: value },
    });
}
function revealDiagnostic(mounted, diagnostic) {
    const documentLength = mounted.view.state.doc.length;
    const from = Math.min(diagnostic.from, documentLength);
    const requestedTo = diagnostic.to ?? diagnostic.from;
    const to = Math.max(from, Math.min(requestedTo, documentLength));
    mounted.view.dispatch({
        scrollIntoView: true,
        selection: { anchor: from, head: to },
    });
    mounted.view.focus();
}
function clearMountedEditor(reference, mounted) {
    if (reference.current === mounted)
        reference.current = null;
}
function createMountedEditor(runtime, mount, settings, handlersRef, isCancelled, getControlledValue) {
    const controlledUpdate = runtime.state.Annotation.define();
    const configuration = new runtime.state.Compartment();
    const { defaultKeymap, history, historyKeymap, indentWithTab } = runtime.commands;
    const { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, indentUnit, syntaxHighlighting, } = runtime.language;
    const { lintGutter, lintKeymap } = runtime.lint;
    const { highlightSelectionMatches, search, searchKeymap } = runtime.search;
    const { EditorState } = runtime.state;
    const { crosshairCursor, drawSelection, dropCursor, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers, rectangularSelection, } = runtime.view;
    const mountedReference = {
        current: null,
    };
    const view = new EditorView({
        doc: settings.value,
        extensions: [
            lineNumbers(),
            highlightActiveLineGutter(),
            foldGutter(),
            history(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            search({ top: true }),
            runtime.yamlLanguage.yaml(),
            indentUnit.of("  "),
            lintGutter(),
            keymap.of([
                ...searchKeymap,
                ...foldKeymap,
                ...lintKeymap,
                ...defaultKeymap,
                ...historyKeymap,
                indentWithTab,
            ]),
            configuration.of(configurationExtensions(runtime, settings)),
            EditorView.domEventHandlers({
                blur: () => {
                    handlersRef.current.onBlur?.();
                },
                focus: () => {
                    handlersRef.current.onFocus?.();
                },
            }),
            EditorView.updateListener.of((update) => {
                if (!update.docChanged)
                    return;
                if (update.transactions.some((transaction) => transaction.annotation(controlledUpdate) === true)) {
                    return;
                }
                handlersRef.current.onChange(update.state.doc.toString());
                queueMicrotask(() => {
                    const mounted = mountedReference.current;
                    if (isCancelled() || !mounted)
                        return;
                    replaceDocument(mounted, getControlledValue());
                });
            }),
        ],
        parent: mount,
    });
    const mounted = { configuration, controlledUpdate, runtime, view };
    mountedReference.current = mounted;
    return mounted;
}
function YamlEditorLoadError({ onRetry }) {
    return (_jsxs("div", { className: "od-yaml-editor-load-error", role: "alert", children: [_jsx("span", { children: "Could not load the YAML editor." }), _jsx("button", { className: "od-yaml-editor-retry", onClick: () => {
                    onRetry();
                }, type: "button", children: "Retry YAML editor" })] }));
}
function YamlEditorStatus({ diagnostics, disabled, label, onFocusDiagnostic, statusId, value, }) {
    return (_jsxs("div", { className: "od-yaml-editor-status", children: [_jsx("output", { "aria-label": `${label} status`, "aria-live": "polite", id: statusId, children: diagnosticStatus(value, diagnostics) }), diagnostics.length > 0 ? (_jsx("ul", { "aria-label": "YAML diagnostics", className: "od-yaml-editor-diagnostics", children: diagnostics.map((diagnostic, index) => (_jsx("li", { children: _jsxs("button", { disabled: disabled, onClick: () => {
                            onFocusDiagnostic(diagnostic);
                        }, type: "button", children: ["Go to ", diagnostic.severity, " on line", " ", lineNumberAt(value, diagnostic.from), ": ", diagnostic.message] }) }, `${String(diagnostic.from)}-${String(diagnostic.to ?? diagnostic.from)}-${diagnostic.severity}-${diagnostic.message}-${String(index)}`))) })) : null] }));
}
export function YamlEditor({ "aria-describedby": ariaDescribedBy, className, completionSources = noCompletionSources, diagnostics = noDiagnostics, disabled = false, id: suppliedId, label, onBlur, onChange, onFocus, readOnly = false, ref, value, }) {
    validateDiagnostics(diagnostics);
    const generatedId = useId();
    const id = suppliedId ?? `od-yaml-editor-${generatedId}`;
    const labelId = `${id}-label`;
    const statusId = `${id}-status`;
    const describedBy = joinIds(ariaDescribedBy, statusId);
    const hasErrors = diagnostics.some((diagnostic) => diagnostic.severity === "error");
    const mountRef = useRef(null);
    const mountedRef = useRef(null);
    const pendingDiagnosticRef = useRef(null);
    const pendingFocusRef = useRef(false);
    const [loadState, setLoadState] = useState({ attempt: 0, status: "loading" });
    const settingsRef = useRef({
        completionSources,
        describedBy,
        diagnostics,
        disabled,
        hasErrors,
        id,
        labelId,
        readOnly,
        value,
    });
    const handlersRef = useRef({ onBlur, onChange, onFocus });
    useLayoutEffect(() => {
        settingsRef.current = {
            completionSources,
            describedBy,
            diagnostics,
            disabled,
            hasErrors,
            id,
            labelId,
            readOnly,
            value,
        };
        handlersRef.current = { onBlur, onChange, onFocus };
    }, [
        completionSources,
        describedBy,
        diagnostics,
        disabled,
        hasErrors,
        id,
        labelId,
        onBlur,
        onChange,
        onFocus,
        readOnly,
        value,
    ]);
    useImperativeHandle(ref, () => ({
        focus() {
            pendingDiagnosticRef.current = null;
            if (settingsRef.current.disabled) {
                pendingFocusRef.current = false;
                return;
            }
            const view = mountedRef.current?.view;
            if (!view) {
                pendingFocusRef.current = true;
                return;
            }
            pendingFocusRef.current = false;
            view.focus();
            view.contentDOM.scrollIntoView({ block: "nearest" });
        },
    }), []);
    useLayoutEffect(() => {
        const mount = mountRef.current;
        if (!mount)
            return undefined;
        let cancelled = false;
        let created;
        void loadCodeMirrorRuntime()
            .then((runtime) => {
            if (cancelled || !mount.isConnected)
                return;
            const settings = settingsRef.current;
            const mounted = createMountedEditor(runtime, mount, settings, handlersRef, () => cancelled, () => settingsRef.current.value);
            const { view } = mounted;
            created = mounted;
            mountedRef.current = mounted;
            const pendingDiagnostic = pendingDiagnosticRef.current;
            pendingDiagnosticRef.current = null;
            if (settings.disabled) {
                pendingFocusRef.current = false;
            }
            else if (pendingDiagnostic) {
                pendingFocusRef.current = false;
                revealDiagnostic(mounted, pendingDiagnostic);
                view.contentDOM.scrollIntoView({ block: "nearest" });
            }
            else if (pendingFocusRef.current) {
                pendingFocusRef.current = false;
                view.focus();
                view.contentDOM.scrollIntoView({ block: "nearest" });
            }
            view.dispatch(runtime.lint.setDiagnostics(view.state, normalizeDiagnostics(settings.diagnostics, view.state.doc.length)));
            setLoadState((state) => ({ ...state, status: "ready" }));
        })
            .catch(() => {
            if (cancelled)
                return;
            if (created) {
                created.view.destroy();
                clearMountedEditor(mountedRef, created);
                created = undefined;
            }
            else {
                mount.replaceChildren();
            }
            setLoadState((state) => ({ ...state, status: "failed" }));
        });
        return () => {
            cancelled = true;
            created?.view.destroy();
            clearMountedEditor(mountedRef, created);
        };
    }, [loadState.attempt]);
    useLayoutEffect(() => {
        const mounted = mountedRef.current;
        if (!mounted)
            return;
        replaceDocument(mounted, value);
    }, [value]);
    useLayoutEffect(() => {
        const mounted = mountedRef.current;
        if (!mounted)
            return;
        mounted.view.dispatch({
            effects: mounted.configuration.reconfigure(configurationExtensions(mounted.runtime, {
                completionSources,
                describedBy,
                disabled,
                hasErrors,
                id,
                labelId,
                readOnly,
            })),
        });
        if (disabled) {
            pendingDiagnosticRef.current = null;
            pendingFocusRef.current = false;
            if (mounted.view.hasFocus)
                mounted.view.contentDOM.blur();
        }
    }, [
        completionSources,
        describedBy,
        disabled,
        hasErrors,
        id,
        labelId,
        readOnly,
    ]);
    useLayoutEffect(() => {
        const mounted = mountedRef.current;
        if (!mounted)
            return;
        mounted.view.dispatch(mounted.runtime.lint.setDiagnostics(mounted.view.state, normalizeDiagnostics(diagnostics, mounted.view.state.doc.length)));
    }, [diagnostics, value]);
    function focusDiagnostic(diagnostic) {
        if (disabled)
            return;
        const mounted = mountedRef.current;
        if (!mounted) {
            pendingDiagnosticRef.current = diagnostic;
            pendingFocusRef.current = true;
            return;
        }
        pendingDiagnosticRef.current = null;
        pendingFocusRef.current = false;
        revealDiagnostic(mounted, diagnostic);
    }
    return (_jsxs("div", { className: classes("od-yaml-editor", className), "data-disabled": disabled || undefined, "data-invalid": hasErrors || undefined, "data-read-only": readOnly || undefined, children: [_jsx("div", { className: "od-yaml-editor-heading", children: _jsx("span", { className: "od-yaml-editor-label", id: labelId, children: label }) }), _jsx("div", { className: "od-yaml-editor-mount", id: `${id}-mount`, ref: mountRef }), loadState.status === "loading" ? (_jsx("output", { "aria-live": "polite", className: "od-yaml-editor-load-state", children: "Loading YAML editor\u2026" })) : null, loadState.status === "failed" ? (_jsx(YamlEditorLoadError, { onRetry: () => {
                    setLoadState((state) => ({
                        attempt: state.attempt + 1,
                        status: "loading",
                    }));
                } })) : null, _jsx(YamlEditorStatus, { diagnostics: diagnostics, disabled: disabled, label: label, onFocusDiagnostic: focusDiagnostic, statusId: statusId, value: value })] }));
}
//# sourceMappingURL=YamlEditor.js.map