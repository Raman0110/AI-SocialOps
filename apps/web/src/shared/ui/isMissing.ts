/** True for values that should render as a muted placeholder, not a real value. */
export function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && /^(not provided|n\/a|unknown)$/i.test(value.trim()))
  );
}
