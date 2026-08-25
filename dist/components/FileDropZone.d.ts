import { type InputHTMLAttributes, type ReactNode } from "react";
export interface FileDropZoneProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "onChange" | "title" | "type"> {
    readonly browseLabel?: ReactNode;
    readonly description?: ReactNode;
    readonly inputLabel?: string;
    readonly onFiles: (files: readonly File[]) => void;
    readonly title: ReactNode;
}
export declare function FileDropZone({ browseLabel, className, description, disabled, id, inputLabel, onFiles, title, "aria-describedby": ariaDescribedBy, ...inputProps }: FileDropZoneProps): import("react").JSX.Element;
//# sourceMappingURL=FileDropZone.d.ts.map