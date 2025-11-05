import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind classes using twMerge.
 */

// biome-ignore lint/suspicious/noExplicitAny: required for cn function
export function cn(...inputs: any[]) {
	return twMerge(clsx(...inputs));
}
