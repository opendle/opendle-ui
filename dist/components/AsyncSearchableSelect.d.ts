import { type AriaAttributes, type ReactNode } from "react";
import { type FieldRequirement } from "./Form.js";
import type { SearchableSelectOption } from "./SearchableSelect.js";
export interface AsyncSearchableSelectRequest {
    readonly cursor: string | null;
    readonly query: string;
    readonly signal: AbortSignal;
}
export interface AsyncSearchableSelectPage {
    readonly options: readonly SearchableSelectOption[];
    readonly nextCursor?: string | null;
}
export interface AsyncSearchableSelectProps {
    readonly allowNoSelection?: boolean;
    readonly className?: string;
    readonly debounceMs?: number;
    readonly disabled?: boolean;
    readonly emptyLabel?: ReactNode;
    readonly error?: ReactNode;
    readonly errorLabel?: ReactNode;
    readonly help?: ReactNode;
    readonly id?: string;
    readonly label: ReactNode;
    readonly loadMoreErrorLabel?: ReactNode;
    readonly loadMoreLabel?: ReactNode;
    readonly loadingLabel?: ReactNode;
    readonly loadingMoreLabel?: ReactNode;
    readonly loadOptions: (request: AsyncSearchableSelectRequest) => Promise<AsyncSearchableSelectPage>;
    readonly name?: string;
    readonly noSelectionLabel?: string;
    readonly onChange: (option: SearchableSelectOption | null) => void;
    readonly placeholder?: string;
    readonly required?: boolean;
    readonly requirement?: FieldRequirement;
    readonly retryLabel?: ReactNode;
    readonly value: SearchableSelectOption | null;
    readonly "aria-describedby"?: string;
    readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}
export declare function AsyncSearchableSelect({ allowNoSelection, className, debounceMs, disabled, emptyLabel, error, errorLabel, help, id, label, loadMoreErrorLabel, loadMoreLabel, loadingLabel, loadingMoreLabel, loadOptions, name, noSelectionLabel, onChange, placeholder, required, requirement, retryLabel, value, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, }: AsyncSearchableSelectProps): import("react").JSX.Element;
//# sourceMappingURL=AsyncSearchableSelect.d.ts.map