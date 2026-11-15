export interface AvatarProps {
    /** The person's name. The first letter shows when there is no picture. */
    readonly name: string;
    readonly src?: string | null;
    readonly size?: "default" | "large";
    readonly className?: string;
}
/** A rounded square picture, with an initial as the fallback. */
export declare function Avatar({ className, name, size, src, }: AvatarProps): import("react").JSX.Element;
//# sourceMappingURL=Avatar.d.ts.map