/**
 * Reader font sizes, smallest first.
 */
export const FONT_SIZES = ["sm", "base", "lg", "xl", "2xl"] as const;

/**
 * A reader font size token.
 */
export type FontSize = (typeof FONT_SIZES)[number];

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  "2xl": "text-2xl",
  base: "text-base",
  lg: "text-lg",
  sm: "text-sm",
  xl: "text-xl",
};

/**
 * Maps a font size token to its Tailwind class.
 *
 * @param fontSize - The size token.
 * @returns The Tailwind text class.
 */
export const fontSizeClass = (fontSize: FontSize) =>
  FONT_SIZE_CLASSES[fontSize];

/**
 * Whether a value is a known font size token.
 *
 * @param value - The value to check.
 * @returns True for a member of `FONT_SIZES`.
 */
export const isFontSize = (value: string | number): value is FontSize =>
  FONT_SIZES.some((fontSize) => fontSize === value);
