import { type ReactNode } from "react";
import { type SessionCardProps } from "./SessionPage.js";
export interface SignInCardProps extends Omit<SessionCardProps, "actions" | "feedback"> {
    readonly actionLabel: ReactNode;
    readonly pendingLabel: ReactNode;
    readonly onSignIn: () => Promise<void>;
    readonly errorMessage: (error: unknown) => string;
}
/** One sign-in action with shared pending, failure, and retry behavior. */
export declare function SignInCard({ actionLabel, pendingLabel, onSignIn, errorMessage, ...props }: SignInCardProps): import("react").JSX.Element;
//# sourceMappingURL=SignInCard.d.ts.map