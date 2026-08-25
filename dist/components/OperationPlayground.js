import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
import { Button } from "./Button.js";
const allOperations = [
    "model",
    "embedding",
    "image",
    "video",
    "audio",
];
const operationNames = new Set(allOperations);
const selectionKinds = new Set(["assignment", "provider-model"]);
const controlNames = new Set([
    "input-images",
    "system-prompt",
    "temperature",
    "output-limit",
]);
const fixedTargetStateNames = new Set(["available", "unavailable"]);
const operationLabels = {
    model: "Model",
    embedding: "Embedding",
    image: "Image",
    video: "Video",
    audio: "Audio",
};
const noInputImages = [];
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function validateIdentities(name, options) {
    const ids = new Set();
    for (const option of options) {
        if (ids.has(option.id)) {
            throw new Error(`${name} id must be unique: ${option.id}`);
        }
        ids.add(option.id);
    }
}
function validateOperations(operations) {
    if (operations.length === 0) {
        throw new Error("Available playground operations must not be empty.");
    }
    if (new Set(operations).size !== operations.length) {
        throw new Error("Available playground operations must be unique.");
    }
    for (const operation of operations) {
        if (!operationNames.has(operation)) {
            throw new Error(`Unknown playground operation: ${operation}`);
        }
    }
}
function selectableControls(operation) {
    if (operation === "model") {
        return ["input-images", "system-prompt", "temperature", "output-limit"];
    }
    return operation === "image" || operation === "video" ? ["input-images"] : [];
}
function validateFixedTarget(target) {
    if (!selectionKinds.has(target.selection.kind)) {
        throw new Error(`Unknown fixed playground target kind: ${target.selection.kind}`);
    }
    if (target.selection.id.trim() === "") {
        throw new Error("A fixed playground target id must not be empty.");
    }
    if (target.label.trim() === "") {
        throw new Error("A fixed playground target label must not be empty.");
    }
    const operations = target.operations.map((item) => item.operation);
    validateOperations(operations);
    if (target.state !== undefined &&
        !fixedTargetStateNames.has(target.state.status)) {
        throw new Error(`Unknown fixed playground target state: ${target.state.status}`);
    }
    for (const item of target.operations) {
        if (!Array.isArray(item.controls)) {
            throw new Error(`Fixed playground controls must be declared for ${item.operation}.`);
        }
        const controls = item.controls;
        const controlSet = new Set(controls);
        if (controlSet.size !== controls.length) {
            throw new Error(`Fixed playground controls must be unique for ${item.operation}.`);
        }
        for (const control of controls) {
            if (typeof control !== "string" || !controlNames.has(control)) {
                throw new Error(`Unknown fixed playground control: ${String(control)}`);
            }
        }
        if (item.operation !== "model" &&
            (controlSet.has("system-prompt") ||
                controlSet.has("temperature") ||
                controlSet.has("output-limit"))) {
            throw new Error(`Model controls are not valid for the ${item.operation} operation.`);
        }
        if (!includesImageInput(item.operation) && controlSet.has("input-images")) {
            throw new Error(`Input images are not valid for the ${item.operation} operation.`);
        }
    }
}
function validateObjectUrl(name, value) {
    let protocol;
    try {
        protocol = new URL(value).protocol;
    }
    catch {
        throw new Error(`${name} must be a valid blob URL.`);
    }
    if (protocol !== "blob:") {
        throw new Error(`${name} must use the blob protocol.`);
    }
}
function validateOutput(output) {
    if (output.kind !== "image" &&
        output.kind !== "video" &&
        output.kind !== "audio") {
        return;
    }
    validateObjectUrl("Media output object URL", output.objectUrl);
    if (output.kind !== "image" && output.captions !== undefined) {
        validateObjectUrl("Media captions object URL", output.captions.objectUrl);
    }
}
function inputCopy(operation) {
    if (operation === "embedding") {
        return {
            label: "Input text",
            help: "Put each input item on a new line.",
        };
    }
    if (operation === "audio") {
        return {
            label: "Text",
            help: "Enter the text for the audio operation.",
        };
    }
    return {
        label: "Prompt",
        help: `Enter the prompt for the ${operationLabels[operation].toLowerCase()} operation.`,
    };
}
function includesImageInput(operation) {
    return (operation === "model" || operation === "image" || operation === "video");
}
function optionExists(options, id) {
    return options.some((option) => option.id === id && option.disabled !== true);
}
function firstEnabledOption(options) {
    return options.find((option) => option.disabled !== true);
}
function targetOptions(kind, assignmentOptions, providerModelOptions) {
    return kind === "assignment" ? assignmentOptions : providerModelOptions;
}
function optionalNumber(event) {
    const value = event.currentTarget.valueAsNumber;
    return event.currentTarget.value === "" || !Number.isFinite(value)
        ? null
        : value;
}
function SelectionControls({ assignmentOptions, disabled, id, onValueChange, providerModelOptions, value, }) {
    const options = targetOptions(value.selection.kind, assignmentOptions, providerModelOptions);
    const noEnabledOptions = firstEnabledOption(options) === undefined;
    const selectionId = optionExists(options, value.selection.id)
        ? value.selection.id
        : "";
    const emptyLabel = value.selection.kind === "assignment"
        ? "No assignments available"
        : "No provider-models available";
    const selectLabel = value.selection.kind === "assignment"
        ? "Assignment"
        : "Exact provider-model";
    function changeSelectionKind(kind) {
        const nextOptions = targetOptions(kind, assignmentOptions, providerModelOptions);
        onValueChange({
            ...value,
            selection: {
                kind,
                id: firstEnabledOption(nextOptions)?.id ?? "",
            },
        });
    }
    return (_jsxs("fieldset", { className: "od-playground-route-fields", children: [_jsx("legend", { children: "Route selection" }), _jsxs("div", { className: "od-playground-route-kind", children: [_jsxs("label", { children: [_jsx("input", { "aria-label": "Use assignment route", checked: value.selection.kind === "assignment", disabled: disabled || firstEnabledOption(assignmentOptions) === undefined, name: `${id}-route-kind`, onChange: () => {
                                    changeSelectionKind("assignment");
                                }, type: "radio" }), _jsxs("span", { children: [_jsx("strong", { children: "Assignment" }), _jsx("small", { children: "Use its ordered route." })] })] }), _jsxs("label", { children: [_jsx("input", { "aria-label": "Use exact provider-model route", checked: value.selection.kind === "provider-model", disabled: disabled || firstEnabledOption(providerModelOptions) === undefined, name: `${id}-route-kind`, onChange: () => {
                                    changeSelectionKind("provider-model");
                                }, type: "radio" }), _jsxs("span", { children: [_jsx("strong", { children: "Exact provider-model" }), _jsx("small", { children: "Use one exact route." })] })] })] }), _jsxs("label", { className: "od-playground-field", htmlFor: `${id}-target`, children: [_jsx("span", { children: selectLabel }), _jsxs("select", { disabled: disabled || noEnabledOptions, id: `${id}-target`, onChange: (event) => {
                            onValueChange({
                                ...value,
                                selection: {
                                    ...value.selection,
                                    id: event.currentTarget.value,
                                },
                            });
                        }, required: true, value: selectionId, children: [_jsx("option", { value: "", children: noEnabledOptions
                                    ? emptyLabel
                                    : `Select ${selectLabel.toLowerCase()}` }), options.map((option) => (_jsxs("option", { disabled: option.disabled, value: option.id, children: [option.label, option.detail === undefined ? "" : ` · ${option.detail}`] }, option.id)))] })] })] }));
}
function FixedTargetSummary({ changeTargetLabel, disabled, onChangeTarget, target, }) {
    const kindLabel = target.selection.kind === "assignment"
        ? "Assignment"
        : "Exact provider-model";
    return (_jsxs("section", { className: "od-playground-fixed-target", "aria-label": `${kindLabel} target: ${target.label}`, children: [_jsxs("div", { children: [_jsx("span", { children: kindLabel }), _jsx("strong", { children: target.label }), target.detail === undefined ? null : _jsx("small", { children: target.detail })] }), target.context === undefined ? null : (_jsx("dl", { children: _jsxs("div", { children: [_jsx("dt", { children: target.context.label }), _jsx("dd", { children: target.context.value })] }) })), onChangeTarget === undefined ? null : (_jsx(Button, { disabled: disabled, onClick: onChangeTarget, type: "button", variant: "quiet", children: changeTargetLabel })), target.state?.status !== "unavailable" ? null : (_jsxs("p", { className: "od-playground-target-unavailable", role: "status", children: [_jsx("strong", { children: "Target unavailable" }), _jsx("span", { children: target.state.message })] }))] }));
}
function ImageInputControls({ disabled, id, images, onAdd, onRemove, }) {
    if (onAdd === undefined && images.length === 0)
        return null;
    return (_jsxs("fieldset", { className: "od-playground-image-fields", children: [_jsx("legend", { children: "Input images" }), _jsx("p", { children: "JPEG, PNG, and WebP files are supported." }), onAdd === undefined ? null : (_jsxs("label", { className: "od-playground-file-field", htmlFor: `${id}-images`, children: [_jsx("span", { children: "Add input images" }), _jsx("input", { accept: "image/jpeg,image/png,image/webp", "aria-label": "Add input images", disabled: disabled, id: `${id}-images`, multiple: true, onChange: (event) => {
                            const files = Array.from(event.currentTarget.files ?? []);
                            if (files.length > 0)
                                onAdd(files);
                            event.currentTarget.value = "";
                        }, type: "file" })] })), images.length === 0 ? (_jsx("p", { className: "od-playground-image-empty", children: "No input images" })) : (_jsx("ul", { className: "od-playground-image-list", children: images.map((image) => (_jsxs("li", { children: [_jsxs("span", { children: [_jsx("strong", { children: image.name }), image.detail === undefined ? null : (_jsx("small", { children: image.detail }))] }), onRemove === undefined ? null : (_jsx(Button, { "aria-label": `Remove ${image.name}`, disabled: disabled, onClick: () => {
                                onRemove(image.id);
                            }, variant: "quiet", children: "Remove" }))] }, image.id))) }))] }));
}
function PlaygroundForm({ availableOperations, busy, controlsDisabled, controlsForOperation, headingLevel, id, images, onAddInputImages, onRemoveInputImage, onReset, onRun, onValueChange, resetLabel, routeControls, runDisabled, runLabel, showOperationSelect, targetSummary, value, }) {
    const Heading = headingLevel;
    const effectiveOperation = availableOperations.includes(value.operation)
        ? value.operation
        : null;
    const input = effectiveOperation === null ? null : inputCopy(effectiveOperation);
    const activeControls = effectiveOperation === null ? [] : controlsForOperation(effectiveOperation);
    const showModelControls = activeControls.some((control) => ["system-prompt", "temperature", "output-limit"].includes(control));
    function submit(event) {
        event.preventDefault();
        if (effectiveOperation === null ||
            runDisabled ||
            value.input.trim() === "") {
            return;
        }
        onRun(value);
    }
    return (_jsxs("form", { "aria-busy": busy, "aria-labelledby": `${id}-title ${id}-controls-title`, className: "od-playground-form", onSubmit: submit, children: [_jsx(Heading, { id: `${id}-controls-title`, children: "Request" }), targetSummary, !showOperationSelect ? null : (_jsxs("label", { className: "od-playground-field", htmlFor: `${id}-operation`, children: [_jsx("span", { children: "Operation" }), _jsxs("select", { disabled: controlsDisabled, id: `${id}-operation`, onChange: (event) => {
                            onValueChange({
                                ...value,
                                operation: event.currentTarget.value,
                            });
                        }, required: true, value: effectiveOperation ?? "", children: [effectiveOperation === null ? (_jsx("option", { value: "", children: "Select an operation" })) : null, availableOperations.map((operation) => (_jsx("option", { value: operation, children: operationLabels[operation] }, operation)))] })] })), routeControls, input === null ? null : (_jsxs("label", { className: "od-playground-field", htmlFor: `${id}-input`, children: [_jsx("span", { children: input.label }), _jsx(AutoGrowTextarea, { "aria-describedby": `${id}-input-help`, disabled: controlsDisabled, id: `${id}-input`, maxHeight: 360, onChange: (event) => {
                            onValueChange({ ...value, input: event.currentTarget.value });
                        }, required: true, rows: effectiveOperation === "embedding" ? 6 : 5, value: value.input }), _jsx("small", { id: `${id}-input-help`, children: input.help })] })), showModelControls ? (_jsxs("details", { className: "od-playground-optional-controls", children: [_jsx("summary", { children: "Model controls" }), _jsxs("div", { children: [activeControls.includes("system-prompt") ? (_jsxs("label", { className: "od-playground-field", htmlFor: `${id}-system-prompt`, children: [_jsx("span", { children: "System prompt" }), _jsx(AutoGrowTextarea, { disabled: controlsDisabled, id: `${id}-system-prompt`, maxHeight: 240, onChange: (event) => {
                                            onValueChange({
                                                ...value,
                                                systemPrompt: event.currentTarget.value,
                                            });
                                        }, rows: 3, value: value.systemPrompt })] })) : null, activeControls.includes("temperature") ||
                                activeControls.includes("output-limit") ? (_jsxs("div", { className: "od-playground-number-fields", children: [activeControls.includes("temperature") ? (_jsxs("label", { className: "od-playground-field", htmlFor: `${id}-temperature`, children: [_jsx("span", { children: "Temperature" }), _jsx("input", { "aria-label": "Temperature", disabled: controlsDisabled, id: `${id}-temperature`, max: 2, min: 0, onChange: (event) => {
                                                    onValueChange({
                                                        ...value,
                                                        temperature: optionalNumber(event),
                                                    });
                                                }, step: 0.1, type: "number", value: value.temperature ?? "" })] })) : null, activeControls.includes("output-limit") ? (_jsxs("label", { className: "od-playground-field", htmlFor: `${id}-output-limit`, children: [_jsx("span", { children: "Output limit" }), _jsx("input", { "aria-label": "Output limit", disabled: controlsDisabled, id: `${id}-output-limit`, max: 1000000, min: 1, onChange: (event) => {
                                                    onValueChange({
                                                        ...value,
                                                        outputLimit: optionalNumber(event),
                                                    });
                                                }, step: 1, type: "number", value: value.outputLimit ?? "" })] })) : null] })) : null] })] })) : null, activeControls.includes("input-images") ? (_jsx(ImageInputControls, { disabled: controlsDisabled, id: id, images: images, onAdd: onAddInputImages, onRemove: onRemoveInputImage })) : null, _jsxs("footer", { className: "od-playground-actions", children: [onReset === undefined ? null : (_jsx(Button, { disabled: controlsDisabled, onClick: onReset, variant: "secondary", children: resetLabel })), _jsx(Button, { disabled: runDisabled ||
                            effectiveOperation === null ||
                            value.input.trim() === "", type: "submit", children: runLabel })] })] }));
}
function ResultOutput({ output }) {
    if (output.kind === "text" || output.kind === "json") {
        return (_jsx(_Fragment, { children: _jsx("pre", { "aria-label": output.kind === "json" ? "JSON output" : "Text output", className: "od-playground-text-output", "data-output-kind": output.kind, role: "region", tabIndex: 0, children: output.content || "No output content" }) }));
    }
    if (output.kind === "embedding") {
        return (_jsxs("div", { className: "od-playground-embedding-output", children: [_jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "Vectors" }), _jsx("dd", { children: String(output.vectorCount) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Dimensions" }), _jsx("dd", { children: String(output.dimensions) })] })] }), output.preview === undefined || output.preview.length === 0 ? null : (_jsxs("details", { children: [_jsx("summary", { children: "Vector preview" }), _jsx("code", { children: output.preview.slice(0, 12).join(", ") })] }))] }));
    }
    if (output.kind === "image") {
        return (_jsxs("figure", { className: "od-playground-media-output", children: [_jsx("img", { alt: output.label, referrerPolicy: "no-referrer", src: output.objectUrl }), _jsx("figcaption", { children: output.label })] }));
    }
    if (output.kind === "video") {
        return (_jsxs("figure", { className: "od-playground-media-output", children: [_jsxs("video", { "aria-label": output.label, controls: true, preload: "metadata", children: [_jsx("source", { src: output.objectUrl, type: output.mediaType }), output.captions === undefined ? null : (_jsx("track", { default: true, kind: "captions", label: output.captions.label, src: output.captions.objectUrl, srcLang: output.captions.language }))] }), _jsx("figcaption", { children: output.label })] }));
    }
    return (_jsxs("figure", { className: "od-playground-media-output", children: [_jsxs("audio", { "aria-label": output.label, controls: true, preload: "metadata", children: [_jsx("source", { src: output.objectUrl, type: output.mediaType }), output.captions === undefined ? null : (_jsx("track", { default: true, kind: "captions", label: output.captions.label, src: output.captions.objectUrl, srcLang: output.captions.language }))] }), _jsx("figcaption", { children: output.label })] }));
}
function ResultFacts({ headingLevel, id, result, }) {
    const Heading = headingLevel;
    return (_jsxs("div", { className: "od-playground-result-facts", children: [_jsxs("dl", { className: "od-playground-route-metrics", children: [_jsxs("div", { children: [_jsx("dt", { children: "Selected route" }), _jsxs("dd", { children: [_jsx("strong", { children: result.selectedRoute.label }), result.selectedRoute.detail === undefined ? null : (_jsx("small", { children: result.selectedRoute.detail }))] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Latency" }), _jsx("dd", { children: result.latencyMs === null
                                    ? "Not reported"
                                    : `${String(result.latencyMs)} ms` })] }), _jsxs("div", { children: [_jsx("dt", { children: "Cost" }), _jsx("dd", { children: result.cost === null
                                    ? "Not reported"
                                    : `${result.cost.amount} ${result.cost.currency}` })] })] }), _jsxs("section", { "aria-labelledby": `${id}-usage-title`, className: "od-playground-usage", children: [_jsx(Heading, { id: `${id}-usage-title`, children: "Usage" }), result.usage.length === 0 ? (_jsx("p", { children: "No usage reported" })) : (_jsx("dl", { children: result.usage.map((item) => (_jsxs("div", { children: [_jsx("dt", { children: item.label }), _jsx("dd", { children: item.value })] }, item.id))) }))] })] }));
}
function PlaygroundResultState({ id, sectionHeadingLevel, state, }) {
    const factHeadingLevel = sectionHeadingLevel === "h3" ? "h4" : "h5";
    if (state.status === "empty") {
        return (_jsxs("output", { "aria-live": "polite", className: "od-playground-state od-playground-state-empty", children: [_jsx("strong", { children: "No result" }), _jsx("span", { children: state.message ?? "Run an operation to see its result." })] }));
    }
    if (state.status === "loading") {
        return (_jsxs("div", { "aria-busy": "true", className: "od-playground-state od-playground-state-loading", children: [_jsx("span", { "aria-hidden": "true" }), _jsxs("output", { "aria-live": "polite", children: [_jsx("strong", { children: "Operation running" }), _jsx("span", { children: state.message ?? "Wait for the result." })] })] }));
    }
    if (state.status === "error") {
        return (_jsxs("section", { "aria-live": "assertive", className: "od-playground-state od-playground-state-error", role: "alert", children: [_jsx("strong", { children: state.error.title }), _jsx("p", { children: state.error.message }), _jsxs("div", { className: "od-playground-error-correction", children: [_jsx("strong", { children: "How to correct it" }), _jsx("p", { children: state.error.correction })] }), state.error.code === undefined ? null : (_jsxs("p", { className: "od-playground-error-code", children: ["Code: ", _jsx("code", { children: state.error.code })] }))] }));
    }
    return (_jsxs("section", { "aria-labelledby": `${id}-result-title`, "aria-live": "polite", className: "od-playground-success", role: "status", children: [_jsx("strong", { id: `${id}-result-title`, children: "Result ready" }), _jsx(ResultOutput, { output: state.result.output }), _jsx(ResultFacts, { headingLevel: factHeadingLevel, id: id, result: state.result })] }));
}
/**
 * A controlled playground for provider-neutral model, embedding, and media operations.
 * Hosts own calls, credentials, data access, routing, state, and mutations.
 */
export function OperationPlayground(props) {
    const { className, description, disabled = false, headingLevel = "h2", id, inputImages = noInputImages, onAddInputImages, onRemoveInputImage, onReset, resetLabel = "Reset", runLabel = "Run operation", runState, title, } = props;
    validateIdentities("Input image", inputImages);
    if (runState.status === "success") {
        validateIdentities("Usage item", runState.result.usage);
        validateOutput(runState.result.output);
    }
    const Heading = headingLevel;
    const sectionHeadingLevel = headingLevel === "h2" ? "h3" : "h4";
    const SectionHeading = sectionHeadingLevel;
    const loading = runState.status === "loading";
    const controlsDisabled = disabled || loading;
    let availableOperations;
    let controlsForOperation;
    let requestValue;
    let routeControls;
    let targetSummary;
    let runDisabled;
    let showOperationSelect;
    let onRequestValueChange;
    let onRequestRun;
    if (props.fixedTarget === undefined) {
        availableOperations = props.availableOperations ?? allOperations;
        validateOperations(availableOperations);
        validateIdentities("Assignment option", props.assignmentOptions);
        validateIdentities("Provider-model option", props.providerModelOptions);
        const options = targetOptions(props.value.selection.kind, props.assignmentOptions, props.providerModelOptions);
        requestValue = props.value;
        controlsForOperation = selectableControls;
        routeControls = (_jsx(SelectionControls, { assignmentOptions: props.assignmentOptions, disabled: controlsDisabled, id: id, onValueChange: props.onValueChange, providerModelOptions: props.providerModelOptions, value: props.value }));
        targetSummary = undefined;
        runDisabled =
            controlsDisabled || !optionExists(options, props.value.selection.id);
        showOperationSelect = true;
        onRequestValueChange = (value) => {
            props.onValueChange({ ...props.value, ...value });
        };
        onRequestRun = () => {
            props.onRun(props.value);
        };
    }
    else {
        validateFixedTarget(props.fixedTarget);
        availableOperations = props.fixedTarget.operations.map((item) => item.operation);
        requestValue = props.value;
        controlsForOperation = (operation) => props.fixedTarget.operations.find((item) => item.operation === operation)
            ?.controls ?? [];
        routeControls = undefined;
        targetSummary = (_jsx(FixedTargetSummary, { changeTargetLabel: props.changeTargetLabel ?? "Change target", disabled: controlsDisabled, onChangeTarget: props.onChangeTarget, target: props.fixedTarget }));
        runDisabled =
            controlsDisabled || props.fixedTarget.state?.status === "unavailable";
        showOperationSelect =
            availableOperations.length > 1 ||
                !availableOperations.includes(props.value.operation);
        onRequestValueChange = props.onValueChange;
        onRequestRun = (value) => {
            props.onRun(value, props.fixedTarget.selection);
        };
    }
    const selectedOperation = availableOperations.includes(requestValue.operation)
        ? requestValue.operation
        : null;
    return (_jsxs("section", { "aria-labelledby": `${id}-title`, className: classes("od-playground", className), "data-operation": selectedOperation ?? undefined, "data-target-mode": props.fixedTarget === undefined ? "selectable" : "fixed", children: [_jsxs("header", { className: "od-playground-heading", children: [_jsxs("div", { children: [_jsx(Heading, { id: `${id}-title`, children: title }), description === undefined ? null : _jsx("p", { children: description })] }), _jsx("span", { children: selectedOperation === null
                            ? "Operation unavailable"
                            : operationLabels[selectedOperation] })] }), _jsx(PlaygroundForm, { availableOperations: availableOperations, busy: loading, controlsDisabled: controlsDisabled, controlsForOperation: controlsForOperation, headingLevel: sectionHeadingLevel, id: id, images: inputImages, onAddInputImages: onAddInputImages, onRemoveInputImage: onRemoveInputImage, onReset: onReset, onRun: onRequestRun, onValueChange: onRequestValueChange, resetLabel: resetLabel, routeControls: routeControls, runDisabled: runDisabled, runLabel: loading ? "Running…" : runLabel, showOperationSelect: showOperationSelect, targetSummary: targetSummary, value: requestValue }), _jsxs("section", { "aria-labelledby": `${id}-title ${id}-output-title`, className: "od-playground-output", children: [_jsx(SectionHeading, { id: `${id}-output-title`, children: "Output" }), _jsx(PlaygroundResultState, { id: id, sectionHeadingLevel: sectionHeadingLevel, state: runState })] })] }));
}
//# sourceMappingURL=OperationPlayground.js.map