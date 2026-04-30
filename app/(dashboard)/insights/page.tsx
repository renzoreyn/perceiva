import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMonthlyRecap, getAllRecaps } from "@/server/actions/recap.actions";
import InsightsClient from "@/components/insights/InsightsClient";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true },
  });

  const [recapResult, allRecaps] = await Promise.all([
    generateMonthlyRecap(),
    getAllRecaps(),
  ]);

  return (
    <InsightsClient
      currentRecap={recapResult.data ?? null}
      allRecaps={allRecaps}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
    />
  );
}
