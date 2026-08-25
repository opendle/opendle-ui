import { type AriaAttributes, type KeyboardEvent, type ReactNode } from "react";
import { type FieldRequirement } from "./Form.js";
export interface SearchableSelectOption {
    readonly value: string;
    readonly label: string;
    readonly description?: string;
    readonly searchText?: string;
    readonly disabled?: boolean;
}
export interface SearchableSelectProps {
    readonly className?: string;
    readonly disabled?: boolean;
    readonly error?: ReactNode;
    readonly help?: ReactNode;
    readonly id?: string;
    readonly label: ReactNode;
    readonly maxVisibleOptions?: number;
    readonly name?: string;
    readonly noResultsLabel?: string;
    readonly onChange: (value: string, option: SearchableSelectOption) => void;
    readonly onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    readonly options: readonly SearchableSelectOption[];
    readonly placeholder?: string;
    readonly required?: boolean;
    readonly requirement?: FieldRequirement;
    readonly value: string;
    readonly "aria-describedby"?: string;
    readonly "aria-invalid"?: AriaAttributes["aria-invalid"];
}
export declare function SearchableSelect({ className, disabled, error, help, id, label, maxVisibleOptions, name, noResultsLabel, onChange, onInputKeyDown, options, placeholder, required, requirement, value, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, }: SearchableSelectProps): import("react").JSX.Element;
//# sourceMappingURL=SearchableSelect.d.ts.map