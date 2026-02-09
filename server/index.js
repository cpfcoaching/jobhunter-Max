import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { encryptData, decryptData, hashData } from './crypto.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// In-memory store for API keys (in production, use a database)
// Keys are stored encrypted
const apiKeyStore = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

/**
 * POST /api/keys/set
 * Store encrypted API keys securely
 * Body: { provider: 'openai' | 'deepseek', apiKey: string }
 */
app.post('/api/keys/set', (req, res) => {
    try {
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({ error: 'Provider and apiKey are required' });
        }

        if (!['openai', 'deepseek'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Validate API key format (basic check)
        if (apiKey.length < 10) {
            return res.status(400).json({ error: 'API key is too short' });
        }

        // Encrypt and store the API key
        const encrypted = encryptData(apiKey);
        apiKeyStore.set(provider, encrypted);

        res.json({ success: true, message: `${provider} API key stored securely` });
    } catch (error) {
        console.error('Error storing API key:', error);
        res.status(500).json({ error: 'Failed to store API key' });
    }
});

/**
 * GET /api/keys/check/:provider
 * Check if an API key is set for a provider (without returning the key)
 */
app.get('/api/keys/check/:provider', (req, res) => {
    try {
        const { provider } = req.params;

        if (!['openai', 'deepseek'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        const hasKey = apiKeyStore.has(provider);
        res.json({ hasKey, provider });
    } catch (error) {
        console.error('Error checking API key:', error);
        res.status(500).json({ error: 'Failed to check API key' });
    }
});

/**
 * POST /api/keys/delete/:provider
 * Delete an API key for a provider
 */
app.post('/api/keys/delete/:provider', (req, res) => {
    try {
        const { provider } = req.params;

        if (!['openai', 'deepseek'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        apiKeyStore.delete(provider);
        res.json({ success: true, message: `${provider} API key deleted` });
    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({ error: 'Failed to delete API key' });
    }
});

/**
 * POST /api/ai/generate
 * Proxy request to OpenAI or DeepSeek API
 * This keeps the actual API key on the server
 */
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { provider, message, model } = req.body;

        if (!provider || !message) {
            return res.status(400).json({ error: 'Provider and message are required' });
        }

        let apiKey;
        if (apiKeyStore.has(provider)) {
            const encrypted = apiKeyStore.get(provider);
            apiKey = decryptData(encrypted);
        } else {
            // Try to use environment variable as fallback
            if (provider === 'openai') {
                apiKey = process.env.OPENAI_API_KEY;
            } else if (provider === 'deepseek') {
                apiKey = process.env.DEEPSEEK_API_KEY;
            }
        }

        if (!apiKey) {
            return res.status(401).json({ error: `No API key configured for ${provider}` });
        }

        let response;
        
        if (provider === 'openai') {
            response = await callOpenAI(apiKey, message, model);
        } else if (provider === 'deepseek') {
            response = await callDeepSeek(apiKey, message, model);
        } else {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        res.json(response);
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

/**
 * Call OpenAI API
 */
async function callOpenAI(apiKey, message, model = 'gpt-3.5-turbo') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: message }],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        provider: 'openai',
        model,
        response: data.choices[0]?.message?.content || '',
        usage: data.usage,
    };
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(apiKey, message, model = 'deepseek-chat') {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: message }],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        provider: 'deepseek',
        model,
        response: data.choices[0]?.message?.content || '',
        usage: data.usage,
    };
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`🔒 Secure API server running on http://localhost:${PORT}`);
    console.log('IMPORTANT: Keep your .env file secret and never commit it to version control');
});
