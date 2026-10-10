export { cn } from "cn"

// Utility to format time ago
export function formatTimeAgo(date: string | Date) {
  // check the type of date... if it is a string, convert it to a Date object, otherwise use it as is
  const d = typeof date === "string" ? new Date(date) : date;
  // Calculate time difference
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  // Define intervals
  const intervals: Record<string, number> = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
  // Loop through intervals
  for (const key in intervals) {
    const value = Math.floor(seconds / intervals[key]);    // Calculate value
    if (value > 1) return `${value} ${key}s ago`;          // Return this formatted string if value is > 1
    if (value === 1) return `1 ${key} ago`;                // Return this formatted string if value is 1
  }

  return "Just now";         // Return "Just now" if no intervals match
}