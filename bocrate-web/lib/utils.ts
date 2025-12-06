import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a datetime string from BOC API (China Standard Time, UTC+8)
 * The API returns time in format "2024-12-07 00:00:00" which is already in UTC+8
 * This function ensures correct timezone interpretation
 */
export function parseBOCTime(timeStr: string): Date {
  // If the time string doesn't have timezone info, it's in UTC+8 (Beijing time)
  // We need to tell JavaScript this is UTC+8, not UTC
  if (!timeStr.includes('+') && !timeStr.includes('Z')) {
    // Replace space with 'T' and add timezone offset
    const isoStr = timeStr.replace(' ', 'T') + '+08:00';
    return new Date(isoStr);
  }
  return new Date(timeStr);
}
