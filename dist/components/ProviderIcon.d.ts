import type { SVGAttributes } from "react";
/** The marks of services that connect channels for a host. */
declare const providerMarks: {
    readonly buffer: {
        readonly label: "Buffer";
        readonly path: "M1.371 5.476L11.943 0l10.686 5.476-10.686 5.495zm3.36 4.81l7.212 3.547 7.288-3.547 3.398 1.655-10.686 5.202L1.371 11.94zm0 6.171l7.212 3.911 7.288-3.91 3.398 1.815L11.943 24 1.371 18.273z";
    };
};
export type ProviderName = keyof typeof providerMarks;
export interface ProviderIconProps extends Omit<SVGAttributes<SVGSVGElement>, "children" | "name"> {
    readonly provider: ProviderName;
    readonly size?: number;
}
/**
 * The mark of a connection service in the current text colour. It is
 * decorative unless the host gives `aria-label`.
 */
export declare function ProviderIcon({ className, provider, size, ...props }: ProviderIconProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ProviderIcon.d.ts.map