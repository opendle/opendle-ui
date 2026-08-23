import type { ReactNode } from "react";
declare const allOperations: readonly ["model", "embedding", "image", "video", "audio"];
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
export type PlaygroundTextOutput = PlaygroundTextOutputValue & ({
    readonly kind: "text";
} | {
    readonly kind: "json";
});
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
export type PlaygroundMediaOutput = PlaygroundMediaOutputValue & ({
    readonly kind: "image";
} | {
    readonly kind: "video";
    readonly captions?: PlaygroundMediaCaptions;
} | {
    readonly kind: "audio";
    readonly captions?: PlaygroundMediaCaptions;
});
export type PlaygroundOutput = PlaygroundTextOutput | PlaygroundEmbeddingOutput | PlaygroundMediaOutput;
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
export type PlaygroundRunState = {
    readonly status: "empty";
    readonly message?: string;
} | {
    readonly status: "loading";
    readonly message?: string;
} | {
    readonly status: "success";
    readonly result: PlaygroundResult;
} | {
    readonly status: "error";
    readonly error: PlaygroundCorrectiveError;
};
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
/**
 * A controlled playground for provider-neutral model, embedding, and media operations.
 * Hosts own calls, credentials, data access, routing, state, and mutations.
 */
export declare function OperationPlayground({ assignmentOptions, availableOperations, className, description, disabled, headingLevel, id, inputImages, onAddInputImages, onRemoveInputImage, onReset, onRun, onValueChange, providerModelOptions, resetLabel, runLabel, runState, title, value, }: OperationPlaygroundProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=OperationPlayground.d.ts.map