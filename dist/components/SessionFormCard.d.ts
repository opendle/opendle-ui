import type { ReactNode } from "react";
import { type SessionCardProps } from "./SessionPage.js";
export interface SessionFormCardProps extends Omit<SessionCardProps, "actions" | "feedback" | "onSubmit" | "children"> {
    /** The fields of the form, for example an email and a password. */
    readonly children: ReactNode;
    readonly submitLabel: ReactNode;
    readonly pendingLabel: ReactNode;
    /** An icon before the submit label. */
    readonly submitIcon?: ReactNode;
    /** A stable ID for the form when a browser needs to identify it. */
    readonly formId?: string;
    /** The form values at submit time, including values filled by the browser. */
    readonly onSubmit: (data: FormData) => Promise<void>;
    /** Return `null` to show nothing. */
    readonly errorMessage: (error: unknown) => string | null;
}
/**
 * A session card with a small form, for example an email request or a
 * password sign-in. It has the pending, failure, and retry behavior of
 * `SignInCard`.
 */
export declare function SessionFormCard({ children, errorMessage, formId, onSubmit, pendingLabel, submitIcon, submitLabel, ...props }: SessionFormCardProps): import("react").JSX.Element;
//# sourceMappingURL=SessionFormCard.d.ts.map