import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { getTransactions } from "@/server/actions/transaction.actions";
import { prisma } from "@/lib/prisma";
import TransactionsClient from "@/components/transactions/TransactionsClient";
import type { CurrencyCode } from "@/lib/currency";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [{ transactions, total }, dbUser] = await Promise.all([
    getTransactions({ limit: 100 }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { baseCurrency: true, name: true, email: true },
    }),
  ]);

  return (
    <TransactionsClient
      transactions={transactions}
      total={total}
      baseCurrency={(dbUser?.baseCurrency ?? "USD") as CurrencyCode}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
    />
  );
}
