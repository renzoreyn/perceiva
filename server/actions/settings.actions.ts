"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  baseCurrency: z.enum(["USD","EUR","GBP","CNY","IDR","AMD"]).optional(),
});

export async function updateUserSettings(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const raw = {
    name: formData.get("name") || undefined,
    baseCurrency: formData.get("baseCurrency") || undefined,
  };

  const parsed = UpdateSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.baseCurrency ? { baseCurrency: parsed.data.baseCurrency as any } : {}),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
