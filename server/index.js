import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createRequire } from 'module';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { encryptData, decryptData, hashData } from './crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const ALLOWED_GEMINI_MODELS = new Set([
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
]);

async function callGemini(apiKey, prompt, model = 'gemini-1.5-flash') {
    if (!ALLOWED_GEMINI_MODELS.has(model)) {
        throw new Error('Invalid Gemini model');
    }

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

// ============================================
// JOB SEARCH ENDPOINT (JobSpy integration)
// ============================================

/**
 * Map a raw job object from the rainmanjam/jobspy-api HTTP response into the
 * same shape used by the local Python script so the frontend stays uniform.
 */
function normalizeJobSpyApiJob(job, index) {
    const salaryParts = [];
    if (job.min_amount != null) salaryParts.push(`$${Number(job.min_amount).toLocaleString()}`);
    if (job.max_amount != null) salaryParts.push(`$${Number(job.max_amount).toLocaleString()}`);
    return {
        id: String(job.id || job.job_url || index),
        title: String(job.title || ''),
        company: String(job.company || ''),
        location: String(job.location || ''),
        salary: salaryParts.length ? salaryParts.join(' - ') : null,
        url: job.job_url || null,
        source: String(job.site || ''),
        datePosted: job.date_posted ? String(job.date_posted) : null,
        description: job.description ? String(job.description).slice(0, 500) : null,
    };
}

/**
 * POST /api/jobs/search
 * Search jobs using JobSpy.
 *
 * When JOBSPY_API_URL is set the request is proxied to the external
 * rainmanjam/jobspy-api Docker service.  Otherwise the local Python
 * script is spawned (existing behaviour).
 *
 * Body: { filters: JobSearchFilters, resumeContext?: string }
 */
app.post('/api/jobs/search', async (req, res) => {
    try {
        const { filters } = req.body;

        if (!filters) {
            return res.status(400).json({ error: 'filters are required' });
        }

        // ── Integration 1: rainmanjam/jobspy-api ──────────────────────────────
        const jobspyApiUrl = process.env.JOBSPY_API_URL;
        if (jobspyApiUrl) {
            const endpoint = `${jobspyApiUrl.replace(/\/$/, '')}/api/v1/jobs/search`;
            const body = {
                site_name: filters.jobBoards || ['linkedin', 'indeed'],
                search_term: filters.jobTitle || '',
                location: filters.location || '',
                results_wanted: Number(filters.resultsWanted || 20),
                is_remote: Boolean(filters.remote),
                ...(filters.salaryMin != null ? { min_amount: filters.salaryMin } : {}),
                ...(filters.salaryMax != null ? { max_amount: filters.salaryMax } : {}),
                ...(filters.company ? { company: filters.company } : {}),
            };

            const apiRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!apiRes.ok) {
                const errText = await apiRes.text();
                throw new Error(`jobspy-api returned ${apiRes.status}: ${errText}`);
            }

            const data = await apiRes.json();
            // The API returns { jobs: [...] } or a plain array
            const raw = Array.isArray(data) ? data : (data.jobs || []);
            const jobs = raw.map((j, i) => normalizeJobSpyApiJob(j, i));
            return res.json({ jobs });
        }

        // ── Fallback: local Python script ─────────────────────────────────────
        const scriptPath = path.join(__dirname, 'jobspy_search.py');
        const filtersJson = JSON.stringify(filters);
        // Allow overriding the Python executable (e.g. 'python' on Windows)
        const pythonExec = process.env.PYTHON_EXECUTABLE || 'python3';

        const jobs = await new Promise((resolve, reject) => {
            const proc = spawn(pythonExec, [scriptPath, filtersJson], {
                env: { ...process.env },
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (chunk) => { stdout += chunk; });
            proc.stderr.on('data', (chunk) => { stderr += chunk; });

            proc.on('close', (code) => {
                if (code !== 0) {
                    console.error('JobSpy stderr:', stderr);
                    // Try to return a structured error from the script
                    try {
                        const parsed = JSON.parse(stdout);
                        if (parsed.error) {
                            return reject(new Error(parsed.error));
                        }
                    } catch (_) { /* ignore */ }
                    return reject(new Error(`JobSpy process exited with code ${code}: ${stderr}`));
                }

                try {
                    const parsed = JSON.parse(stdout);
                    // Check if the script returned an error object
                    if (parsed && parsed.error) {
                        return reject(new Error(parsed.error));
                    }
                    resolve(Array.isArray(parsed) ? parsed : []);
                } catch (e) {
                    reject(new Error(`Failed to parse JobSpy output: ${e.message}`));
                }
            });

            proc.on('error', (err) => {
                if (err.code === 'ENOENT') {
                    reject(new Error(`Python executable '${pythonExec}' not found. Install Python 3.8+ or set the PYTHON_EXECUTABLE environment variable.`));
                } else {
                    reject(err);
                }
            });
        });

        res.json({ jobs });
    } catch (error) {
        console.error('Job search error:', error);
        res.status(500).json({ error: error.message || 'Failed to search jobs' });
    }
});

// ============================================
// EVER-JOBS SEARCH ENDPOINT
// (Integration 2: ever-jobs/ever-jobs — 160+ sources)
// ============================================

/**
 * Map a raw job from the ever-jobs REST API response to the shared JobResult
 * shape used across the application.
 *
 * ever-jobs normalises results across all 160+ sources into a common schema:
 *   { id, title, description, company: { name }, location, salary, url,
 *     source, postedAt, isRemote, ... }
 * We defensively handle both flat and nested shapes.
 */
function normalizeEverJobsJob(job, index) {
    const companyName =
        (job.company && typeof job.company === 'object' ? job.company.name : job.company) ||
        job.companyName || '';

    const salaryParts = [];
    const salaryMin = job.salaryMin ?? job.salary?.min;
    const salaryMax = job.salaryMax ?? job.salary?.max;
    if (salaryMin != null) salaryParts.push(`$${Number(salaryMin).toLocaleString()}`);
    if (salaryMax != null) salaryParts.push(`$${Number(salaryMax).toLocaleString()}`);

    const datePosted = job.postedAt || job.datePosted || job.createdAt || null;

    return {
        id: String(job.id || job.url || index),
        title: String(job.title || ''),
        company: String(companyName),
        location: String(job.location || ''),
        salary: salaryParts.length ? salaryParts.join(' - ') : (job.salary && typeof job.salary === 'string' ? job.salary : null),
        url: job.url || job.applyUrl || null,
        source: String(job.source || 'ever-jobs'),
        datePosted: datePosted ? String(datePosted) : null,
        description: job.description ? String(job.description).slice(0, 500) : null,
    };
}

/**
 * POST /api/jobs/search-ever
 * Search jobs via a self-hosted ever-jobs NestJS REST API.
 * Requires EVER_JOBS_API_URL environment variable to be set.
 *
 * ever-jobs REST API search endpoint:
 *   GET /api/jobs?q=<query>&location=<location>&limit=<n>&remote=<bool>
 * Body: { filters: JobSearchFilters }
 */
app.post('/api/jobs/search-ever', async (req, res) => {
    try {
        const { filters } = req.body;

        if (!filters) {
            return res.status(400).json({ error: 'filters are required' });
        }

        const everJobsUrl = process.env.EVER_JOBS_API_URL;
        if (!everJobsUrl) {
            return res.status(503).json({
                error: 'EVER_JOBS_API_URL is not configured. ' +
                    'Set this environment variable to the URL of your self-hosted ever-jobs service. ' +
                    'See https://github.com/ever-jobs/ever-jobs for setup instructions.',
            });
        }

        const params = new URLSearchParams({
            q: filters.jobTitle || '',
            ...(filters.location ? { location: filters.location } : {}),
            limit: String(Number(filters.resultsWanted || 20)),
            ...(filters.remote ? { remote: 'true' } : {}),
            ...(filters.company ? { company: filters.company } : {}),
        });

        const endpoint = `${everJobsUrl.replace(/\/$/, '')}/api/jobs?${params.toString()}`;

        const apiRes = await fetch(endpoint, {
            headers: { 'Accept': 'application/json' },
        });

        if (!apiRes.ok) {
            const errText = await apiRes.text();
            throw new Error(`ever-jobs API returned ${apiRes.status}: ${errText}`);
        }

        const data = await apiRes.json();
        // ever-jobs may return { items: [...], total } or a plain array
        const raw = Array.isArray(data) ? data : (data.items || data.jobs || []);
        const jobs = raw.map((j, i) => normalizeEverJobsJob(j, i));

        res.json({ jobs });
    } catch (error) {
        console.error('ever-jobs search error:', error);
        res.status(500).json({ error: error.message || 'Failed to search ever-jobs' });
    }
});

// ============================================
// AI JOB RECOMMENDATION ENDPOINT
// ============================================

/**
 * POST /api/ai/recommend-jobs
 * Use AI to extract job titles, keywords, and suggested filters from a resume.
 * Body: { resumeContent, provider, model }
 */
app.post('/api/ai/recommend-jobs', async (req, res) => {
    try {
        const { resumeContent, provider, model } = req.body;

        if (!resumeContent || !provider || !model) {
            return res.status(400).json({ error: 'resumeContent, provider, and model are required' });
        }

        const prompt = `You are an expert career advisor. Analyze the following resume and respond ONLY with a JSON object in this exact format:
{
  "jobTitles": ["<job title 1>", "<job title 2>", "<job title 3>"],
  "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "suggestedFilters": {
    "jobTitle": "<best single job title for search>",
    "location": "<city or region if mentioned, otherwise empty string>",
    "salaryMin": <number or null>,
    "salaryMax": <number or null>,
    "remote": <true or false>
  }
}

Rules:
- jobTitles: 3-5 realistic job titles this person should target
- keywords: 5-10 important skills/technologies from the resume
- suggestedFilters.jobTitle: the single best job title to use as the primary search term
- suggestedFilters.salaryMin/salaryMax: estimate from experience level (null if unclear)
- suggestedFilters.remote: true only if remote work is mentioned in the resume
- Do NOT include any explanation, only the JSON object.

Resume:
${resumeContent}`;

        const result = await callAIProvider(provider, model, prompt);

        let recommendation;
        try {
            const cleaned = cleanJsonString(result);
            recommendation = JSON.parse(cleaned);
        } catch (e) {
            console.error('JSON parse error for recommend-jobs:', e);
            console.log('Raw AI output:', result);
            recommendation = {
                jobTitles: [],
                keywords: [],
                suggestedFilters: { jobTitle: '' },
            };
        }

        res.json(recommendation);
    } catch (error) {
        console.error('Recommend jobs error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate job recommendations' });
    }
});

// ============================================
// FIND-ME-JOB SCORING PIPELINE
// (Integration 3: MohamedMamdouh18/Find-Me-Job)
// ============================================

/**
 * Build a compact job description for the scoring prompt.
 * We trim the description to keep the prompt within model context limits.
 */
function buildJobSnippet(job) {
    const parts = [
        `Title: ${job.title || 'Unknown'}`,
        `Company: ${job.company || 'Unknown'}`,
        `Location: ${job.location || 'Unknown'}`,
    ];
    if (job.salary) parts.push(`Salary: ${job.salary}`);
    if (job.description) parts.push(`Description:\n${job.description.slice(0, 800)}`);
    return parts.join('\n');
}

/**
 * POST /api/ai/score-jobs
 * Score each job in the list against the provided resume (Find-Me-Job pipeline).
 *
 * Scoring rules (adapted from MohamedMamdouh18/Find-Me-Job):
 *   - Score 0-100 based on skills match, experience match, and role alignment
 *   - Experience gaps of 1-2 years receive a minor penalty
 *   - Gaps of 3+ years result in a score of 0
 *   - Jobs at or above scoreThreshold receive an AI-generated cover letter
 *
 * Body: { jobs, resumeContent, provider, model, scoreThreshold? }
 */
app.post('/api/ai/score-jobs', async (req, res) => {
    try {
        const { jobs, resumeContent, provider, model, scoreThreshold } = req.body;

        if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
            return res.status(400).json({ error: 'jobs array is required and must not be empty' });
        }
        if (!resumeContent || !provider || !model) {
            return res.status(400).json({ error: 'resumeContent, provider, and model are required' });
        }

        const threshold = scoreThreshold != null
            ? Number(scoreThreshold)
            : Number(process.env.AI_SCORE_THRESHOLD || 60);

        const scoredJobs = [];

        for (const job of jobs) {
            const jobSnippet = buildJobSnippet(job);

            const scorePrompt = `You are an expert career advisor. Score how well this candidate's resume matches the job posting on a scale of 0 to 100.

Scoring rules:
- Base the score on: required skills overlap, years of experience alignment, role/industry fit
- Experience gap of 1-2 years below requirement: deduct 10-20 points
- Experience gap of 3+ years below requirement: score must be 0
- A perfect match is 100; completely unrelated is 0

Respond ONLY with a JSON object in this exact format (no explanation):
{
  "score": <integer 0-100>,
  "reasoning": "<one sentence summary of why>"
}

JOB POSTING:
${jobSnippet}

RESUME:
${resumeContent.slice(0, 3000)}`;

            let score = 0;
            let reasoning = '';
            try {
                const raw = await callAIProvider(provider, model, scorePrompt);
                const parsed = JSON.parse(cleanJsonString(raw));
                score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
                reasoning = parsed.reasoning || '';
            } catch (e) {
                console.error(`Score parse error for job "${job.title}":`, e);
                score = 0;
                reasoning = 'Could not parse AI scoring response.';
            }

            const scored = { ...job, matchScore: score, matchReasoning: reasoning };

            // Generate cover letter for high-scoring matches
            if (score >= threshold) {
                const clPrompt = `You are an expert career coach. Write a concise, professional cover letter for the following job application. Tailor it to the job requirements and highlight the candidate's most relevant skills and experience.

JOB POSTING:
${jobSnippet}

CANDIDATE RESUME:
${resumeContent.slice(0, 3000)}

Guidelines:
- 3-4 short paragraphs
- Opening: express enthusiasm and state the role
- Middle: highlight 2-3 specific achievements that map to the job's requirements
- Closing: call to action
- Professional but engaging tone
- Do NOT use generic filler phrases`;

                try {
                    const coverLetter = await callAIProvider(provider, model, clPrompt);
                    scored.coverLetter = coverLetter.trim();
                } catch (e) {
                    console.error(`Cover letter error for job "${job.title}":`, e);
                    scored.coverLetter = null;
                }
            }

            scoredJobs.push(scored);
        }

        res.json({ scoredJobs });
    } catch (error) {
        console.error('Score jobs error:', error);
        res.status(500).json({ error: error.message || 'Failed to score jobs' });
    }
});

/**
 * POST /api/ai/cover-letter
 * Generate a cover letter for a single job on demand.
 * Body: { job, resumeContent, provider, model }
 */
app.post('/api/ai/cover-letter', async (req, res) => {
    try {
        const { job, resumeContent, provider, model } = req.body;

        if (!job || !resumeContent || !provider || !model) {
            return res.status(400).json({ error: 'job, resumeContent, provider, and model are required' });
        }

        const jobSnippet = buildJobSnippet(job);

        const prompt = `You are an expert career coach. Write a concise, professional cover letter for the following job application. Tailor it to the job requirements and highlight the candidate's most relevant skills and experience.

JOB POSTING:
${jobSnippet}

CANDIDATE RESUME:
${resumeContent.slice(0, 3000)}

Guidelines:
- 3-4 short paragraphs
- Opening: express enthusiasm and state the role
- Middle: highlight 2-3 specific achievements that map to the job's requirements
- Closing: call to action
- Professional but engaging tone
- Do NOT use generic filler phrases`;

        const coverLetter = await callAIProvider(provider, model, prompt);

        res.json({ coverLetter: coverLetter.trim() });
    } catch (error) {
        console.error('Cover letter error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
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
