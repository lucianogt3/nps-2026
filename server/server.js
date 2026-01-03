const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { Mutex } = require('async-mutex');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'db.json');
const API_KEY = process.env.API_KEY || 'segredo-123';
const mutex = new Mutex();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Função para ler o banco de dados
const readDB = async () => {
    try {
        await fs.access(DB_FILE);
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const initialData = { 
                config: {}, 
                users: [], 
                sectors: [], 
                categories: [], 
                responses: [], 
                actionPlans: [] 
            };
            await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        console.error('Erro ao ler DB:', error);
        throw error;
    }
};

// Função para salvar no banco de dados
const writeDB = async (data) => {
    try {
        // Backup do arquivo atual antes de escrever
        const backupFile = `${DB_FILE}.backup.${Date.now()}`;
        try {
            await fs.copyFile(DB_FILE, backupFile);
        } catch (backupError) {
            console.warn('Não foi possível criar backup:', backupError);
        }

        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar DB:', error);
        throw error;
    }
};

// Middleware de autenticação
const authenticate = (req, res, next) => {
    const clientKey = req.headers['x-api-key'];
    if (clientKey !== API_KEY) {
        console.log(`[AUTH FAIL] Tentativa de acesso com chave inválida: ${clientKey}`);
        return res.status(403).json({ error: 'Chave de API inválida' });
    }
    next();
};

// Aplicar autenticação em todas as rotas da API
app.use('/api', authenticate);

// Rota de status
app.get('/', (req, res) => {
    res.send('NurseTec API Server Online 🚀 (Porta ' + PORT + ')');
});

// Rota GET: Retorna todos os dados para o Frontend sincronizar ao iniciar
app.get('/api/sync', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ler banco de dados' });
    }
});

// Rota POST: Recebe atualizações do Frontend
app.post('/api/sync', async (req, res) => {
    const { type, data } = req.body;
    
    if (!type || data === undefined) {
        return res.status(400).json({ error: 'Payload inválido' });
    }

    // Validação básica do tipo
    const validTypes = ['config', 'users', 'sectors', 'categories', 'responses', 'actionPlans'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Tipo inválido. Tipos válidos: ${validTypes.join(', ')}` });
    }

    console.log(`[SYNC] Recebido update para: ${type}`);
    
    // Usar mutex para garantir que apenas uma escrita ocorra por vez
    const release = await mutex.acquire();
    try {
        const db = await readDB();
        db[type] = data;
        await writeDB(db);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gravar no disco' });
    } finally {
        release();
    }
});

app.listen(PORT, () => {
    console.log(`\n✅ Servidor Backend rodando em: http://localhost:${PORT}`);
    console.log(`📂 Arquivo de dados: ${DB_FILE}`);
});