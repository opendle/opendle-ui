import type { InputHTMLAttributes, Ref } from "react";
export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "aria-label"> {
    /** The accessible name. It is also the placeholder unless one is given. */
    readonly label: string;
    readonly ref?: Ref<HTMLInputElement>;
}
/** A compact search input with a search icon, for a toolbar or a list header. */
export declare function SearchField({ className, label, placeholder, ref, ...props }: SearchFieldProps): import("react").JSX.Element;
//# sourceMappingURL=SearchField.d.ts.map