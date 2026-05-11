import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { convertToUsd } from "@/lib/frankfurter";
import type { Currency } from "@/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;
  const tx = await prisma.transaction.findFirst({ where: { id, userId: dbUser.id } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { amount, currency, note, date, categoryId, walletId } = body;

  let usdUpdate = {};
  if (amount && currency) {
    const { usdAmount, rate } = await convertToUsd(amount, currency as Currency);
    usdUpdate = { amountUsd: usdAmount, exchangeRateAtEntry: rate };
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(amount && { amount }),
      ...(currency && { currency }),
      ...(note !== undefined && { note }),
      ...(date && { date: new Date(date) }),
      ...(categoryId !== undefined && { categoryId }),
      ...(walletId && { walletId }),
      ...usdUpdate,
    },
    include: { category: true, wallet: true },
  });

  return NextResponse.json({ ...updated, date: updated.date.toISOString() });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;
  const tx = await prisma.transaction.findFirst({ where: { id, userId: dbUser.id } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
