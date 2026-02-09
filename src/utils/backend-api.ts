// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Store API key securely on the backend
 */
export async function storeApiKey(provider: 'openai' | 'deepseek', apiKey: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/keys/set`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, apiKey }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to store API key');
    }
}

/**
 * Check if an API key is configured (doesn't return the key)
 */
export async function checkApiKey(provider: 'openai' | 'deepseek'): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/keys/check/${provider}`);
    if (!response.ok) {
        return false;
    }
    const data = await response.json();
    return data.hasKey;
}

/**
 * Delete an API key from the backend
 */
export async function deleteApiKey(provider: 'openai' | 'deepseek'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/keys/delete/${provider}`, {
        method: 'POST',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete API key');
    }
}

/**
 * Send a message to be processed by the backend using the stored API key
 */
export async function generateAiResponse(
    provider: 'openai' | 'deepseek',
    message: string,
    model?: string
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, message, model }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate AI response');
    }

    const data = await response.json();
    return data.response;
}
