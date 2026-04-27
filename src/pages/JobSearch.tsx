import React, { useState, useEffect } from 'react';
import { useJobStore } from '../store/useJobStore';
import {
    Search, Briefcase, Filter, ChevronDown, ChevronUp,
    Loader2, ExternalLink, Plus, Sparkles, X
} from 'lucide-react';
import { searchJobs, recommendJobsFromResume } from '../utils/backend-api';
import type { JobResult } from '../types/jobSearch';
import type { JobBoard } from '../types/jobSearch';
import { defaultModel } from '../types/ai';

const JOB_BOARDS: { value: JobBoard; label: string }[] = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'glassdoor', label: 'Glassdoor' },
    { value: 'zip_recruiter', label: 'ZipRecruiter' },
];

export const JobSearch: React.FC = () => {
    const {
        resumes,
        aiSettings,
        activeResumeId,
        jobSearchFilters,
        setActiveResumeId,
        setJobSearchFilters,
        addCompany,
    } = useJobStore();

    const [results, setResults] = useState<JobResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isRecommending, setIsRecommending] = useState(false);
    const [error, setError] = useState<string>('');
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    // Sync activeResumeId if currently-selected resume was deleted
    useEffect(() => {
        if (activeResumeId && !resumes.find(r => r.id === activeResumeId)) {
            setActiveResumeId(null);
        }
    }, [resumes, activeResumeId, setActiveResumeId]);

    const selectedResume = resumes.find(r => r.id === activeResumeId) ?? null;

    const handleAutoFill = async () => {
        if (!selectedResume) {
            setError('Please select a resume first.');
            return;
        }
        setIsRecommending(true);
        setError('');
        try {
            const rec = await recommendJobsFromResume(
                selectedResume.content,
                aiSettings.provider,
                aiSettings.model ?? defaultModel.model ?? 'llama3.2'
            );
            setJobSearchFilters({
                jobTitle: rec.suggestedFilters.jobTitle ?? jobSearchFilters.jobTitle,
                location: rec.suggestedFilters.location ?? jobSearchFilters.location,
                remote: rec.suggestedFilters.remote ?? jobSearchFilters.remote,
                salaryMin: rec.suggestedFilters.salaryMin ?? jobSearchFilters.salaryMin,
                salaryMax: rec.suggestedFilters.salaryMax ?? jobSearchFilters.salaryMax,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to get AI recommendations.');
        } finally {
            setIsRecommending(false);
        }
    };

    const handleSearch = async () => {
        if (!jobSearchFilters.jobTitle.trim()) {
            setError('Please enter a job title to search.');
            return;
        }
        setIsSearching(true);
        setError('');
        setResults([]);
        try {
            const jobs = await searchJobs(
                jobSearchFilters,
                selectedResume?.content
            );
            setResults(jobs);
            if (jobs.length === 0) {
                setError('No jobs found for these filters. Try broadening your search.');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to search jobs.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddToTracker = (job: JobResult) => {
        addCompany({
            name: job.company || 'Unknown Company',
            industry: undefined,
            location: job.location || undefined,
            description: job.description || undefined,
            rating: 0,
            relocationUncertain: false,
            linkedinConnection: false,
            website: job.url || undefined,
            applications: [],
            notes: `Position: ${job.title}${job.salary ? `\nSalary: ${job.salary}` : ''}${job.datePosted ? `\nPosted: ${job.datePosted}` : ''}\nSource: ${job.source}`,
        });
        setAddedIds(prev => new Set(prev).add(job.id));
    };

    const toggleBoard = (board: JobBoard) => {
        const current = jobSearchFilters.jobBoards;
        const updated = current.includes(board)
            ? current.filter(b => b !== board)
            : [...current, board];
        setJobSearchFilters({ jobBoards: updated });
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Briefcase size={32} className="text-blue-400" />
                <h2 className="text-3xl font-bold text-white">Job Search</h2>
            </div>

            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">🔍 Resume-Aware Job Search</h3>
                <p className="text-gray-300">
                    Select one of your loaded resumes, let AI recommend job titles and filters, then search
                    across multiple job boards powered by JobSpy. Add interesting roles directly to your tracker.
                </p>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <X size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {/* Resume Selector */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-400" />
                    Resume Context
                </h3>

                {resumes.length === 0 ? (
                    <p className="text-gray-500 italic">
                        No resumes loaded. Go to <span className="text-blue-400">AI Assistant</span> to add a resume first.
                    </p>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Select Resume
                            </label>
                            <select
                                value={activeResumeId ?? ''}
                                onChange={e => setActiveResumeId(e.target.value || null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">— None selected —</option>
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleAutoFill}
                                disabled={!activeResumeId || isRecommending}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                            >
                                {isRecommending
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <Sparkles size={16} />
                                }
                                Auto-fill from Resume
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Panel */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
                <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setFiltersOpen(o => !o)}
                >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Filter size={20} className="text-purple-400" />
                        Search Filters
                    </h3>
                    {filtersOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </button>

                {filtersOpen && (
                    <div className="px-6 pb-6 space-y-5 border-t border-gray-700 pt-4">
                        {/* Job Title + Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Job Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={jobSearchFilters.jobTitle}
                                    onChange={e => setJobSearchFilters({ jobTitle: e.target.value })}
                                    placeholder="e.g. Software Engineer"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={jobSearchFilters.location}
                                    onChange={e => setJobSearchFilters({ location: e.target.value })}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Company (optional)</label>
                            <input
                                type="text"
                                value={jobSearchFilters.company}
                                onChange={e => setJobSearchFilters({ company: e.target.value })}
                                placeholder="e.g. Google"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Salary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Min Salary ($/yr)</label>
                                <input
                                    type="number"
                                    value={jobSearchFilters.salaryMin ?? ''}
                                    onChange={e => setJobSearchFilters({ salaryMin: e.target.value ? Number(e.target.value) : null })}
                                    placeholder="e.g. 80000"
                                    min={0}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Max Salary ($/yr)</label>
                                <input
                                    type="number"
                                    value={jobSearchFilters.salaryMax ?? ''}
                                    onChange={e => setJobSearchFilters({ salaryMax: e.target.value ? Number(e.target.value) : null })}
                                    placeholder="e.g. 150000"
                                    min={0}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Remote + Results Wanted */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={jobSearchFilters.remote}
                                        onChange={e => setJobSearchFilters({ remote: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-300">Remote Only</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Results Wanted</label>
                                <select
                                    value={jobSearchFilters.resultsWanted}
                                    onChange={e => setJobSearchFilters({ resultsWanted: Number(e.target.value) })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {[10, 20, 50, 100].map(n => (
                                        <option key={n} value={n}>{n} results</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Job Boards */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Job Boards</label>
                            <div className="flex flex-wrap gap-3">
                                {JOB_BOARDS.map(board => {
                                    const selected = jobSearchFilters.jobBoards.includes(board.value);
                                    return (
                                        <button
                                            key={board.value}
                                            onClick={() => toggleBoard(board.value)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selected
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                                                }`}
                                        >
                                            {board.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={isSearching || !jobSearchFilters.jobTitle.trim()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors mb-8 shadow-lg shadow-blue-500/20"
            >
                {isSearching ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}
                {isSearching ? 'Searching…' : 'Search Jobs'}
            </button>

            {/* Results */}
            {results.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">
                        {results.length} Job{results.length !== 1 ? 's' : ''} Found
                    </h3>
                    <div className="space-y-4">
                        {results.map(job => (
                            <div
                                key={job.id}
                                className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-semibold text-white truncate">{job.title}</h4>
                                        <p className="text-blue-400 font-medium">{job.company}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            {job.location && (
                                                <span className="text-sm text-gray-400">{job.location}</span>
                                            )}
                                            {job.salary && (
                                                <span className="text-sm text-green-400 font-medium">{job.salary}</span>
                                            )}
                                            {job.datePosted && (
                                                <span className="text-sm text-gray-500">Posted: {job.datePosted}</span>
                                            )}
                                            <span className="text-sm text-purple-400 capitalize">{job.source}</span>
                                        </div>
                                        {job.description && (
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{job.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        {job.url && (
                                            <a
                                                href={job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                                Apply
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleAddToTracker(job)}
                                            disabled={addedIds.has(job.id)}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${addedIds.has(job.id)
                                                ? 'bg-green-900/40 border border-green-600/50 text-green-400 cursor-default'
                                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                                                }`}
                                        >
                                            <Plus size={14} />
                                            {addedIds.has(job.id) ? 'Added' : 'Track'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
