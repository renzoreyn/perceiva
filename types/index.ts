export type Currency = "USD" | "GBP" | "EUR" | "CHF" | "CNY" | "IDR" | "AMD" | "RUB" | "PHP" | "SGD";
export type TransactionType = "INCOME" | "EXPENSE";
export type RecurrenceInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export const CURRENCIES: { code: Currency; name: string; symbol: string; flag: string }[] = [
  { code: "USD", name: "US Dollar",        symbol: "$",  flag: "🇺🇸" },
  { code: "GBP", name: "British Pound",    symbol: "£",  flag: "🇬🇧" },
  { code: "EUR", name: "Euro",             symbol: "€",  flag: "🇪🇺" },
  { code: "CHF", name: "Swiss Franc",      symbol: "Fr", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan",     symbol: "¥",  flag: "🇨🇳" },
  { code: "IDR", name: "Indonesian Rupiah",symbol: "Rp", flag: "🇮🇩" },
  { code: "AMD", name: "Armenian Dram",    symbol: "֏",  flag: "🇦🇲" },
  { code: "RUB", name: "Russian Ruble",    symbol: "₽",  flag: "🇷🇺" },
];

export const CARD_THEMES = [
  { id: "card-space",       name: "Space Grey",    class: "bg-gradient-to-br from-[#2C2C2E] via-[#48484A] to-[#1C1C1E]", textClass: "text-white" },
  { id: "card-silver",      name: "Starlight",     class: "bg-gradient-to-br from-[#E8E8ED] via-[#F5F5F7] to-[#D2D2D7]", textClass: "text-gray-900" },
  { id: "card-gold",        name: "Gold",          class: "bg-gradient-to-br from-[#C8A96E] via-[#E8D5A3] to-[#B8965A]", textClass: "text-amber-950" },
  { id: "card-midnight",    name: "Midnight",      class: "bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]", textClass: "text-white" },
  { id: "card-red",         name: "Product Red",   class: "bg-gradient-to-br from-[#BF0000] via-[#E31212] to-[#8B0000]", textClass: "text-white" },
  { id: "card-green",       name: "Alpine Green",  class: "bg-gradient-to-br from-[#1B4D3E] via-[#2D6A4F] to-[#1B4D3E]", textClass: "text-white" },
  { id: "card-purple",      name: "Deep Purple",   class: "bg-gradient-to-br from-[#2D1B69] via-[#4A2C8F] to-[#1A0F3D]", textClass: "text-white" },
  { id: "card-ocean",       name: "Ocean Blue",    class: "bg-gradient-to-br from-[#0077B6] via-[#00B4D8] to-[#0077B6]", textClass: "text-white" },
] as const;

export type CardThemeId = typeof CARD_THEMES[number]["id"];

export const WIDGET_TYPES = [
  "net-worth",
  "monthly-summary",
  "spending-by-category",
  "recent-transactions",
  "exchange-ticker",
  "budget-overview",
  "income-vs-expense",
  "wallet-balances",
] as const;

export type WidgetType = typeof WIDGET_TYPES[number];

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  position: number;
  size: "small" | "medium" | "large";
  visible: boolean;
}

export interface ExchangeRates {
  base: Currency;
  rates: Record<Currency, number>;
  fetchedAt: string;
}

export interface TransactionWithRelations {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  amountUsd: number;
  exchangeRateAtEntry: number;
  note: string | null;
  date: string;
  isRecurring: boolean;
  recurrenceInterval: RecurrenceInterval | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  wallet: {
    id: string;
    name: string;
    baseCurrency: Currency;
    cardColor: string;
  };
}

export interface WalletWithStats {
  id: string;
  name: string;
  baseCurrency: Currency;
  cardColor: string;
  cardStyle: string;
  emoji: string | null;
  isDefault: boolean;
  totalIncomeUsd: number;
  totalExpenseUsd: number;
  balanceUsd: number;
  transactionCount: number;
}

export interface BudgetWithSpending {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
  spent: number;
  percentage: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export const DEFAULT_CATEGORIES = [
  { name: "Salary",        icon: "briefcase",     color: "#30D158", type: "INCOME"  as TransactionType },
  { name: "Freelance",     icon: "laptop",        color: "#0A84FF", type: "INCOME"  as TransactionType },
  { name: "Investment",    icon: "trending-up",   color: "#5E5CE6", type: "INCOME"  as TransactionType },
  { name: "Food & Drink",  icon: "utensils",      color: "#FF9F0A", type: "EXPENSE" as TransactionType },
  { name: "Transport",     icon: "car",           color: "#0A84FF", type: "EXPENSE" as TransactionType },
  { name: "Rent",          icon: "home",          color: "#FF453A", type: "EXPENSE" as TransactionType },
  { name: "Shopping",      icon: "shopping-bag",  color: "#BF5AF2", type: "EXPENSE" as TransactionType },
  { name: "Health",        icon: "heart",         color: "#FF2D55", type: "EXPENSE" as TransactionType },
  { name: "Entertainment", icon: "film",          color: "#FF9F0A", type: "EXPENSE" as TransactionType },
  { name: "Utilities",     icon: "zap",           color: "#64D2FF", type: "EXPENSE" as TransactionType },
  { name: "Subscriptions", icon: "repeat",        color: "#5E5CE6", type: "EXPENSE" as TransactionType },
  { name: "Other",         icon: "circle",        color: "#98989D", type: "EXPENSE" as TransactionType },
] as const;

export function getCurrencySymbol(code: Currency): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

export function getCurrencyFlag(code: Currency): string {
  return CURRENCIES.find(c => c.code === code)?.flag ?? "";
}

export function formatAmount(amount: number, currency: Currency, compact = false): string {
  const symbol = getCurrencySymbol(currency);
  
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }

  // Currencies with no decimal convention
  const noDecimal: Currency[] = ["IDR", "AMD", "RUB", "PHP"];
  const decimals = noDecimal.includes(currency) ? 0 : 2;

  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
