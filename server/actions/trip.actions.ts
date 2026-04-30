"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TripSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  baseCurrency: z.enum(["USD","EUR","GBP","CNY","IDR","AMD"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function createTrip(
  input: z.infer<typeof TripSchema>
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = TripSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      baseCurrency: parsed.data.baseCurrency as any,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  revalidatePath("/trips");
  return { success: true, id: trip.id };
}

export async function deleteTrip(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const trip = await prisma.trip.findFirst({ where: { id, userId: user.id } });
  if (!trip) return { success: false, error: "Trip not found" };

  await prisma.trip.delete({ where: { id } });
  revalidatePath("/trips");
  return { success: true };
}

export async function getTrips() {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { transactions: true } },
      transactions: {
        select: { convertedAmount: true, type: true },
      },
    },
  });

  return trips.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    baseCurrency: t.baseCurrency,
    startDate: t.startDate,
    endDate: t.endDate,
    createdAt: t.createdAt,
    transactionCount: t._count.transactions,
    totalSpent: t.transactions
      .filter((tx) => tx.type === "expense")
      .reduce((s, tx) => s + Number(tx.convertedAmount), 0),
    totalIncome: t.transactions
      .filter((tx) => tx.type === "income")
      .reduce((s, tx) => s + Number(tx.convertedAmount), 0),
  }));
}

export async function getTripById(id: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const trip = await prisma.trip.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return trip;
}
