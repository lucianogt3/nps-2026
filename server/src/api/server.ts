import "dotenv/config";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: true, // em produção você pode travar no seu domínio
});
app.register(jwt, { secret: process.env.JWT_SECRET || "dev_secret" });

// =====================================================
// ✅ ROTAS PÚBLICAS (TESTE)
// =====================================================
app.get("/", async () => ({
  ok: true,
  name: "NPS API",
  version: "1.0.0",
}));

app.get("/health", async () => ({ ok: true }));

// =====================================================
// 🔐 LOGIN (PÚBLICO)
// =====================================================
app.post("/auth/login", async (req, reply) => {
  const { tenantSlug, email, password } = req.body as {
    tenantSlug?: string;
    email?: string;
    password?: string;
  };

  if (!tenantSlug || !email || !password) {
    return reply.code(400).send({ error: "tenantSlug, email e password são obrigatórios" });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) return reply.code(401).send({ error: "Tenant inválido" });

  const user = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email },
    include: { tenant: true },
  });

  if (!user) return reply.code(401).send({ error: "Usuário inválido" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return reply.code(401).send({ error: "Senha inválida" });

  const token = app.jwt.sign({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  return { token };
});

console.log("DB URL exists?", !!process.env.DATABASE_URL);
console.log("DB URL type:", typeof process.env.DATABASE_URL);

// =====================================================
// 🌍 ROTAS PÚBLICAS (COLETAR NPS SEM LOGIN)
// - Ideal para link/QR Code
// =====================================================

// Buscar dados mínimos da campanha por slug (pra exibir no formulário público)
app.get("/public/campaign/:slug", async (req, reply) => {
  const { slug } = req.params as { slug: string };

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, channel: true, isActive: true },
  });

  if (!campaign) return reply.code(404).send({ error: "Campanha não encontrada" });
  if (!campaign.isActive) return reply.code(403).send({ error: "Campanha inativa" });

  return campaign;
});

// Enviar resposta NPS (público)
app.post("/public/responses", async (req, reply) => {
  const { campaignId, score, comment } = req.body as {
    campaignId?: string;
    score?: number;
    comment?: string;
  };

  if (!campaignId) return reply.code(400).send({ error: "campaignId é obrigatório" });

  const n = Number(score);
  if (!Number.isFinite(n) || n < 0 || n > 10) {
    return reply.code(400).send({ error: "score deve ser um número entre 0 e 10" });
  }

  // garante que campanha existe e está ativa
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, isActive: true },
  });

  if (!campaign) return reply.code(404).send({ error: "Campanha não encontrada" });
  if (!campaign.isActive) return reply.code(403).send({ error: "Campanha inativa" });

  const response = await prisma.response.create({
    data: {
      campaignId,
      score: n,
      comment: (comment || "").trim().slice(0, 1000),
    },
  });

  return { ok: true, id: response.id };
});

// =====================================================
// 🔒 MIDDLEWARE JWT (PROTEGE O PAINEL)
// =====================================================
app.addHook("preHandler", async (req) => {
  const publicPaths = ["/", "/health", "/favicon.ico"];
  const isPublic =
    req.url.startsWith("/auth") ||
    req.url.startsWith("/public") ||
    publicPaths.includes(req.url);

  if (isPublic) return;

  await req.jwtVerify();
});

// =====================================================
// 🔒 ROTAS PROTEGIDAS (PAINEL)
// =====================================================

// Criar campanha (protegidíssimo)
app.post("/campaigns", async (req, reply) => {
  const { name, channel } = req.body as { name?: string; channel?: string };
  const { tenantId } = req.user as any;

  if (!name) return reply.code(400).send({ error: "name é obrigatório" });

  // slug simples (pode melhorar depois)
  const slugBase = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;

  return prisma.campaign.create({
    data: {
      name,
      slug,
      channel: channel || "WEB",
      isActive: true,
      tenantId,
    },
  });
});

// Registrar NPS protegido (se quiser usar interno)
app.post("/responses", async (req, reply) => {
  const { campaignId, score, comment } = req.body as any;

  if (!campaignId) return reply.code(400).send({ error: "campaignId é obrigatório" });

  const n = Number(score);
  if (!Number.isFinite(n) || n < 0 || n > 10) {
    return reply.code(400).send({ error: "score deve ser um número entre 0 e 10" });
  }

  const response = await prisma.response.create({
    data: { campaignId, score: n, comment: (comment || "").trim().slice(0, 1000) },
  });

  return response;
});

// Dashboard NPS por tenant
app.get("/dashboard/nps", async (req) => {
  const { tenantId } = req.user as any;

  const responses = await prisma.response.findMany({
    where: { campaign: { tenantId } },
    select: { score: true },
  });

  const total = responses.length;
  const promoters = responses.filter((r) => r.score >= 9).length;
  const detractors = responses.filter((r) => r.score <= 6).length;

  const nps = total ? Math.round(((promoters - detractors) / total) * 100) : 0;

  return { total, promoters, detractors, nps };
});

// =====================================================
// 🚀 START
// =====================================================
const port = Number(process.env.PORT) || 3333;

app
  .listen({ port, host: "127.0.0.1" })
  .then(() => {
    console.log(`🚀 API rodando em http://127.0.0.1:${port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
