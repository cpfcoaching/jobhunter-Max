const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ADMIN_TOKEN_STORAGE_KEY = 'jobhunter_admin_token';

export type LogContext = Record<string, unknown>;

export function getStoredAdminToken(): string {
    return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
}

export function setStoredAdminToken(token: string): void {
    const trimmed = token.trim();
    if (trimmed) {
        sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, trimmed);
    } else {
        sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
}

export function clearStoredAdminToken(): void {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

function getAdminHeaders(): HeadersInit {
    const token = getStoredAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const data = await response.json() as { error?: string };
        return data.error || fallback;
    } catch {
        return fallback;
    }
}

function getScreenshotFilename(screenshotUrl: string): string {
    const pathPart = screenshotUrl.startsWith('http')
        ? new URL(screenshotUrl).pathname
        : screenshotUrl;
    const filename = pathPart.split('/').pop();

    if (!filename) {
        throw new Error('Invalid screenshot URL');
    }

    return filename;
}

export interface BugReport {
    id: string;
    timestamp: string;
    feedback: string;
    expectations: string;
    screenshotUrl: string | null;
    status: 'open' | 'in_progress' | 'resolved';
}

export interface FeatureRequest {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'declined';
}

export interface ApiErrorLog {
    id: string;
    timestamp: string;
    source: 'client' | 'server';
    endpoint: string;
    errorMessage: string;
    stack: string;
    context: LogContext;
}

export interface SecurityEventLog {
    id: string;
    timestamp: string;
    eventType: string;
    description: string;
    context: LogContext;
}

/**
 * Submit bug report to backend
 */
export async function submitBugReport(
    feedback: string,
    expectations: string,
    screenshotBase64: string | null
): Promise<BugReport> {
    const response = await fetch(`${API_BASE_URL}/api/feedback/bug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, expectations, screenshot: screenshotBase64 }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit bug report');
    }

    const data = await response.json();
    return data.bug as BugReport;
}

/**
 * Submit feature request to backend
 */
export async function submitFeatureRequest(
    title: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high'
): Promise<FeatureRequest> {
    const response = await fetch(`${API_BASE_URL}/api/feedback/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, priority }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feature request');
    }

    const data = await response.json();
    return data.feature as FeatureRequest;
}

/**
 * Report client error to backend
 */
export async function reportClientError(
    endpoint: string,
    errorMessage: string,
    stack?: string,
    context?: LogContext
): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/api/logs/error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, errorMessage, stack, context }),
        });
    } catch (e) {
        console.error('Failed to report client error to server:', e);
    }
}

/**
 * Get all bug reports (Admin)
 */
export async function getBugs(): Promise<BugReport[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/bugs`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to fetch bug reports'));
    }
    const data = await response.json();
    return data.bugs as BugReport[];
}

/**
 * Update bug status (Admin)
 */
export async function updateBugStatus(id: string, status: BugReport['status']): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to update bug status'));
    }
}

/**
 * Get all feature requests (Admin)
 */
export async function getFeatures(): Promise<FeatureRequest[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/features`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to fetch feature requests'));
    }
    const data = await response.json();
    return data.features as FeatureRequest[];
}

/**
 * Update feature request status (Admin)
 */
export async function updateFeatureStatus(
    id: string,
    status: FeatureRequest['status']
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/features/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to update feature status'));
    }
}

/**
 * Get all API error logs (Admin)
 */
export async function getApiErrors(): Promise<ApiErrorLog[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/logs/errors`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to fetch API error logs'));
    }
    const data = await response.json();
    return data.logs as ApiErrorLog[];
}

/**
 * Get all security logs (Admin)
 */
export async function getSecurityLogs(): Promise<SecurityEventLog[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/logs/security`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to fetch security logs'));
    }
    const data = await response.json();
    return data.logs as SecurityEventLog[];
}

/**
 * Clear logs (Admin)
 */
export async function clearLogs(type: 'errors' | 'security'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/logs/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify({ type }),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, `Failed to clear ${type} logs`));
    }
}

/**
 * Fetch a bug screenshot with admin authorization and return an object URL for display.
 */
export async function fetchAdminScreenshotObjectUrl(screenshotUrl: string): Promise<string> {
    const filename = getScreenshotFilename(screenshotUrl);
    const response = await fetch(`${API_BASE_URL}/api/admin/screenshots/${encodeURIComponent(filename)}`, {
        headers: getAdminHeaders(),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to fetch screenshot'));
    }

    return URL.createObjectURL(await response.blob());
}
