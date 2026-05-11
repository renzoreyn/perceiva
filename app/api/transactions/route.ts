import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { convertToUsd } from "@/lib/frankfurter";
import type { Currency, TransactionType, RecurrenceInterval } from "@/types";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get("walletId");
  const type = searchParams.get("type") as TransactionType | null;
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const month = searchParams.get("month"); // YYYY-MM

  let dateFilter = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    dateFilter = {
      gte: new Date(year, mon - 1, 1),
      lte: new Date(year, mon, 0, 23, 59, 59),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: dbUser.id,
      ...(walletId && { walletId }),
      ...(type && { type }),
      ...(month && { date: dateFilter }),
    },
    include: { category: true, wallet: true },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.transaction.count({
    where: { userId: dbUser.id, ...(walletId && { walletId }), ...(type && { type }) },
  });

  return NextResponse.json({
    transactions: transactions.map(t => ({ ...t, date: t.date.toISOString() })),
    total,
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const {
    walletId, categoryId, type, amount, currency, note, date,
    isRecurring, recurrenceInterval, recurrenceEndDate,
  }: {
    walletId: string; categoryId?: string; type: TransactionType;
    amount: number; currency: Currency; note?: string; date?: string;
    isRecurring?: boolean; recurrenceInterval?: RecurrenceInterval; recurrenceEndDate?: string;
  } = body;

  if (!walletId || !type || !amount || !currency) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId: dbUser.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

  const { usdAmount, rate } = await convertToUsd(amount, currency);

  const transaction = await prisma.transaction.create({
    data: {
      userId: dbUser.id,
      walletId,
      categoryId: categoryId ?? null,
      type,
      amount,
      currency,
      amountUsd: usdAmount,
      exchangeRateAtEntry: rate,
      note: note ?? null,
      date: date ? new Date(date) : new Date(),
      isRecurring: isRecurring ?? false,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
    },
    include: { category: true, wallet: true },
  });

  return NextResponse.json({ ...transaction, date: transaction.date.toISOString() }, { status: 201 });
}
