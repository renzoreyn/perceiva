import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TripsClient from "@/components/trips/TripsClient";

export const metadata: Metadata = { title: "Trips" };

export default async function TripsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [dbUser, rawTrips] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true } }),
    prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { transactions: true } },
        transactions: { select: { convertedAmount: true, type: true } },
      },
    }),
  ]);

  const trips = rawTrips.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    baseCurrency: t.baseCurrency,
    startDate: t.startDate,
    endDate: t.endDate,
    createdAt: t.createdAt,
    transactionCount: t._count.transactions,
    totalSpent: t.transactions.filter((tx) => tx.type === "expense").reduce((s, tx) => s + Number(tx.convertedAmount), 0),
    totalIncome: t.transactions.filter((tx) => tx.type === "income").reduce((s, tx) => s + Number(tx.convertedAmount), 0),
  }));

  return (
    <TripsClient
      trips={trips}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
    />
  );
}
