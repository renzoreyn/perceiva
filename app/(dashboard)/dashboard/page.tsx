import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { getDashboardData } from "@/server/actions/transaction.actions";
import { getBudgetProgress } from "@/server/actions/budget.actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [data, budgetProgress] = await Promise.all([
    getDashboardData(),
    getBudgetProgress(),
  ]);

  return <DashboardClient data={data} budgetProgress={budgetProgress} />;
}
