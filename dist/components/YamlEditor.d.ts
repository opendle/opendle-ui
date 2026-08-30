import type { CompletionSource } from "@codemirror/autocomplete";
import { type AriaAttributes, type Ref } from "react";
export type YamlEditorCompletionSource = CompletionSource;
export interface YamlEditorDiagnostic {
    readonly from: number;
    readonly message: string;
    readonly severity: "error" | "hint" | "info" | "warning";
    readonly to?: number;
}
export interface YamlEditorHandle {
    focus(): void;
}
export interface YamlEditorProps {
    readonly "aria-describedby"?: AriaAttributes["aria-describedby"];
    readonly className?: string;
    readonly completionSources?: readonly YamlEditorCompletionSource[];
    readonly diagnostics?: readonly YamlEditorDiagnostic[];
    readonly disabled?: boolean;
    readonly id?: string;
    readonly label: string;
    readonly onBlur?: () => void;
    readonly onChange: (source: string) => void;
    readonly onFocus?: () => void;
    readonly readOnly?: boolean;
    readonly ref?: Ref<YamlEditorHandle>;
    readonly value: string;
}
export declare function YamlEditor({ "aria-describedby": ariaDescribedBy, className, completionSources, diagnostics, disabled, id: suppliedId, label, onBlur, onChange, onFocus, readOnly, ref, value, }: YamlEditorProps): import("react").JSX.Element;
//# sourceMappingURL=YamlEditor.d.ts.map