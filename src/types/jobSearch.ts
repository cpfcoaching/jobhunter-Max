export type JobBoard = 'linkedin' | 'indeed' | 'glassdoor' | 'zip_recruiter';

export interface JobSearchFilters {
    jobTitle: string;
    location: string;
    company: string;
    salaryMin: number | null;
    salaryMax: number | null;
    remote: boolean;
    jobBoards: JobBoard[];
    resultsWanted: number;
}

export const defaultJobSearchFilters: JobSearchFilters = {
    jobTitle: '',
    location: '',
    company: '',
    salaryMin: null,
    salaryMax: null,
    remote: false,
    jobBoards: ['linkedin', 'indeed'],
    resultsWanted: 20,
};

export interface JobResult {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string | null;
    url: string | null;
    source: JobBoard | string;
    datePosted: string | null;
    description: string | null;
}

export interface RecommendJobsResponse {
    jobTitles: string[];
    keywords: string[];
    suggestedFilters: Partial<JobSearchFilters>;
}
