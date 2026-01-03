const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');
const API_KEY = 'segredo-123'; // Simulação de segurança simples

// Middleware
app.use(cors()); // Permite que o Front-end (localhost:3000 ou 5173) acesse este servidor
app.use(bodyParser.json({ limit: '50mb' })); // Aumentado limite para suportar backups grandes

// Função auxiliar para ler o DB
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            // Cria arquivo vazio se não existir
            const initialData = { config: {}, users: [], sectors: [], categories: [], responses: [], actionPlans: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler DB:', error);
        return {};
    }
};

// Função auxiliar para salvar o DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar DB:', error);
        return false;
    }
};

// Rota de Teste/Status
app.get('/', (req, res) => {
    res.send('NurseTec Server is Running! 🚀');
});

// Rota Principal de Sincronização (GET)
// O Front-end chama isso ao iniciar para pegar todos os dados
app.get('/api/sync', (req, res) => {
    // Verificação simples de token (Opcional)
    const clientKey = req.headers['x-api-key'];
    if (clientKey && clientKey !== API_KEY) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const db = readDB();
    res.json(db);
});

// Rota Principal de Sincronização (POST)
// O Front-end chama isso sempre que algo muda (ex: nova resposta, novo setor)
app.post('/api/sync', (req, res) => {
    const clientKey = req.headers['x-api-key'];
    if (clientKey && clientKey !== API_KEY) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const { type, data } = req.body;
    const db = readDB();

    if (!type || !data) {
        return res.status(400).json({ error: 'Payload inválido. Necessário "type" e "data".' });
    }

    console.log(`[SYNC] Recebendo atualização de: ${type}`);

    // Atualiza apenas a seção específica do banco de dados
    // ex: se type for 'sectors', atualiza apenas db.sectors
    db[type] = data;

    if (writeDB(db)) {
        res.json({ success: true, message: `${type} atualizado com sucesso.` });
    } else {
        res.status(500).json({ error: 'Falha ao escrever no banco de dados.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`\n✅ Servidor NurseTec rodando em: http://localhost:${PORT}`);
    console.log(`📄 Banco de dados: ${DB_FILE}`);
    console.log(`🔑 API Key Padrão: ${API_KEY}\n`);
});