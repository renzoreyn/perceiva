import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { getTrips } from "@/server/actions/trip.actions";
import { prisma } from "@/lib/prisma";
import TripsClient from "@/components/trips/TripsClient";

export const metadata: Metadata = { title: "Trips" };

export default async function TripsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const [trips, dbUser] = await Promise.all([
    getTrips(),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    }),
  ]);

  return (
    <TripsClient
      trips={trips}
      userName={dbUser?.name ?? dbUser?.email ?? "User"}
    />
  );
}
