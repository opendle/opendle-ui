import { type SearchableSelectOption } from "./SearchableSelect.js";
export interface OrderedChoiceItem {
    readonly id: string;
    readonly value: string;
    readonly label: string;
    readonly detail?: string;
}
export interface OrderedChoiceListProps {
    readonly label: string;
    readonly addLabel: string;
    readonly addPlaceholder?: string;
    readonly items: readonly OrderedChoiceItem[];
    readonly options: readonly SearchableSelectOption[];
    readonly disabled?: boolean;
    readonly maxItems?: number;
    readonly onAdd: (value: string) => void;
    readonly onRemove: (id: string) => void;
    readonly onReorder: (ids: readonly string[]) => void;
}
/** A compact controlled list with searchable additions and accessible reordering. */
export declare function OrderedChoiceList({ label, addLabel, addPlaceholder, items, options, disabled, maxItems, onAdd, onRemove, onReorder, }: OrderedChoiceListProps): import("react").JSX.Element;
//# sourceMappingURL=OrderedChoiceList.d.ts.map