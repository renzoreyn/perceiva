import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/utils/index";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { start, end } = getMonthRange();

  const budgets = await prisma.budget.findMany({
    where: { userId: dbUser.id },
    include: { category: true },
  });

  const budgetsWithSpending = await Promise.all(
    budgets.map(async b => {
      const spent = await prisma.transaction.aggregate({
        where: { userId: dbUser.id, categoryId: b.categoryId, type: "EXPENSE", date: { gte: start, lte: end } },
        _sum: { amountUsd: true },
      });
      const spentAmount = spent._sum.amountUsd ?? 0;
      return {
        ...b,
        spent: spentAmount,
        percentage: Math.min((spentAmount / b.amount) * 100, 100),
      };
    })
  );

  return NextResponse.json(budgetsWithSpending);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { categoryId, amount, period } = await req.json();
  if (!categoryId || !amount) return NextResponse.json({ error: "Category and amount required" }, { status: 400 });

  const budget = await prisma.budget.upsert({
    where: { userId_categoryId_period: { userId: dbUser.id, categoryId, period: period ?? "monthly" } },
    create: { userId: dbUser.id, categoryId, amount, period: period ?? "monthly" },
    update: { amount },
    include: { category: true },
  });

  return NextResponse.json(budget, { status: 201 });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await req.json();
  await prisma.budget.deleteMany({ where: { id, userId: dbUser.id } });
  return NextResponse.json({ success: true });
}
