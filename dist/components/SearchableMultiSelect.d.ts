import { type SearchableSelectOption } from "./SearchableSelect.js";
export interface SearchableMultiSelectProps {
    readonly label: string;
    /** The selected values, in the order of the user. */
    readonly value: readonly string[];
    readonly onChange: (value: readonly string[]) => void;
    readonly options: readonly SearchableSelectOption[];
    /** The accessible name of a remove button. It gets the option after it. */
    readonly removeLabel: string;
    readonly placeholder?: string;
    readonly noResultsLabel?: string;
    readonly disabled?: boolean;
    readonly className?: string;
}
/**
 * A searchable select that adds each choice to a list of removable chips.
 * The search shows only the options that are not selected.
 */
export declare function SearchableMultiSelect({ className, disabled, label, noResultsLabel, onChange, options, placeholder, removeLabel, value, }: SearchableMultiSelectProps): import("react").JSX.Element;
//# sourceMappingURL=SearchableMultiSelect.d.ts.map