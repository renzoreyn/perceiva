import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const { name, baseCurrency, cardColor, emoji } = body;

  const wallet = await prisma.wallet.findFirst({ where: { id, userId: dbUser.id } });
  if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.wallet.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(baseCurrency && { baseCurrency }),
      ...(cardColor && { cardColor }),
      ...(emoji !== undefined && { emoji }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;
  const wallet = await prisma.wallet.findFirst({ where: { id, userId: dbUser.id } });
  if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (wallet.isDefault) return NextResponse.json({ error: "Cannot delete default wallet" }, { status: 400 });

  await prisma.wallet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
