/** Language choices for a select control. */

/** Common written languages, as BCP 47 tags. */
const languageTags = [
  "af",
  "am",
  "ar",
  "az",
  "be",
  "bg",
  "bn",
  "bs",
  "ca",
  "cs",
  "cy",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "eu",
  "fa",
  "fi",
  "fil",
  "fr",
  "ga",
  "gl",
  "gu",
  "ha",
  "he",
  "hi",
  "hr",
  "hu",
  "hy",
  "id",
  "is",
  "it",
  "ja",
  "ka",
  "kk",
  "km",
  "kn",
  "ko",
  "lb",
  "lo",
  "lt",
  "lv",
  "mk",
  "ml",
  "mn",
  "mr",
  "ms",
  "mt",
  "my",
  "nb",
  "ne",
  "nl",
  "pa",
  "pl",
  "pt",
  "ro",
  "ru",
  "si",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "tl",
  "tr",
  "uk",
  "ur",
  "uz",
  "vi",
  "yo",
  "zh-Hans",
  "zh-Hant",
  "zu",
] as const;

export interface LanguageOption {
  /** The BCP 47 tag, for example "fr". */
  readonly value: string;
  /** The name in the language of the interface, for example "French". */
  readonly label: string;
  /** The name in the language itself, for example "français". */
  readonly description?: string;
  readonly searchText: string;
}

function nameOf(names: Intl.DisplayNames, tag: string): string {
  try {
    return names.of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/**
 * The common languages for a select control, by name. `extra` adds tags that
 * the list does not have. `locale` is the language of the names.
 */
export function languageOptions(
  extra: readonly string[] = [],
  locale = "en",
): readonly LanguageOption[] {
  const names = new Intl.DisplayNames([locale], { type: "language" });
  return [...new Set<string>([...languageTags, ...extra])]
    .filter((tag) => tag !== "")
    .map((value) => {
      const label = nameOf(names, value);
      let native = label;
      try {
        native = nameOf(
          new Intl.DisplayNames([value], { type: "language" }),
          value,
        );
      } catch {
        // The runtime does not know the tag: the label is enough.
      }
      const same = native.toLocaleLowerCase() === label.toLocaleLowerCase();
      return {
        value,
        label,
        ...(same ? {} : { description: native }),
        searchText: `${label} ${native} ${value}`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

/** The name of one language, for example "French" for "fr". */
export function languageName(tag: string, locale = "en"): string {
  try {
    return nameOf(new Intl.DisplayNames([locale], { type: "language" }), tag);
  } catch {
    return tag;
  }
}
