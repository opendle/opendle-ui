import { type MouseEvent } from "react";
import { type MemberConfirmation, type MemberItem, type MemberListLabels, type MemberRoleOption } from "./memberLabels.js";
export interface MemberListProps {
    readonly items: readonly MemberItem[];
    readonly roles: readonly MemberRoleOption[];
    /** Show a loading sign in place of the empty list until the first answer. */
    readonly loading?: boolean;
    /** Store a new role. Without it, all roles are read-only. */
    readonly onRoleChange?: (id: string, role: string) => Promise<void>;
    /** A confirmation before a role change. `null` changes the role at once. */
    readonly roleConfirmation?: (item: MemberItem, role: string) => MemberConfirmation | null;
    /** The click of a name link, for example for the router of the host. */
    readonly onLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
    readonly errorMessage: (error: unknown) => string | null;
    /**
     * Show a failure outside the component, for example in a toast. With it,
     * the component shows no failure of its own.
     */
    readonly onError?: (message: string) => void;
    readonly labels?: Partial<MemberListLabels>;
    readonly className?: string;
}
/**
 * The members of a group and the invitations to it: the picture, the name,
 * the email address, a state, the role and a menu of actions.
 */
export declare function MemberList({ className, errorMessage, items, labels: partialLabels, loading, onError, onLinkClick, onRoleChange, roleConfirmation, roles, }: MemberListProps): import("react").JSX.Element;
//# sourceMappingURL=MemberList.d.ts.map