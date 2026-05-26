import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEVELOPER_EMAIL ?? "admin@platform.dev";

  await prisma.user.upsert({
    where: { email },
    update: { role: "DEVELOPER" },
    create: {
      email,
      name: "Platform Developer",
      passwordHash: "supabase-auth",
      role: "DEVELOPER",
    },
  });

  console.log(`Developer account ready: ${email}`);
  console.log("Sign in with this email via Supabase (Google or email/password).");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
