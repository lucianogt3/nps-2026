import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// obrigatórios
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL não definido. Verifique api/.env");
}

// CRÍTICO: criar Pool com connectionString (string pura)
const pool = new Pool({
  connectionString: url,
});

// CRÍTICO: adapter correto
const adapter = new PrismaPg(pool);

// No Prisma v7 config mode, o PrismaClient PRECISA receber um options válido.
// O adapter já é esse options válido.
export const prisma = new PrismaClient({
  adapter,
});
