/** One part of a text: plain text, or a web address with its link. */
export interface TextPart {
    readonly text: string;
    /** The address of a link. Absent for plain text. */
    readonly href?: string;
}
/**
 * Cut a text into plain parts and web addresses. Only `http`, `https` and
 * `www.` addresses become links.
 */
export declare function textParts(text: string): readonly TextPart[];
//# sourceMappingURL=textParts.d.ts.map