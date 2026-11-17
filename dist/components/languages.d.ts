/** Language choices for a select control. */
export interface LanguageOption {
    /** The BCP 47 tag, for example "fr". */
    readonly value: string;
    /** The name in the language of the interface, for example "French". */
    readonly label: string;
    /** The name in the language itself, for example "français". */
    readonly description?: string;
    readonly searchText: string;
}
/**
 * The common languages for a select control, by name. `extra` adds tags that
 * the list does not have. `locale` is the language of the names.
 */
export declare function languageOptions(extra?: readonly string[], locale?: string): readonly LanguageOption[];
/** The name of one language, for example "French" for "fr". */
export declare function languageName(tag: string, locale?: string): string;
//# sourceMappingURL=languages.d.ts.map