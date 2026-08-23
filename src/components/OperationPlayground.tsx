import type {
  ChangeEvent,
  ElementType,
  ReactNode,
  SyntheticEvent,
} from "react";

import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
import { Button } from "./Button.js";

const allOperations = [
  "model",
  "embedding",
  "image",
  "video",
  "audio",
] as const;

const operationLabels: Record<PlaygroundOperation, string> = {
  model: "Model",
  embedding: "Embedding",
  image: "Image",
  video: "Video",
  audio: "Audio",
};

const noInputImages: readonly PlaygroundInputImage[] = [];

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export type PlaygroundOperation = (typeof allOperations)[number];

export type PlaygroundSelectionKind = "assignment" | "provider-model";

export interface PlaygroundSelection {
  readonly kind: PlaygroundSelectionKind;
  readonly id: string;
}

export interface PlaygroundValue {
  readonly operation: PlaygroundOperation;
  readonly selection: PlaygroundSelection;
  readonly input: string;
  readonly systemPrompt: string;
  readonly temperature: number | null;
  readonly outputLimit: number | null;
}

export interface PlaygroundTargetOption {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly disabled?: boolean;
}

export interface PlaygroundInputImage {
  readonly id: string;
  readonly name: string;
  /** Host-formatted file size or other safe detail. */
  readonly detail?: string;
}

export interface PlaygroundUsageItem {
  readonly id: string;
  readonly label: string;
  /** Host-formatted provider-neutral quantity. */
  readonly value: string;
}

export interface PlaygroundSelectedRoute {
  readonly label: string;
  readonly detail?: string;
}

export interface PlaygroundCost {
  readonly amount: string;
  readonly currency: string;
}

interface PlaygroundTextOutputValue {
  readonly content: string;
}

export type PlaygroundTextOutput = PlaygroundTextOutputValue &
  ({ readonly kind: "text" } | { readonly kind: "json" });

export interface PlaygroundEmbeddingOutput {
  readonly kind: "embedding";
  readonly vectorCount: number;
  readonly dimensions: number;
  /** A bounded host-selected preview of one vector. */
  readonly preview?: readonly number[];
}

interface PlaygroundMediaOutputValue {
  /** A host-created browser-safe object URL. */
  readonly objectUrl: string;
  readonly label: string;
  readonly mediaType?: string;
}

export interface PlaygroundMediaCaptions {
  /** A host-created browser-safe object URL. */
  readonly objectUrl: string;
  readonly label: string;
  readonly language: string;
}

export type PlaygroundMediaOutput = PlaygroundMediaOutputValue &
  (
    | { readonly kind: "image" }
    | {
        readonly kind: "video";
        readonly captions?: PlaygroundMediaCaptions;
      }
    | {
        readonly kind: "audio";
        readonly captions?: PlaygroundMediaCaptions;
      }
  );

export type PlaygroundOutput =
  PlaygroundTextOutput | PlaygroundEmbeddingOutput | PlaygroundMediaOutput;

export interface PlaygroundResult {
  readonly output: PlaygroundOutput;
  readonly selectedRoute: PlaygroundSelectedRoute;
  readonly latencyMs: number | null;
  readonly usage: readonly PlaygroundUsageItem[];
  readonly cost: PlaygroundCost | null;
}

export interface PlaygroundCorrectiveError {
  readonly title: string;
  readonly message: string;
  readonly correction: string;
  readonly code?: string;
}

export type PlaygroundRunState =
  | { readonly status: "empty"; readonly message?: string }
  | { readonly status: "loading"; readonly message?: string }
  | { readonly status: "success"; readonly result: PlaygroundResult }
  | { readonly status: "error"; readonly error: PlaygroundCorrectiveError };

export interface OperationPlaygroundProps {
  /** A page-unique prefix for labels and controls. */
  readonly id: string;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly headingLevel?: "h2" | "h3";
  readonly className?: string;
  readonly value: PlaygroundValue;
  readonly availableOperations?: readonly PlaygroundOperation[];
  readonly assignmentOptions: readonly PlaygroundTargetOption[];
  readonly providerModelOptions: readonly PlaygroundTargetOption[];
  readonly inputImages?: readonly PlaygroundInputImage[];
  readonly runState: PlaygroundRunState;
  readonly disabled?: boolean;
  readonly runLabel?: ReactNode;
  readonly resetLabel?: ReactNode;
  readonly onValueChange: (value: PlaygroundValue) => void;
  readonly onRun: (value: PlaygroundValue) => void;
  readonly onReset?: () => void;
  /** The host receives and owns all selected file data. */
  readonly onAddInputImages?: (files: readonly File[]) => void;
  readonly onRemoveInputImage?: (imageId: string) => void;
}

function validateIdentities(
  name: string,
  options: readonly { readonly id: string }[],
): void {
  const ids = new Set<string>();
  for (const option of options) {
    if (ids.has(option.id)) {
      throw new Error(`${name} id must be unique: ${option.id}`);
    }
    ids.add(option.id);
  }
}

function validateOperations(operations: readonly PlaygroundOperation[]): void {
  if (operations.length === 0) {
    throw new Error("Available playground operations must not be empty.");
  }
  if (new Set(operations).size !== operations.length) {
    throw new Error("Available playground operations must be unique.");
  }
}

function inputCopy(operation: PlaygroundOperation): {
  readonly label: string;
  readonly help: string;
} {
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

function includesImageInput(operation: PlaygroundOperation): boolean {
  return (
    operation === "model" || operation === "image" || operation === "video"
  );
}

function optionExists(
  options: readonly PlaygroundTargetOption[],
  id: string,
): boolean {
  return options.some((option) => option.id === id && option.disabled !== true);
}

function firstEnabledOption(
  options: readonly PlaygroundTargetOption[],
): PlaygroundTargetOption | undefined {
  return options.find((option) => option.disabled !== true);
}

function targetOptions(
  kind: PlaygroundSelectionKind,
  assignmentOptions: readonly PlaygroundTargetOption[],
  providerModelOptions: readonly PlaygroundTargetOption[],
): readonly PlaygroundTargetOption[] {
  return kind === "assignment" ? assignmentOptions : providerModelOptions;
}

function optionalNumber(event: ChangeEvent<HTMLInputElement>): number | null {
  const value = event.currentTarget.valueAsNumber;
  return event.currentTarget.value === "" || !Number.isFinite(value)
    ? null
    : value;
}

function SelectionControls({
  assignmentOptions,
  disabled,
  id,
  onValueChange,
  providerModelOptions,
  value,
}: {
  readonly assignmentOptions: readonly PlaygroundTargetOption[];
  readonly disabled: boolean;
  readonly id: string;
  readonly onValueChange: (value: PlaygroundValue) => void;
  readonly providerModelOptions: readonly PlaygroundTargetOption[];
  readonly value: PlaygroundValue;
}) {
  const options = targetOptions(
    value.selection.kind,
    assignmentOptions,
    providerModelOptions,
  );
  const noEnabledOptions = firstEnabledOption(options) === undefined;
  const selectionId = optionExists(options, value.selection.id)
    ? value.selection.id
    : "";
  const emptyLabel =
    value.selection.kind === "assignment"
      ? "No assignments available"
      : "No provider-models available";
  const selectLabel =
    value.selection.kind === "assignment"
      ? "Assignment"
      : "Exact provider-model";

  function changeSelectionKind(kind: PlaygroundSelectionKind): void {
    const nextOptions = targetOptions(
      kind,
      assignmentOptions,
      providerModelOptions,
    );
    onValueChange({
      ...value,
      selection: {
        kind,
        id: firstEnabledOption(nextOptions)?.id ?? "",
      },
    });
  }

  return (
    <fieldset className="od-playground-route-fields">
      <legend>Route selection</legend>
      <div className="od-playground-route-kind">
        <label>
          <input
            aria-label="Use assignment route"
            checked={value.selection.kind === "assignment"}
            disabled={
              disabled || firstEnabledOption(assignmentOptions) === undefined
            }
            name={`${id}-route-kind`}
            onChange={() => {
              changeSelectionKind("assignment");
            }}
            type="radio"
          />
          <span>
            <strong>Assignment</strong>
            <small>Use its ordered route.</small>
          </span>
        </label>
        <label>
          <input
            aria-label="Use exact provider-model route"
            checked={value.selection.kind === "provider-model"}
            disabled={
              disabled || firstEnabledOption(providerModelOptions) === undefined
            }
            name={`${id}-route-kind`}
            onChange={() => {
              changeSelectionKind("provider-model");
            }}
            type="radio"
          />
          <span>
            <strong>Exact provider-model</strong>
            <small>Use one exact route.</small>
          </span>
        </label>
      </div>
      <label className="od-playground-field" htmlFor={`${id}-target`}>
        <span>{selectLabel}</span>
        <select
          disabled={disabled || noEnabledOptions}
          id={`${id}-target`}
          onChange={(event) => {
            onValueChange({
              ...value,
              selection: {
                ...value.selection,
                id: event.currentTarget.value,
              },
            });
          }}
          required
          value={selectionId}
        >
          <option value="">
            {noEnabledOptions
              ? emptyLabel
              : `Select ${selectLabel.toLowerCase()}`}
          </option>
          {options.map((option) => (
            <option
              disabled={option.disabled}
              key={option.id}
              value={option.id}
            >
              {option.label}
              {option.detail === undefined ? "" : ` · ${option.detail}`}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}

function ImageInputControls({
  disabled,
  id,
  images,
  onAdd,
  onRemove,
}: {
  readonly disabled: boolean;
  readonly id: string;
  readonly images: readonly PlaygroundInputImage[];
  readonly onAdd: ((files: readonly File[]) => void) | undefined;
  readonly onRemove: ((imageId: string) => void) | undefined;
}) {
  if (onAdd === undefined && images.length === 0) return null;
  return (
    <fieldset className="od-playground-image-fields">
      <legend>Input images</legend>
      <p>JPEG, PNG, and WebP files are supported.</p>
      {onAdd === undefined ? null : (
        <label className="od-playground-file-field" htmlFor={`${id}-images`}>
          <span>Add input images</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            aria-label="Add input images"
            disabled={disabled}
            id={`${id}-images`}
            multiple
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              if (files.length > 0) onAdd(files);
              event.currentTarget.value = "";
            }}
            type="file"
          />
        </label>
      )}
      {images.length === 0 ? (
        <p className="od-playground-image-empty">No input images</p>
      ) : (
        <ul className="od-playground-image-list">
          {images.map((image) => (
            <li key={image.id}>
              <span>
                <strong>{image.name}</strong>
                {image.detail === undefined ? null : (
                  <small>{image.detail}</small>
                )}
              </span>
              {onRemove === undefined ? null : (
                <Button
                  aria-label={`Remove ${image.name}`}
                  disabled={disabled}
                  onClick={() => {
                    onRemove(image.id);
                  }}
                  variant="quiet"
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

function PlaygroundForm({
  assignmentOptions,
  availableOperations,
  disabled,
  headingLevel,
  id,
  images,
  onAddInputImages,
  onRemoveInputImage,
  onReset,
  onRun,
  onValueChange,
  providerModelOptions,
  resetLabel,
  runLabel,
  value,
}: {
  readonly assignmentOptions: readonly PlaygroundTargetOption[];
  readonly availableOperations: readonly PlaygroundOperation[];
  readonly disabled: boolean;
  readonly headingLevel: "h3" | "h4";
  readonly id: string;
  readonly images: readonly PlaygroundInputImage[];
  readonly onAddInputImages: ((files: readonly File[]) => void) | undefined;
  readonly onRemoveInputImage: ((imageId: string) => void) | undefined;
  readonly onReset: (() => void) | undefined;
  readonly onRun: (value: PlaygroundValue) => void;
  readonly onValueChange: (value: PlaygroundValue) => void;
  readonly providerModelOptions: readonly PlaygroundTargetOption[];
  readonly resetLabel: ReactNode;
  readonly runLabel: ReactNode;
  readonly value: PlaygroundValue;
}) {
  const Heading = headingLevel as ElementType;
  const effectiveOperation = availableOperations.includes(value.operation)
    ? value.operation
    : null;
  const options = targetOptions(
    value.selection.kind,
    assignmentOptions,
    providerModelOptions,
  );
  const selectionIsValid = optionExists(options, value.selection.id);
  const input =
    effectiveOperation === null ? null : inputCopy(effectiveOperation);

  function submit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (
      effectiveOperation === null ||
      !selectionIsValid ||
      value.input.trim() === ""
    ) {
      return;
    }
    onRun(value);
  }

  return (
    <form
      aria-busy={disabled}
      aria-labelledby={`${id}-controls-title`}
      className="od-playground-form"
      onSubmit={submit}
    >
      <Heading id={`${id}-controls-title`}>Request</Heading>
      <label className="od-playground-field" htmlFor={`${id}-operation`}>
        <span>Operation</span>
        <select
          disabled={disabled}
          id={`${id}-operation`}
          onChange={(event) => {
            onValueChange({
              ...value,
              operation: event.currentTarget.value as PlaygroundOperation,
            });
          }}
          required
          value={effectiveOperation ?? ""}
        >
          {effectiveOperation === null ? (
            <option value="">Select an operation</option>
          ) : null}
          {availableOperations.map((operation) => (
            <option key={operation} value={operation}>
              {operationLabels[operation]}
            </option>
          ))}
        </select>
      </label>
      <SelectionControls
        assignmentOptions={assignmentOptions}
        disabled={disabled}
        id={id}
        onValueChange={onValueChange}
        providerModelOptions={providerModelOptions}
        value={value}
      />
      {input === null ? null : (
        <label className="od-playground-field" htmlFor={`${id}-input`}>
          <span>{input.label}</span>
          <AutoGrowTextarea
            aria-describedby={`${id}-input-help`}
            disabled={disabled}
            id={`${id}-input`}
            maxHeight={360}
            onChange={(event) => {
              onValueChange({ ...value, input: event.currentTarget.value });
            }}
            required
            rows={effectiveOperation === "embedding" ? 6 : 5}
            value={value.input}
          />
          <small id={`${id}-input-help`}>{input.help}</small>
        </label>
      )}
      {effectiveOperation === "model" ? (
        <details className="od-playground-optional-controls">
          <summary>Model controls</summary>
          <div>
            <label
              className="od-playground-field"
              htmlFor={`${id}-system-prompt`}
            >
              <span>System prompt</span>
              <AutoGrowTextarea
                disabled={disabled}
                id={`${id}-system-prompt`}
                maxHeight={240}
                onChange={(event) => {
                  onValueChange({
                    ...value,
                    systemPrompt: event.currentTarget.value,
                  });
                }}
                rows={3}
                value={value.systemPrompt}
              />
            </label>
            <div className="od-playground-number-fields">
              <label
                className="od-playground-field"
                htmlFor={`${id}-temperature`}
              >
                <span>Temperature</span>
                <input
                  aria-label="Temperature"
                  disabled={disabled}
                  id={`${id}-temperature`}
                  max={2}
                  min={0}
                  onChange={(event) => {
                    onValueChange({
                      ...value,
                      temperature: optionalNumber(event),
                    });
                  }}
                  step={0.1}
                  type="number"
                  value={value.temperature ?? ""}
                />
              </label>
              <label
                className="od-playground-field"
                htmlFor={`${id}-output-limit`}
              >
                <span>Output limit</span>
                <input
                  aria-label="Output limit"
                  disabled={disabled}
                  id={`${id}-output-limit`}
                  min={1}
                  onChange={(event) => {
                    onValueChange({
                      ...value,
                      outputLimit: optionalNumber(event),
                    });
                  }}
                  step={1}
                  type="number"
                  value={value.outputLimit ?? ""}
                />
              </label>
            </div>
          </div>
        </details>
      ) : null}
      {effectiveOperation !== null && includesImageInput(effectiveOperation) ? (
        <ImageInputControls
          disabled={disabled}
          id={id}
          images={images}
          onAdd={onAddInputImages}
          onRemove={onRemoveInputImage}
        />
      ) : null}
      <footer className="od-playground-actions">
        {onReset === undefined ? null : (
          <Button disabled={disabled} onClick={onReset} variant="secondary">
            {resetLabel}
          </Button>
        )}
        <Button
          disabled={
            disabled ||
            effectiveOperation === null ||
            !selectionIsValid ||
            value.input.trim() === ""
          }
          type="submit"
        >
          {runLabel}
        </Button>
      </footer>
    </form>
  );
}

function ResultOutput({ output }: { readonly output: PlaygroundOutput }) {
  if (output.kind === "text" || output.kind === "json") {
    return (
      <pre className="od-playground-text-output" data-output-kind={output.kind}>
        {output.content || "No output content"}
      </pre>
    );
  }
  if (output.kind === "embedding") {
    return (
      <div className="od-playground-embedding-output">
        <dl>
          <div>
            <dt>Vectors</dt>
            <dd>{String(output.vectorCount)}</dd>
          </div>
          <div>
            <dt>Dimensions</dt>
            <dd>{String(output.dimensions)}</dd>
          </div>
        </dl>
        {output.preview === undefined || output.preview.length === 0 ? null : (
          <details>
            <summary>Vector preview</summary>
            <code>{output.preview.slice(0, 12).join(", ")}</code>
          </details>
        )}
      </div>
    );
  }
  if (output.kind === "image") {
    return (
      <figure className="od-playground-media-output">
        <img
          alt={output.label}
          referrerPolicy="no-referrer"
          src={output.objectUrl}
        />
        <figcaption>{output.label}</figcaption>
      </figure>
    );
  }
  if (output.kind === "video") {
    return (
      <figure className="od-playground-media-output">
        {/* react-doctor-disable-next-line react-doctor/media-has-caption */}
        <video aria-label={output.label} controls preload="metadata">
          <source src={output.objectUrl} type={output.mediaType} />
          {output.captions === undefined ? null : (
            <track
              default
              kind="captions"
              label={output.captions.label}
              src={output.captions.objectUrl}
              srcLang={output.captions.language}
            />
          )}
        </video>
        <figcaption>{output.label}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="od-playground-media-output">
      {/* react-doctor-disable-next-line react-doctor/media-has-caption */}
      <audio aria-label={output.label} controls preload="metadata">
        <source src={output.objectUrl} type={output.mediaType} />
        {output.captions === undefined ? null : (
          <track
            default
            kind="captions"
            label={output.captions.label}
            src={output.captions.objectUrl}
            srcLang={output.captions.language}
          />
        )}
      </audio>
      <figcaption>{output.label}</figcaption>
    </figure>
  );
}

function ResultFacts({
  headingLevel,
  id,
  result,
}: {
  readonly headingLevel: "h4" | "h5";
  readonly id: string;
  readonly result: PlaygroundResult;
}) {
  const Heading = headingLevel as ElementType;
  return (
    <div className="od-playground-result-facts">
      <dl className="od-playground-route-metrics">
        <div>
          <dt>Selected route</dt>
          <dd>
            <strong>{result.selectedRoute.label}</strong>
            {result.selectedRoute.detail === undefined ? null : (
              <small>{result.selectedRoute.detail}</small>
            )}
          </dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd>
            {result.latencyMs === null
              ? "Not reported"
              : `${String(result.latencyMs)} ms`}
          </dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>
            {result.cost === null
              ? "Not reported"
              : `${result.cost.amount} ${result.cost.currency}`}
          </dd>
        </div>
      </dl>
      <section
        aria-labelledby={`${id}-usage-title`}
        className="od-playground-usage"
      >
        <Heading id={`${id}-usage-title`}>Usage</Heading>
        {result.usage.length === 0 ? (
          <p>No usage reported</p>
        ) : (
          <dl>
            {result.usage.map((item) => (
              <div key={item.id}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}

function PlaygroundResultState({
  id,
  sectionHeadingLevel,
  state,
}: {
  readonly id: string;
  readonly sectionHeadingLevel: "h3" | "h4";
  readonly state: PlaygroundRunState;
}) {
  const factHeadingLevel = sectionHeadingLevel === "h3" ? "h4" : "h5";
  if (state.status === "empty") {
    return (
      <output
        aria-live="polite"
        className="od-playground-state od-playground-state-empty"
      >
        <strong>No result</strong>
        <span>{state.message ?? "Run an operation to see its result."}</span>
      </output>
    );
  }
  if (state.status === "loading") {
    return (
      <div
        aria-busy="true"
        className="od-playground-state od-playground-state-loading"
      >
        <span aria-hidden="true" />
        <output aria-live="polite">
          <strong>Operation running</strong>
          <span>{state.message ?? "Wait for the result."}</span>
        </output>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <section
        aria-live="assertive"
        className="od-playground-state od-playground-state-error"
        role="alert"
      >
        <strong>{state.error.title}</strong>
        <p>{state.error.message}</p>
        <div className="od-playground-error-correction">
          <strong>How to correct it</strong>
          <p>{state.error.correction}</p>
        </div>
        {state.error.code === undefined ? null : (
          <p className="od-playground-error-code">
            Code: <code>{state.error.code}</code>
          </p>
        )}
      </section>
    );
  }
  return (
    <section
      aria-labelledby={`${id}-result-title`}
      aria-live="polite"
      className="od-playground-success"
      role="status"
    >
      <strong id={`${id}-result-title`}>Result ready</strong>
      <ResultOutput output={state.result.output} />
      <ResultFacts
        headingLevel={factHeadingLevel}
        id={id}
        result={state.result}
      />
    </section>
  );
}

/**
 * A controlled playground for provider-neutral model, embedding, and media operations.
 * Hosts own calls, credentials, data access, routing, state, and mutations.
 */
export function OperationPlayground({
  assignmentOptions,
  availableOperations = allOperations,
  className,
  description,
  disabled = false,
  headingLevel = "h2",
  id,
  inputImages = noInputImages,
  onAddInputImages,
  onRemoveInputImage,
  onReset,
  onRun,
  onValueChange,
  providerModelOptions,
  resetLabel = "Reset",
  runLabel = "Run operation",
  runState,
  title,
  value,
}: OperationPlaygroundProps) {
  validateOperations(availableOperations);
  validateIdentities("Assignment option", assignmentOptions);
  validateIdentities("Provider-model option", providerModelOptions);
  validateIdentities("Input image", inputImages);
  if (runState.status === "success") {
    validateIdentities("Usage item", runState.result.usage);
  }
  const Heading = headingLevel as ElementType;
  const sectionHeadingLevel = headingLevel === "h2" ? "h3" : "h4";
  const SectionHeading = sectionHeadingLevel as ElementType;
  const loading = runState.status === "loading";
  const selectedOperation = availableOperations.includes(value.operation)
    ? value.operation
    : null;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={classes("od-playground", className)}
      data-operation={selectedOperation ?? undefined}
    >
      <header className="od-playground-heading">
        <div>
          <Heading id={`${id}-title`}>{title}</Heading>
          {description === undefined ? null : <p>{description}</p>}
        </div>
        <span>
          {selectedOperation === null
            ? "Operation unavailable"
            : operationLabels[selectedOperation]}
        </span>
      </header>
      <PlaygroundForm
        assignmentOptions={assignmentOptions}
        availableOperations={availableOperations}
        disabled={disabled || loading}
        headingLevel={sectionHeadingLevel}
        id={id}
        images={inputImages}
        onAddInputImages={onAddInputImages}
        onRemoveInputImage={onRemoveInputImage}
        onReset={onReset}
        onRun={onRun}
        onValueChange={onValueChange}
        providerModelOptions={providerModelOptions}
        resetLabel={resetLabel}
        runLabel={loading ? "Running…" : runLabel}
        value={value}
      />
      <section
        aria-labelledby={`${id}-output-title`}
        className="od-playground-output"
      >
        <SectionHeading id={`${id}-output-title`}>Output</SectionHeading>
        <PlaygroundResultState
          id={id}
          sectionHeadingLevel={sectionHeadingLevel}
          state={runState}
        />
      </section>
    </section>
  );
}
