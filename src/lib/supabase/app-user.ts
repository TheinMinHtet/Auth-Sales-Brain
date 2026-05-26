import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";

/** Map Supabase auth user to platform Prisma user (create shop owner if new). */
export async function ensurePrismaUser(supabaseUser: SupabaseUser) {
  const email = supabaseUser.email;
  if (!email) return null;

  const name =
    supabaseUser.user_metadata?.full_name ??
    supabaseUser.user_metadata?.name ??
    email.split("@")[0];

  try {
    return await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        role: "SHOP_OWNER",
        passwordHash: "supabase-auth",
      },
      include: { shop: true },
    });
  } catch (error) {
    console.error("Database unavailable — check DATABASE_URL in .env:", error);
    return null;
  }
}
