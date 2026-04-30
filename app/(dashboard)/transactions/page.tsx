import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { getTransactions } from "@/server/actions/transaction.actions";
import { getTrips } from "@/server/actions/trip.actions";
import { prisma } from "@/lib/prisma";
import TransactionsClient from "@/components/transactions/TransactionsClient";
import type { CurrencyCode } from "@/lib/currency";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [{ transactions, total }, trips, dbUser] = await Promise.all([
    getTransactions({ limit: 200 }),
    getTrips(),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { baseCurrency: true, name: true, email: true },
    }),
  ]);

  return (
    <TransactionsClient
      transactions={transactions as any}
      total={total}
      baseCurrency={(dbUser?.baseCurrency ?? "USD") as CurrencyCode}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
      trips={trips.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
