import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/frankfurter";
import { Currency } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "USD") as Currency;

  try {
    const rates = await getExchangeRates(base);
    return NextResponse.json(rates, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
