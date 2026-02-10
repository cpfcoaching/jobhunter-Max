import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createRequire } from 'module';
import { encryptData, decryptData, hashData } from './crypto.js';

// Import CommonJS modules
const require = createRequire(import.meta.url);
const { PdfReader } = require('pdfreader');
const mammoth = require('mammoth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

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
app.post('/api/keys/set', async (req, res) => {
    try {
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({ error: 'Provider and apiKey are required' });
        }

        if (!['openai', 'deepseek', 'gemini', 'claude', 'cohere'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Validate API key format (basic check)
        if (apiKey.length < 10) {
            return res.status(400).json({ error: 'API key is too short' });
        }

        // Encrypt and store the API key
        const encrypted = encryptData(apiKey);
        apiKeyStore.set(provider, encrypted);

        // Debug: List models if Gemini to troubleshoot "not found" errors
        if (provider === 'gemini') {
            try {
                console.log('Attempting to list Gemini models for debugging...');
                const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const listData = await listResp.json();
                console.log('--- GEMINI MODELS AVAILABLE ---');
                if (listData.models) {
                    listData.models.forEach(m => console.log(m.name));
                } else {
                    console.log('Error listing models:', JSON.stringify(listData, null, 2));
                }
                console.log('-------------------------------');
            } catch (e) {
                console.error('Debug fetch failed:', e);
            }
        }

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

        if (!['openai', 'deepseek', 'gemini', 'claude', 'cohere'].includes(provider)) {
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

        if (!['openai', 'deepseek', 'gemini', 'claude', 'cohere'].includes(provider)) {
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
            } else if (provider === 'gemini') {
                apiKey = process.env.GEMINI_API_KEY;
            } else if (provider === 'claude') {
                apiKey = process.env.CLAUDE_API_KEY;
            } else if (provider === 'cohere') {
                apiKey = process.env.COHERE_API_KEY;
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
        } else if (provider === 'gemini') {
            response = await callGemini(apiKey, message, model);
        } else if (provider === 'claude') {
            response = await callClaude(apiKey, message, model);
        } else if (provider === 'cohere') {
            response = await callCohere(apiKey, message, model);
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

/**
 * Call Google Gemini API
 */
async function callGemini(apiKey, prompt, model = 'gemini-1.5-flash') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        provider: 'gemini',
        model,
        response: data.candidates[0]?.content?.parts[0]?.text || '',
        usage: data.usageMetadata,
    };
}

/**
 * Call Anthropic Claude API
 */
async function callClaude(apiKey, message, model = 'claude-3-haiku-20240307') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            max_tokens: 2048,
            messages: [{ role: 'user', content: message }],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        provider: 'claude',
        model,
        response: data.content[0]?.text || '',
        usage: data.usage,
    };
}

/**
 * Call Cohere API
 */
async function callCohere(apiKey, message, model = 'command-light') {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            prompt: message,
            max_tokens: 2048,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cohere API error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
        provider: 'cohere',
        model,
        response: data.generations[0]?.text || '',
        usage: { tokens: data.meta?.billed_units?.output_tokens },
    };
}

// ============================================
// FILE UPLOAD ENDPOINTS
// ============================================

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'));
        }
    }
});

/**
 * Helper function to extract text from uploaded file
 */
async function extractTextFromFile(file) {
    const { buffer, mimetype, originalname } = file;

    try {
        if (mimetype === 'application/pdf') {
            // Parse PDF using pdfreader
            return new Promise((resolve, reject) => {
                const pdfReader = new PdfReader();
                let fullText = '';

                pdfReader.parseBuffer(buffer, (err, item) => {
                    if (err) {
                        reject(err);
                    } else if (!item) {
                        // End of file
                        resolve(fullText.trim());
                    } else if (item.text) {
                        // Text item
                        fullText += item.text + ' ';
                    }
                });
            });
        } else if (mimetype === 'text/plain') {
            // Plain text
            return buffer.toString('utf-8');
        } else if (mimetype === 'application/msword' ||
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Parse DOC/DOCX
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error extracting text from file:', error);
        throw new Error(`Failed to parse ${originalname}: ${error.message}`);
    }
}

/**
 * POST /api/resume/upload
 * Upload and parse resume file (PDF, TXT, DOC, DOCX)
 */
app.post('/api/resume/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const text = await extractTextFromFile(req.file);

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from file' });
        }

        res.json({
            success: true,
            filename: req.file.originalname,
            text: text,
            size: req.file.size
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to process resume file' });
    }
});

/**
 * POST /api/job-description/upload
 * Upload and parse job description file (PDF, TXT, DOC, DOCX)
 */
app.post('/api/job-description/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const text = await extractTextFromFile(req.file);

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from file' });
        }

        res.json({
            success: true,
            filename: req.file.originalname,
            text: text,
            size: req.file.size
        });
    } catch (error) {
        console.error('Job description upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to process job description file' });
    }
});

// --- AI Provider Helper Functions (Backend Routing) ---

async function callOllama(model, prompt) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        throw new Error(`Failed to call Ollama: ${error.message}`);
    }
}

async function callAIProvider(provider, model, prompt) {
    console.log(`Calling AI Provider: ${provider}, Model: ${model}`);

    if (provider === 'ollama') {
        return await callOllama(model, prompt);
    }

    // Retrieve API key with env var fallback
    let apiKey;
    if (apiKeyStore.has(provider)) {
        const encrypted = apiKeyStore.get(provider);
        apiKey = decryptData(encrypted);
    } else {
        if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY;
        else if (provider === 'deepseek') apiKey = process.env.DEEPSEEK_API_KEY;
        else if (provider === 'gemini') apiKey = process.env.GEMINI_API_KEY;
        else if (provider === 'claude') apiKey = process.env.CLAUDE_API_KEY;
        else if (provider === 'cohere') apiKey = process.env.COHERE_API_KEY;
    }

    if (!apiKey) {
        throw new Error(`API key for ${provider} not configured. Please go to Settings to add it.`);
    }

    let result;
    // Call existing helper functions (apiKey, message, model)
    switch (provider) {
        case 'openai':
            result = await callOpenAI(apiKey, prompt, model);
            break;
        case 'deepseek':
            result = await callDeepSeek(apiKey, prompt, model);
            break;
        case 'gemini':
            result = await callGemini(apiKey, prompt, model);
            break;
        case 'claude':
            result = await callClaude(apiKey, prompt, model);
            break;
        case 'cohere':
            result = await callCohere(apiKey, prompt, model);
            break;
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }

    return result.response;
}

// ------------------------------

/**
 * POST /api/job-description/from-url
 * Fetch job description from URL
 */
app.post('/api/job-description/from-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Fetch the URL
        const response = await fetch(validUrl.href, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobHunterMax/1.0)'
            },
            timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Failed to fetch URL: ${response.statusText}`
            });
        }

        const html = await response.text();

        // Basic HTML text extraction (remove tags)
        const text = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
            .replace(/<[^>]+>/g, ' ') // Remove HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        if (!text || text.length === 0) {
            return res.status(400).json({ error: 'Could not extract text from URL' });
        }

        res.json({
            success: true,
            url: validUrl.href,
            text: text
        });
    } catch (error) {
        console.error('URL fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch job description from URL' });
    }
});

// Helper to clean JSON string from Markdown code blocks
function cleanJsonString(str) {
    if (!str) return '';
    let cleaned = str.trim();
    // Remove ```json ... ``` or just ``` ... ```
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned;
}

// AI Resume Review Endpoint
app.post('/api/ai/resume-review', async (req, res) => {
    try {
        const { resumeContent, provider, model } = req.body;

        if (!resumeContent || !provider || !model) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const prompt = `You are an expert resume reviewer. Analyze the following resume and provide a detailed review in JSON format with the following structure:
{
  "overallScore": <number 0-100>,
  "summary": "<brief summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>"],
  "formatting": {
    "score": <number 0-100>,
    "comments": ["<comment 1>"]
  },
  "content": {
    "score": <number 0-100>,
    "comments": ["<comment 1>"]
  },
  "keywords": {
    "score": <number 0-100>,
    "missing": ["<keyword 1>"],
    "present": ["<keyword 1>"]
  }
}

Do not include any explanation, just the JSON.

Resume:
${resumeContent}`;

        const result = await callAIProvider(provider, model, prompt);

        // Parse JSON response
        let review;
        try {
            const cleanedResult = cleanJsonString(result);
            review = JSON.parse(cleanedResult);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.log('Raw Result:', result);
            // If parsing fails, try to return a structured partial failure or raw text
            review = {
                overallScore: 0,
                summary: "Could not parse AI response. Raw output: " + result,
                strengths: [],
                weaknesses: []
            };
        }

        res.json({ review });
    } catch (error) {
        console.error('Resume review error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate resume review' });
    }
});

// AI Job Match Endpoint
app.post('/api/ai/job-match', async (req, res) => {
    try {
        const { resumeContent, jobDescription, provider, model } = req.body;

        if (!resumeContent || !jobDescription || !provider || !model) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const prompt = `You are an expert career advisor. Compare the following resume with the job description and provide a match analysis in JSON format:
{
  "overallMatch": <number 0-100>,
  "summary": "<brief summary>",
  "skillsMatch": {
    "score": <number 0-100>,
    "matched": ["<skill 1>"],
    "missing": ["<skill 1>"]
  },
  "experienceMatch": {
    "score": <number 0-100>,
    "analysis": "<analysis>"
  },
  "recommendations": ["<recommendation 1>"],
  "tailoringTips": ["<tip 1>"]
}

Do not include any explanation, just the JSON.

Resume:
${resumeContent}

Job Description:
${jobDescription}`;

        const result = await callAIProvider(provider, model, prompt);

        // Parse JSON response
        let match;
        try {
            const cleanedResult = cleanJsonString(result);
            match = JSON.parse(cleanedResult);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.log('Raw Result:', result);
            // If parsing fails, return raw response
            match = {
                overallMatch: 0,
                summary: "Could not parse AI response. Raw output: " + result,
                tailoringTips: []
            };
        }

        res.json({ match });
    } catch (error) {
        console.error('Job match error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate job match' });
    }
});

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
