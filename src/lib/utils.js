import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
