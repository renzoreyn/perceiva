import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/settings/SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, baseCurrency: true },
  });

  if (!dbUser) redirect("/login");
  return <SettingsClient user={dbUser} />;
}
