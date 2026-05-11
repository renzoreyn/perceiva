import { Currency, ExchangeRates } from "@/types";

const OXR_APP_ID = process.env.OXR_APP_ID || "3754dd56541146c59829ece26fbaebe5";
const BASE_URL = "https://openexchangerates.org/api";
const SUPPORTED_CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "CHF", "CNY", "IDR", "AMD", "RUB", "PHP", "SGD"];

// In-memory cache (5 min TTL)
let cache: { data: ExchangeRates; expiresAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getExchangeRates(base: Currency = "USD"): Promise<ExchangeRates> {
  const now = Date.now();
  if (cache && cache.data.base === base && now < cache.expiresAt) return cache.data;

  try {
    // OXR free plan always returns USD as base
    const res = await fetch(
      `${BASE_URL}/latest.json?app_id=${OXR_APP_ID}&symbols=${SUPPORTED_CURRENCIES.join(",")}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`OXR error: ${res.status}`);
    const data = await res.json();

    // data.rates is always USD-based
    const usdRates = data.rates as Record<string, number>;
    let rates: Record<Currency, number> = { USD: 1 } as Record<Currency, number>;

    if (base === "USD") {
      for (const code of SUPPORTED_CURRENCIES) {
        if (usdRates[code]) rates[code] = usdRates[code];
      }
    } else {
      // Cross-rate: divide everything by the base rate
      const baseRate = usdRates[base] ?? 1;
      for (const code of SUPPORTED_CURRENCIES) {
        if (usdRates[code]) rates[code] = usdRates[code] / baseRate;
      }
      rates[base] = 1;
    }

    const result: ExchangeRates = { base, rates, fetchedAt: new Date().toISOString() };
    cache = { data: result, expiresAt: now + CACHE_TTL };
    return result;
  } catch (error) {
    console.error("OXR fetch failed, using fallback:", error);
    return getFallbackRates(base);
  }
}

export async function convertAmount(amount: number, from: Currency, to: Currency): Promise<{ converted: number; rate: number }> {
  if (from === to) return { converted: amount, rate: 1 };
  const rates = await getExchangeRates("USD");
  const fromRate = from === "USD" ? 1 : (rates.rates[from] ?? 1);
  const toRate   = to   === "USD" ? 1 : (rates.rates[to]   ?? 1);
  const converted = (amount / fromRate) * toRate;
  return { converted, rate: toRate / fromRate };
}

export async function convertToUsd(amount: number, from: Currency): Promise<{ usdAmount: number; rate: number }> {
  const { converted, rate } = await convertAmount(amount, from, "USD");
  return { usdAmount: converted, rate };
}

function getFallbackRates(base: Currency): ExchangeRates {
  const usdRates: Record<Currency, number> = {
    USD: 1, GBP: 0.79, EUR: 0.92, CHF: 0.88, CNY: 7.26,
    IDR: 17417, AMD: 390, RUB: 91.2, PHP: 58.4, SGD: 1.35,
  };
  if (base === "USD") return { base, rates: usdRates, fetchedAt: new Date().toISOString() };
  const baseRate = usdRates[base] ?? 1;
  const rates = {} as Record<Currency, number>;
  for (const [code, rate] of Object.entries(usdRates)) rates[code as Currency] = rate / baseRate;
  return { base, rates, fetchedAt: new Date().toISOString() };
}

export function formatRate(from: Currency, to: Currency, rate: number): string {
  const precision = rate < 0.01 ? 6 : rate < 1 ? 4 : 2;
  return `1 ${from} = ${rate.toFixed(precision)} ${to}`;
}

export { SUPPORTED_CURRENCIES };
