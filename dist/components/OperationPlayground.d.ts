import type { ReactNode } from "react";
declare const allOperations: readonly ["model", "embedding", "image", "video", "audio"];
export type PlaygroundOperation = (typeof allOperations)[number];
export type PlaygroundSelectionKind = "assignment" | "provider-model";
export interface PlaygroundSelection {
    readonly kind: PlaygroundSelectionKind;
    readonly id: string;
}
export interface PlaygroundRequestValue {
    readonly operation: PlaygroundOperation;
    readonly input: string;
    readonly systemPrompt: string;
    readonly temperature: number | null;
    readonly outputLimit: number | null;
}
export interface PlaygroundValue extends PlaygroundRequestValue {
    readonly selection: PlaygroundSelection;
}
export type PlaygroundControl = "input-images" | "system-prompt" | "temperature" | "output-limit";
export interface PlaygroundTargetOperation {
    readonly operation: PlaygroundOperation;
    /** The exact controls that the selected target supports for this operation. */
    readonly controls: readonly PlaygroundControl[];
}
export type PlaygroundFixedTargetState = {
    readonly status: "available";
} | {
    readonly status: "unavailable";
    readonly message: ReactNode;
};
export interface PlaygroundFixedTarget {
    readonly selection: PlaygroundSelection;
    readonly label: string;
    readonly detail?: string;
    readonly context?: {
        readonly label: string;
        readonly value: string;
    };
    readonly operations: readonly PlaygroundTargetOperation[];
    readonly state?: PlaygroundFixedTargetState;
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
    /** A host-created blob URL. The host owns its lifetime and must revoke it. */
    readonly objectUrl: string;
    readonly label: string;
    readonly mediaType?: string;
}
export interface PlaygroundMediaCaptions {
    /** A host-created blob URL. The host owns its lifetime and must revoke it. */
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
interface OperationPlaygroundCommonProps {
    /** A page-unique prefix for labels and controls. */
    readonly id: string;
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
    readonly className?: string;
    readonly inputImages?: readonly PlaygroundInputImage[];
    readonly runState: PlaygroundRunState;
    readonly disabled?: boolean;
    readonly runLabel?: ReactNode;
    readonly resetLabel?: ReactNode;
    readonly onReset?: () => void;
    /** The host receives and owns all selected file data. */
    readonly onAddInputImages?: (files: readonly File[]) => void;
    readonly onRemoveInputImage?: (imageId: string) => void;
}
export interface SelectableOperationPlaygroundProps extends OperationPlaygroundCommonProps {
    readonly fixedTarget?: undefined;
    readonly value: PlaygroundValue;
    readonly availableOperations?: readonly PlaygroundOperation[];
    readonly assignmentOptions: readonly PlaygroundTargetOption[];
    readonly providerModelOptions: readonly PlaygroundTargetOption[];
    readonly onValueChange: (value: PlaygroundValue) => void;
    readonly onRun: (value: PlaygroundValue) => void;
}
export interface FixedOperationPlaygroundProps extends OperationPlaygroundCommonProps {
    readonly fixedTarget: PlaygroundFixedTarget;
    readonly value: PlaygroundRequestValue;
    readonly availableOperations?: never;
    readonly assignmentOptions?: never;
    readonly providerModelOptions?: never;
    readonly changeTargetLabel?: ReactNode;
    readonly onChangeTarget?: () => void;
    readonly onValueChange: (value: PlaygroundRequestValue) => void;
    readonly onRun: (value: PlaygroundRequestValue, target: PlaygroundSelection) => void;
}
export type OperationPlaygroundProps = SelectableOperationPlaygroundProps | FixedOperationPlaygroundProps;
/**
 * A controlled playground for provider-neutral model, embedding, and media operations.
 * Hosts own calls, credentials, data access, routing, state, and mutations.
 */
export declare function OperationPlayground(props: OperationPlaygroundProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=OperationPlayground.d.ts.map