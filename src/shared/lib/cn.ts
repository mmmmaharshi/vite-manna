import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, resolving Tailwind conflicts.
 *
 * @param inputs - Class values accepted by clsx.
 * @returns The merged class string.
 */
export const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));
