export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

export const SIZE_PROPS: Record<FontSize, { type: "body-sm" | "body" | "h5" | "h4" | "h3"; weight?: "normal" }> = {
  sm: { type: "body-sm" },
  base: { type: "body" },
  lg: { type: "h5", weight: "normal" },
  xl: { type: "h4", weight: "normal" },
  "2xl": { type: "h3", weight: "normal" },
};
