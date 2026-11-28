import type { ReactNode } from "react";
import type { ActionMenuItem } from "./ActionMenu.js";
import type { StatusTone } from "./StatusDot.js";
/** One role that a member can have. */
export interface MemberRoleOption {
    readonly value: string;
    readonly label: string;
}
/** One member of a group, or one invitation to it. */
export interface MemberItem {
    readonly id: string;
    readonly name: string;
    /** Shows below the name when it is not the name. */
    readonly email?: string | null;
    readonly avatarUrl?: string | null;
    /** The `value` of a role in `MemberListProps.roles`. */
    readonly role: string;
    /** The signed-in user. A marker shows after the name. */
    readonly you?: boolean;
    /** A state after the name, for example `Invited` or `Locked`. */
    readonly status?: {
        readonly label: string;
        readonly tone: StatusTone;
    };
    /** An invitation: a mail mark replaces the picture. */
    readonly invitation?: boolean;
    /** One more line below the name, for example the inviter and the expiry. */
    readonly detail?: ReactNode;
    /** The name links to this address. */
    readonly href?: string;
    /** The user can change the role with a select. */
    readonly roleEditable?: boolean;
    /** The actions of the row menu, for example `Remove` or `Resend`. */
    readonly actions?: readonly ActionMenuItem[];
}
/** A confirmation that the host shows before a role change. */
export interface MemberConfirmation {
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly confirmLabel: string;
    readonly tone?: "default" | "danger";
}
export interface MemberListLabels {
    /** The marker of the signed-in user. */
    readonly you: string;
    /** The accessible name of a role select, before the member name. */
    readonly role: string;
    /** The accessible name of a row menu, before the member name. */
    readonly moreActions: string;
    readonly empty: string;
    /** The accessible name of the loading sign before the first answer. */
    readonly loading: string;
    readonly cancel: string;
}
export declare const memberListLabels: MemberListLabels;
//# sourceMappingURL=memberLabels.d.ts.map