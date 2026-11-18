import { type InputHTMLAttributes, type ReactNode } from "react";
export interface FileDropZoneProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "onChange" | "title" | "type"> {
    /** More controls next to the browse button, for example a library button. */
    readonly actions?: ReactNode;
    readonly browseLabel?: ReactNode;
    readonly description?: ReactNode;
    readonly inputLabel?: string;
    readonly onFiles: (files: readonly File[]) => void;
    readonly title: ReactNode;
}
export declare function FileDropZone({ actions, browseLabel, className, description, disabled, id, inputLabel, onFiles, title, "aria-describedby": ariaDescribedBy, "aria-labelledby": ariaLabelledBy, ...inputProps }: FileDropZoneProps): import("react").JSX.Element;
//# sourceMappingURL=FileDropZone.d.ts.map