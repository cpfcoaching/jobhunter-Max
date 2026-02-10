/**
 * File upload utility for resumes and job descriptions
 */

const API_BASE_URL = 'http://localhost:3001';

export interface FileUploadResponse {
    success: boolean;
    filename: string;
    text: string;
    size: number;
}

export interface UrlFetchResponse {
    success: boolean;
    url: string;
    text: string;
}

/**
 * Upload and parse a resume file (PDF, TXT, DOC, DOCX)
 */
export async function uploadResumeFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload resume file');
    }

    const data: FileUploadResponse = await response.json();
    return data.text;
}

/**
 * Upload and parse a job description file (PDF, TXT, DOC, DOCX)
 */
export async function uploadJobDescriptionFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/job-description/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload job description file');
    }

    const data: FileUploadResponse = await response.json();
    return data.text;
}

/**
 * Fetch job description from URL
 */
export async function fetchJobDescriptionFromUrl(url: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/job-description/from-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch job description from URL');
    }

    const data: UrlFetchResponse = await response.json();
    return data.text;
}

/**
 * Validate file type
 */
export function isValidFileType(file: File): boolean {
    const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(file.type);
}

/**
 * Validate file size (5MB limit)
 */
export function isValidFileSize(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Remove file extension from filename
 */
export function removeFileExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
}
