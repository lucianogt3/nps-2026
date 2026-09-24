import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const { PrismaClient } = pkg;

// Pool do Postgres usando a mesma DATABASE_URL do .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Adapter Prisma v7 (Postgres)
const adapter = new PrismaPg(pool);

// PrismaClient agora PRECISA do adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Evita erro se você rodar o seed duas vezes
  const existing = await prisma.tenant.findUnique({ where: { slug: "hospital-demo" } });
  if (existing) {
    console.log("ℹ️ Seed já existe: Hospital Demo");
    return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: "Hospital Demo",
      slug: "hospital-demo",
      users: {
        create: {
          email: "admin@nps.com",
          password: passwordHash,
          role: "ADMIN",
        },
      },
      licenses: {
        create: {
          plan: "YEARLY",
          expiresAt: new Date("2026-12-31"),
          maxDevices: 5,
        },
      },
    },
  });

  console.log("✅ Seed criado com sucesso:", tenant.name);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
