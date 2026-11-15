export interface LoadingIndicatorProps {
    /** The accessible name, for example "Loading". */
    readonly label: string;
    readonly size?: "small" | "default";
    /** Take the width of the container and center in a tall area. */
    readonly block?: boolean;
    readonly className?: string;
}
/**
 * The one sign that something loads. It turns; with reduced motion it fades
 * in and out and does not move.
 */
export declare function LoadingIndicator({ block, className, label, size, }: LoadingIndicatorProps): import("react").JSX.Element;
//# sourceMappingURL=LoadingIndicator.d.ts.map