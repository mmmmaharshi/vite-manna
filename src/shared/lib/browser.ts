/**
 * Whether the device can share through the native share sheet.
 *
 * @returns True when `navigator.share` exists.
 */
export const canNativeShare = () => navigator.share !== undefined;

/**
 * Copies text, falling back to a hidden textarea where the Clipboard API is missing.
 *
 * @param text - The text to place on the clipboard.
 * @returns A promise that resolves once the copy is attempted.
 */
export const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);

    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};
