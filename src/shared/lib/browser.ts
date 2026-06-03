export function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
