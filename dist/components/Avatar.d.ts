/** The frame of a picture: a circle, a rounded square or a square. */
export type AvatarShape = "circle" | "rounded" | "square";
export interface AvatarProps {
    /** The person's name. The first letter shows when there is no picture. */
    readonly name: string;
    readonly src?: string | null | undefined;
    readonly size?: "default" | "large";
    /** The default is a rounded square. */
    readonly shape?: AvatarShape;
    readonly className?: string;
}
/** A picture in a frame, with an initial as the fallback. */
export declare function Avatar({ className, name, shape, size, src, }: AvatarProps): import("react").JSX.Element;
//# sourceMappingURL=Avatar.d.ts.map