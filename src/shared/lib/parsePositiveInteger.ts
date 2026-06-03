export const MAX_REASONABLE_ID = 200;

export function parsePositiveInteger(value: string | null, max = MAX_REASONABLE_ID) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= max ? parsed : null;
}
