import { type ReactNode } from "react";
export interface PasskeySignInProps {
    /** The product mark above the title. */
    readonly brandMark?: ReactNode;
    readonly title: string;
    readonly actionLabel: string;
    readonly pendingLabel: string;
    /** Run the passkey ceremony. A rejection shows `errorMessage`. */
    readonly onSignIn: () => Promise<void>;
    /** Return `null` to show nothing, for example after the user cancels. */
    readonly errorMessage: (error: unknown) => string | null;
}
/** A full page with one passkey action. */
export declare function PasskeySignIn({ actionLabel, brandMark, errorMessage, onSignIn, pendingLabel, title, }: PasskeySignInProps): import("react").JSX.Element;
//# sourceMappingURL=SignIn.d.ts.map