import type { JobSearchFilters, JobResult, RecommendJobsResponse, ScoredJobResult } from '../types/jobSearch';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Store API key securely on the backend
 */
export async function storeApiKey(provider: 'openai' | 'deepseek' | 'gemini' | 'claude' | 'cohere', apiKey: string): Promise<void> {
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
export async function checkApiKey(provider: 'openai' | 'deepseek' | 'gemini' | 'claude' | 'cohere'): Promise<boolean> {
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
export async function deleteApiKey(provider: 'openai' | 'deepseek' | 'gemini' | 'claude' | 'cohere'): Promise<void> {
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
    provider: 'openai' | 'deepseek' | 'gemini' | 'claude' | 'cohere',
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

/**
 * Search for jobs using the JobSpy backend integration
 */
export async function searchJobs(
    filters: JobSearchFilters,
    resumeContext?: string
): Promise<JobResult[]> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, resumeContext }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search jobs');
    }

    const data = await response.json();
    return data.jobs as JobResult[];
}

/**
 * Use AI to recommend job titles/filters based on a resume
 */
export async function recommendJobsFromResume(
    resumeContent: string,
    provider: string,
    model: string
): Promise<RecommendJobsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/recommend-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, provider, model }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get job recommendations');
    }

    const data = await response.json();
    return data as RecommendJobsResponse;
}

// ──────────────────────────────────────────────────────────────────────────────
// Integration 2: ever-jobs/ever-jobs — 160+ source aggregator
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Search jobs via a self-hosted ever-jobs REST API.
 * Requires EVER_JOBS_API_URL to be configured on the backend.
 */
export async function searchEverJobs(
    filters: JobSearchFilters
): Promise<JobResult[]> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/search-ever`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search ever-jobs');
    }

    const data = await response.json();
    return data.jobs as JobResult[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Integration 3: Find-Me-Job — AI scoring pipeline
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Score a list of job results against a resume (0-100 each).
 * High-scoring jobs (above server-configured threshold) will include
 * a generated cover letter.
 */
export async function scoreJobsWithAI(
    jobs: JobResult[],
    resumeContent: string,
    provider: string,
    model: string,
    scoreThreshold?: number
): Promise<ScoredJobResult[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/score-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, resumeContent, provider, model, scoreThreshold }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to score jobs');
    }

    const data = await response.json();
    return data.scoredJobs as ScoredJobResult[];
}

/**
 * Generate a cover letter for a single job result against a resume.
 */
export async function generateCoverLetter(
    job: JobResult,
    resumeContent: string,
    provider: string,
    model: string
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/ai/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, resumeContent, provider, model }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate cover letter');
    }

    const data = await response.json();
    return data.coverLetter as string;
}
