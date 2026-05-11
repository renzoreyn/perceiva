import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const wallets = await prisma.wallet.findMany({
    where: { userId: dbUser.id },
    include: { transactions: { select: { type: true, amountUsd: true } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const walletsWithStats = wallets.map(w => ({
    id: w.id,
    name: w.name,
    baseCurrency: w.baseCurrency,
    cardColor: w.cardColor,
    cardStyle: w.cardStyle,
    emoji: w.emoji,
    isDefault: w.isDefault,
    totalIncomeUsd: w.transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amountUsd, 0),
    totalExpenseUsd: w.transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amountUsd, 0),
    balanceUsd: w.transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amountUsd, 0)
             - w.transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amountUsd, 0),
    transactionCount: w.transactions.length,
  }));

  return NextResponse.json(walletsWithStats);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { name, baseCurrency, cardColor, emoji } = body;

  if (!name || !baseCurrency) {
    return NextResponse.json({ error: "Name and currency required" }, { status: 400 });
  }

  const existingCount = await prisma.wallet.count({ where: { userId: dbUser.id } });

  const wallet = await prisma.wallet.create({
    data: {
      userId: dbUser.id,
      name,
      baseCurrency,
      cardColor: cardColor ?? "card-space",
      emoji: emoji ?? null,
      isDefault: existingCount === 0,
    },
  });

  return NextResponse.json(wallet, { status: 201 });
}
