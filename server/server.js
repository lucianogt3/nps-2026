const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000; // Porta alterada para 4000
const DB_FILE = path.join(__dirname, 'db.json');
const API_KEY = 'segredo-123'; // Chave simples de segurança configurada no Frontend

// Middleware
app.use(cors()); // Permite conexões de qualquer origem (útil para desenvolvimento)
app.use(bodyParser.json({ limit: '50mb' })); // Limite aumentado para grandes cargas de dados

// Função para ler o banco de dados
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = { 
                config: {}, 
                users: [], 
                sectors: [], 
                categories: [], 
                responses: [], 
                actionPlans: [] 
            };
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

// Função para salvar no banco de dados
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar DB:', error);
        return false;
    }
};

// Rota de status
app.get('/', (req, res) => {
    res.send('NurseTec API Server Online 🚀 (Porta 4000)');
});

// Rota GET: Retorna todos os dados para o Frontend sincronizar ao iniciar
app.get('/api/sync', (req, res) => {
    const clientKey = req.headers['x-api-key'];
    // Verificação opcional de segurança
    if (clientKey && clientKey !== API_KEY) {
        console.log(`[AUTH FAIL] Tentativa de acesso com chave inválida: ${clientKey}`);
        return res.status(403).json({ error: 'Chave de API inválida' });
    }

    const db = readDB();
    res.json(db);
});

// Rota POST: Recebe atualizações do Frontend
app.post('/api/sync', (req, res) => {
    const clientKey = req.headers['x-api-key'];
    if (clientKey && clientKey !== API_KEY) {
        return res.status(403).json({ error: 'Chave de API inválida' });
    }

    const { type, data } = req.body;
    
    if (!type || data === undefined) {
        return res.status(400).json({ error: 'Payload inválido' });
    }

    console.log(`[SYNC] Recebido update para: ${type}`);
    
    const db = readDB();
    db[type] = data; // Atualiza a chave específica (ex: db.users = novosUsuarios)

    if (writeDB(db)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Erro ao gravar no disco' });
    }
});

app.listen(PORT, () => {
    console.log(`\n✅ Servidor Backend rodando em: http://localhost:${PORT}`);
    console.log(`📂 Arquivo de dados: ${DB_FILE}`);
});