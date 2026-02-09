import type { AiModel } from '../types/ai';

// Check if Ollama model is running
export async function checkIfOllamaModelIsRunning(modelName: string): Promise<{
    isRunning: boolean;
    runningModelName?: string;
    error?: string;
}> {
    try {
        const response = await fetch('http://localhost:11434/api/ps');
        if (!response.ok) {
            return {
                isRunning: false,
                error: 'No model is currently running. Please start Ollama first.',
            };
        }
        const data = await response.json();
        if (data.models && data.models.length > 0) {
            const runningModel = data.models.find((m: any) => m.name === modelName);
            if (runningModel) {
                return {
                    isRunning: true,
                    runningModelName: runningModel.name,
                };
            }
        }
        return {
            isRunning: false,
            error: 'Model is not currently running.',
        };
    } catch (error) {
        return {
            isRunning: false,
            error: 'Failed to connect to Ollama. Make sure it is running.',
        };
    }
}

// Fetch available Ollama models
export async function fetchOllamaModels(): Promise<string[]> {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            throw new Error('Failed to fetch Ollama models');
        }
        const data = await response.json();
        return data.models.map((model: any) => model.name);
    } catch (error) {
        console.error('Error fetching Ollama models:', error);
        return [];
    }
}

// Keep Ollama model alive
export async function keepOllamaModelAlive(modelName: string): Promise<void> {
    try {
        await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: '',
                keep_alive: '1h',
                stream: false,
            }),
        });
    } catch (error) {
        console.error('Error keeping model alive:', error);
    }
}

// Generate AI resume review
export async function generateResumeReview(
    resumeContent: string,
    aiModel: AiModel
): Promise<any> {
    try {
        if (aiModel.provider === 'ollama') {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: aiModel.model,
                    prompt: `You are an expert resume reviewer. Analyze the following resume and provide a detailed review in JSON format with the following structure:
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

Resume:
${resumeContent}`,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate resume review');
            }

            const data = await response.json();
            return JSON.parse(data.response);
        }

        throw new Error('Unsupported AI provider');
    } catch (error) {
        console.error('Error generating resume review:', error);
        throw error;
    }
}

// Generate AI job match
export async function generateJobMatch(
    resumeContent: string,
    jobDescription: string,
    aiModel: AiModel
): Promise<any> {
    try {
        if (aiModel.provider === 'ollama') {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: aiModel.model,
                    prompt: `You are an expert career advisor. Compare the following resume with the job description and provide a match analysis in JSON format:
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

Resume:
${resumeContent}

Job Description:
${jobDescription}`,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate job match');
            }

            const data = await response.json();
            return JSON.parse(data.response);
        }

        throw new Error('Unsupported AI provider');
    } catch (error) {
        console.error('Error generating job match:', error);
        throw error;
    }
}

// Model Management Functions

// List installed Ollama models
export async function listInstalledModels(): Promise<string[]> {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            throw new Error('Failed to fetch installed models');
        }
        const data = await response.json();
        return data.models.map((model: any) => model.name.split(':')[0]);
    } catch (error) {
        console.error('Error listing installed models:', error);
        return [];
    }
}

// Download Ollama model
export async function downloadOllamaModel(
    modelName: string,
    onProgress?: (progress: number) => void
): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:11434/api/pull', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: modelName,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to download model');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        if (data.total && data.completed) {
                            const progress = (data.completed / data.total) * 100;
                            onProgress?.(Math.round(progress));
                        }
                        if (data.status === 'success') {
                            return true;
                        }
                    } catch (e) {
                        // Ignore JSON parse errors
                    }
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Error downloading model:', error);
        return false;
    }
}

// Delete Ollama model
export async function deleteOllamaModel(modelName: string): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:11434/api/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: modelName,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting model:', error);
        return false;
    }
}

// Check if Ollama is running
export async function checkOllamaStatus(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Get model size in human-readable format
export function formatModelSize(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
        return `${gb.toFixed(1)}GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)}MB`;
}
