import { Currency, ExchangeRates } from "@/types";

const BASE_URL = "https://api.frankfurter.app";
const SUPPORTED_CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "CHF", "CNY", "IDR", "AMD", "RUB", "PHP", "SGD"];

// Cache in-memory for the session (5 min TTL)
let cache: { data: ExchangeRates; expiresAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getExchangeRates(base: Currency = "USD"): Promise<ExchangeRates> {
  const now = Date.now();
  
  if (cache && cache.data.base === base && now < cache.expiresAt) {
    return cache.data;
  }

  try {
    const symbols = SUPPORTED_CURRENCIES.filter(c => c !== base).join(",");
    const res = await fetch(`${BASE_URL}/latest?from=${base}&to=${symbols}`, {
      next: { revalidate: 300 }, // 5 min cache in Next.js
    });

    if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
    
    const data = await res.json();
    
    const rates: Record<Currency, number> = { [base]: 1 } as Record<Currency, number>;
    for (const [code, rate] of Object.entries(data.rates)) {
      if (SUPPORTED_CURRENCIES.includes(code as Currency)) {
        rates[code as Currency] = rate as number;
      }
    }

    const result: ExchangeRates = {
      base,
      rates,
      fetchedAt: new Date().toISOString(),
    };

    cache = { data: result, expiresAt: now + CACHE_TTL };
    return result;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Return fallback rates if API fails
    return getFallbackRates(base);
  }
}

export async function convertAmount(
  amount: number,
  from: Currency,
  to: Currency
): Promise<{ converted: number; rate: number }> {
  if (from === to) return { converted: amount, rate: 1 };
  
  const rates = await getExchangeRates("USD");
  
  // Convert to USD first, then to target
  const fromRate = from === "USD" ? 1 : rates.rates[from];
  const toRate = to === "USD" ? 1 : rates.rates[to];
  
  const usdAmount = amount / fromRate;
  const converted = usdAmount * toRate;
  const rate = toRate / fromRate;
  
  return { converted, rate };
}

export async function convertToUsd(amount: number, from: Currency): Promise<{ usdAmount: number; rate: number }> {
  const { converted, rate } = await convertAmount(amount, from, "USD");
  return { usdAmount: converted, rate };
}

// Fallback rates (approximate, for offline use)
function getFallbackRates(base: Currency): ExchangeRates {
  const usdRates: Record<Currency, number> = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    CHF: 0.88,
    CNY: 7.24,
    IDR: 15800,
    AMD: 387,
    RUB: 89.5,
    PHP: 58.4,
    SGD: 1.35,
  };

  if (base === "USD") {
    return { base, rates: usdRates, fetchedAt: new Date().toISOString() };
  }

  const baseRate = usdRates[base];
  const rates = {} as Record<Currency, number>;
  for (const [code, rate] of Object.entries(usdRates)) {
    rates[code as Currency] = rate / baseRate;
  }

  return { base, rates, fetchedAt: new Date().toISOString() };
}

export function formatRate(from: Currency, to: Currency, rate: number): string {
  const precision = rate < 0.01 ? 6 : rate < 1 ? 4 : 2;
  return `1 ${from} = ${rate.toFixed(precision)} ${to}`;
}

export { SUPPORTED_CURRENCIES };
