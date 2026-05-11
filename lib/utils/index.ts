import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = new Date(date);
  const now = new Date();
  
  if (format === "relative") {
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days === 0) {
      if (hours === 0) {
        if (minutes === 0) return "just now";
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
  }
  
  if (format === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function getMonthRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
