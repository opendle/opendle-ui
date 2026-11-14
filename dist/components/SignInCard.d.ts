import { type ReactNode } from "react";
import { type SessionCardProps } from "./SessionPage.js";
export interface SignInCardProps extends Omit<SessionCardProps, "actions" | "feedback"> {
    readonly actionLabel: ReactNode;
    /** An icon before the action label. */
    readonly actionIcon?: ReactNode;
    readonly pendingLabel: ReactNode;
    readonly onSignIn: () => Promise<void>;
    /** Return `null` to show nothing, for example after the user cancels. */
    readonly errorMessage: (error: unknown) => string | null;
}
/** One sign-in action with shared pending, failure, and retry behavior. */
export declare function SignInCard({ actionIcon, actionLabel, pendingLabel, onSignIn, errorMessage, ...props }: SignInCardProps): import("react").JSX.Element;
//# sourceMappingURL=SignInCard.d.ts.map