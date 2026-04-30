import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import {
  generateMonthlyRecap,
  getAllRecaps,
} from "@/server/actions/recap.actions";
import { prisma } from "@/lib/prisma";
import InsightsClient from "@/components/insights/InsightsClient";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [recapResult, allRecaps, dbUser] = await Promise.all([
    generateMonthlyRecap(),
    getAllRecaps(),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    }),
  ]);

  return (
    <InsightsClient
      currentRecap={recapResult.data ?? null}
      allRecaps={allRecaps}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
    />
  );
}
