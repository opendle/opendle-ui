/**
 * Common emoji with English search words. The first words are the name. The
 * list is short on purpose: it covers replies to an audience, not all
 * Unicode emoji.
 */
export declare const emojiData: readonly (readonly [string, string])[];
/** Return the emoji whose words start with each word of the query. */
export declare function searchEmoji(query: string, data?: readonly (readonly [string, string])[]): readonly string[];
//# sourceMappingURL=emojiData.d.ts.map