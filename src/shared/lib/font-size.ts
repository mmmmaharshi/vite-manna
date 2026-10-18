export const FONT_SIZES = ["sm", "base", "lg", "xl", "2xl"] as const;

export type FontSize = (typeof FONT_SIZES)[number];

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  "2xl": "text-2xl",
  base: "text-base",
  lg: "text-lg",
  sm: "text-sm",
  xl: "text-xl",
};

export const fontSizeClass = (fontSize: FontSize) =>
  FONT_SIZE_CLASSES[fontSize];

export const isFontSize = (value: string | number): value is FontSize =>
  FONT_SIZES.some((fontSize) => fontSize === value);
