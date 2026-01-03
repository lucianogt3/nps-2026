import { AppConfig } from './types';

// Função genérica para buscar dados do servidor (GET)
export const fetchFromServer = async (url: string, apiKey?: string) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            }
        });

        if (!response.ok) {
            // Se falhar, não jogamos erro crítico para não travar o app, apenas retornamos null
            // para que o app use o localStorage
            console.warn(`Aviso do Servidor: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Falha ao buscar dados do servidor (Backend Offline?):", error);
        return null;
    }
};

// Função genérica para enviar dados ao servidor (POST)
export const sendToServer = async (url: string, type: string, data: any, apiKey?: string) => {
    try {
        const payload = {
            type: type, // ex: 'sectors', 'responses', 'config'
            timestamp: new Date().toISOString(),
            data: data
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar no servidor: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Falha ao sincronizar ${type} com o servidor:`, error);
        return null;
    }
};