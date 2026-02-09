// AI Provider types
export type AiProvider = 'ollama' | 'openai' | 'deepseek';

export type OllamaModel = 'llama3.1' | 'llama3.2' | 'tinyllama' | 'phi' | 'mistral';

export type OpenaiModel = 'gpt-3.5-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4';

export type DeepseekModel = 'deepseek-chat' | 'deepseek-reasoner' | 'deepseek-coder';

export interface AiModel {
    provider: AiProvider;
    model: string | undefined;
}

export const defaultModel: AiModel = {
    provider: 'ollama',
    model: 'llama3.2',
};

// Model Management
export interface ModelInfo {
    name: string;
    displayName: string;
    size: string;
    provider: 'ollama' | 'openai' | 'deepseek';
    isDownloaded: boolean;
    isDownloading: boolean;
    downloadProgress?: number;
    recommended?: boolean;
    description?: string;
}

export interface OllamaModelTag {
    name: string;
    modified_at: string;
    size: number;
}

export interface OllamaListResponse {
    models: OllamaModelTag[];
}

// Resume Review Response
export interface ResumeReviewResponse {
    overallScore: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    formatting: {
        score: number;
        comments: string[];
    };
    content: {
        score: number;
        comments: string[];
    };
    keywords: {
        score: number;
        missing: string[];
        present: string[];
    };
}

// Job Match Response
export interface JobMatchResponse {
    overallMatch: number;
    summary: string;
    skillsMatch: {
        score: number;
        matched: string[];
        missing: string[];
    };
    experienceMatch: {
        score: number;
        analysis: string;
    };
    recommendations: string[];
    tailoringTips: string[];
}

// Resume interface
export interface Resume {
    id: string;
    name: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
