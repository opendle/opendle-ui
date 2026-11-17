/** The number of characters as most networks count them: code points. */
export function characterCount(text: string): number {
  return Array.from(text).length;
}
