import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CurrencyCode } from "@/lib/currency";
import TransactionsClient from "@/components/transactions/TransactionsClient";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [dbUser, transactions, trips] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { baseCurrency: true, name: true, email: true },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { trip: { select: { id: true, name: true } } },
    }),
    prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <TransactionsClient
      transactions={transactions as any}
      total={transactions.length}
      baseCurrency={(dbUser?.baseCurrency ?? "USD") as CurrencyCode}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
      trips={trips}
    />
  );
}
