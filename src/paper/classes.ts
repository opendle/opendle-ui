/** Join class names and drop empty values. */
export function classes(
  ...values: readonly (string | false | null | undefined)[]
): string {
  return values.filter(Boolean).join(" ");
}
