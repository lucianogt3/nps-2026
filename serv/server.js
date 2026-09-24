// server/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Lê .env na raiz do projeto

const app = express();

// -------------------------
// CONFIG
// -------------------------
const PORT = Number(process.env.PORT || 3333);
const DB_FILE = path.join(__dirname, "db.json");
const API_KEY = process.env.API_KEY || "segredo-123"; // ✅ vem do .env

// -------------------------
// MIDDLEWARES
// -------------------------
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

function requireApiKey(req, res, next) {
  const clientKey = req.headers["x-api-key"];

  if (!clientKey || clientKey !== API_KEY) {
    return res.status(403).json({ error: "Chave de API inválida" });
  }
  next();
}

// -------------------------
// DB HELPERS
// -------------------------
const ensureDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      config: {},
      users: [],
      sectors: [],
      categories: [],
      responses: [],
      actionPlans: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return null;
};

const readDB = () => {
  try {
    ensureDB();
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Erro ao ler DB:", error);
    return {
      config: {},
      users: [],
      sectors: [],
      categories: [],
      responses: [],
      actionPlans: [],
      _error: "Falha ao ler db.json",
    };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar DB:", error);
    return false;
  }
};

// -------------------------
// ROUTES
// -------------------------

// Status simples
app.get("/", (req, res) => {
  res.send("NurseTec Server is Running! 🚀");
});

// ✅ Health público (para monitoramento)
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "nursetec-server",
    port: PORT,
    ts: new Date().toISOString(),
  });
});

// ✅ Health protegido (para testar API KEY)
app.get("/api/health", requireApiKey, (req, res) => {
  res.status(200).json({
    ok: true,
    service: "nursetec-server",
    protected: true,
    ts: new Date().toISOString(),
  });
});

// ✅ Sync (GET) - retorna DB inteiro
app.get("/api/sync", requireApiKey, (req, res) => {
  const db = readDB();
  res.json(db);
});

// ✅ Sync (POST) - atualiza seção específica do DB
app.post("/api/sync", requireApiKey, (req, res) => {
  const { type, data } = req.body || {};
  const db = readDB();

  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: 'Payload inválido. Necessário "type" (string).' });
  }
  if (data === undefined) {
    return res.status(400).json({ error: 'Payload inválido. Necessário "data".' });
  }

  console.log(`[SYNC] Recebendo atualização de: ${type}`);

  // Atualiza apenas a chave solicitada
  db[type] = data;

  if (writeDB(db)) {
    return res.json({ success: true, message: `${type} atualizado com sucesso.` });
  }
  return res.status(500).json({ error: "Falha ao escrever no banco de dados." });
});

// -------------------------
// START
// -------------------------
app.listen(PORT, () => {
  ensureDB();
  console.log(`\n✅ Servidor Backend rodando em: http://localhost:${PORT}`);
  console.log(`📂 Arquivo de dados: ${DB_FILE}`);
  console.log(`🔐 API_KEY (env): ${process.env.API_KEY ? "OK" : "não definida (usando default)"}\n`);
});
