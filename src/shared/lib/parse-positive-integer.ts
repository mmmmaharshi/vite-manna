/**
 * Upper bound for ids parsed from URLs and storage, covering the longest book
 * (Psalms, 150 chapters) and chapter (Psalm 119, 176 verses).
 */
export const MAX_REASONABLE_ID = 200;

/**
 * Parses a positive integer id, rejecting anything out of range.
 *
 * @param value - The raw string value.
 * @returns The parsed integer, or null when invalid.
 */
export const parsePositiveInteger = (value: string | null) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_REASONABLE_ID
    ? parsed
    : null;
};
