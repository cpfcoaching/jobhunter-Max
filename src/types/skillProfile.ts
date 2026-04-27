import type { JobSearchFilters } from './jobSearch';

export interface SkillProfile {
    id: string;
    name: string;
    resumeId: string | null;
    filters: JobSearchFilters;
    aiJobTitles: string[];
    aiKeywords: string[];
    lastOptimized: string | null; // ISO timestamp of last AI optimization
    createdAt: string;
    updatedAt: string;
}
