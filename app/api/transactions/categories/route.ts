import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let categories = await prisma.category.findMany({
    where: { userId: dbUser.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  // Seed defaults if none exist
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(c => ({
        userId: dbUser.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        type: c.type,
        isDefault: true,
      })),
    });
    categories = await prisma.category.findMany({
      where: { userId: dbUser.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { name, icon, color, type } = await req.json();
  if (!name || !type) return NextResponse.json({ error: "Name and type required" }, { status: 400 });

  const category = await prisma.category.create({
    data: { userId: dbUser.id, name, icon: icon ?? "circle", color: color ?? "#0A84FF", type },
  });

  return NextResponse.json(category, { status: 201 });
}
