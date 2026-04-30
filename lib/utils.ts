import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export const CATEGORY_LABELS: Record<string, string> = {
  food_drink: "Food & Drink",
  transport: "Transport",
  shopping: "Shopping",
  utilities: "Utilities",
  housing: "Housing",
  health: "Health",
  entertainment: "Entertainment",
  education: "Education",
  travel: "Travel",
  income_salary: "Salary",
  income_freelance: "Freelance",
  income_other: "Other Income",
  other: "Other",
};

// Lucide icon names for categories — used in components
export const CATEGORY_ICON_NAMES: Record<string, string> = {
  food_drink: "UtensilsCrossed",
  transport: "Car",
  shopping: "ShoppingBag",
  utilities: "Zap",
  housing: "Home",
  health: "Heart",
  entertainment: "Gamepad2",
  education: "BookOpen",
  travel: "Plane",
  income_salary: "Briefcase",
  income_freelance: "Laptop",
  income_other: "Coins",
  other: "Package",
};

export const EXPENSE_CATEGORIES = [
  "food_drink",
  "transport",
  "shopping",
  "utilities",
  "housing",
  "health",
  "entertainment",
  "education",
  "travel",
  "other",
] as const;

export const INCOME_CATEGORIES = [
  "income_salary",
  "income_freelance",
  "income_other",
] as const;
