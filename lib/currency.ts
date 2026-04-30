export type CurrencyCode = "USD" | "EUR" | "GBP" | "CNY" | "IDR" | "AMD";

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "USD",
  "EUR",
  "GBP",
  "CNY",
  "IDR",
  "AMD",
];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CNY: "Chinese Yuan",
  IDR: "Indonesian Rupiah",
  AMD: "Armenian Dram",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  IDR: "Rp",
  AMD: "֏",
};

export const CURRENCY_FLAGS: Record<CurrencyCode, string> = {
  USD: "US",
  EUR: "EU",
  GBP: "GB",
  CNY: "CN",
  IDR: "ID",
  AMD: "AM",
};

// ── In-memory rate cache (1 hour TTL) ───────────────────────────
interface RateCache {
  rates: Record<string, number>;
  base: string;
  fetchedAt: number;
}

let rateCache: RateCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchLiveRates(
  base: string = "USD"
): Promise<Record<string, number>> {
  const key = process.env.CURRENCY_API_KEY;
  if (!key) throw new Error("CURRENCY_API_KEY is not configured");

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok)
    throw new Error(`ExchangeRate-API error: ${res.status}`);

  const data = await res.json();
  if (data.result !== "success")
    throw new Error("ExchangeRate-API returned failure status");

  return data.conversion_rates as Record<string, number>;
}

export async function getExchangeRates(
  base: CurrencyCode = "USD"
): Promise<Record<string, number>> {
  const now = Date.now();
  if (
    rateCache &&
    rateCache.base === base &&
    now - rateCache.fetchedAt < CACHE_TTL_MS
  ) {
    return rateCache.rates;
  }

  const rates = await fetchLiveRates(base);
  rateCache = { rates, base, fetchedAt: now };
  return rates;
}

export async function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<{ convertedAmount: number; exchangeRateUsed: number }> {
  if (from === to) return { convertedAmount: amount, exchangeRateUsed: 1 };

  const rates = await getExchangeRates(from);
  const rate = rates[to];
  if (!rate) throw new Error(`No rate found for ${from} → ${to}`);

  return {
    convertedAmount: Math.round(amount * rate * 10000) / 10000,
    exchangeRateUsed: rate,
  };
}

export function formatAmount(
  amount: number,
  currency: CurrencyCode,
  compact = false
): string {
  const sym = CURRENCY_SYMBOLS[currency];
  const isLargeDenomination = currency === "IDR" || currency === "AMD";

  if (compact && Math.abs(amount) >= 1000) {
    const k = amount / 1000;
    return `${sym}${k.toFixed(1)}k`;
  }

  return `${sym}${amount.toLocaleString("en-US", {
    minimumFractionDigits: isLargeDenomination ? 0 : 2,
    maximumFractionDigits: isLargeDenomination ? 0 : 2,
  })}`;
}
