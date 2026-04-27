import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useJobStore } from '../store/useJobStore';
import {
    Wand2, Search, RefreshCw, Briefcase, Filter, ChevronDown, ChevronUp,
    Loader2, ExternalLink, Plus, Sparkles, X, Clock, Trash2, Tag,
} from 'lucide-react';
import { searchJobs, recommendJobsFromResume } from '../utils/backend-api';
import type { JobResult } from '../types/jobSearch';
import type { JobBoard } from '../types/jobSearch';
import { defaultJobSearchFilters } from '../types/jobSearch';
import type { SkillProfile } from '../types/skillProfile';
import { defaultModel } from '../types/ai';

const JOB_BOARDS: { value: JobBoard; label: string }[] = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'glassdoor', label: 'Glassdoor' },
    { value: 'zip_recruiter', label: 'ZipRecruiter' },
];

const OPTIMIZE_INTERVAL_DAYS = 7;

function daysSince(iso: string | null): number | null {
    if (!iso) return null;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

// ──────────────────────────────────────────────────────────────────────────────
// Skill Profile Editor (create / edit)
// ──────────────────────────────────────────────────────────────────────────────
interface EditorProps {
    profile: Omit<SkillProfile, 'id' | 'createdAt' | 'updatedAt'>;
    onChange: (updates: Partial<Omit<SkillProfile, 'id' | 'createdAt' | 'updatedAt'>>) => void;
    onOptimize: () => Promise<void>;
    onSearch: () => Promise<void>;
    onSave: () => void;
    onCancel: () => void;
    isNew: boolean;
    isOptimizing: boolean;
    isSearching: boolean;
    results: JobResult[];
    error: string;
    addedIds: Set<string>;
    onAddToTracker: (job: JobResult) => void;
}

const SkillEditor: React.FC<EditorProps> = ({
    profile, onChange, onOptimize, onSearch, onSave, onCancel,
    isNew, isOptimizing, isSearching, results, error, addedIds, onAddToTracker,
}) => {
    const { resumes } = useJobStore();
    const [filtersOpen, setFiltersOpen] = useState(true);

    const toggleBoard = (board: JobBoard) => {
        const current = profile.filters.jobBoards;
        const updated = current.includes(board)
            ? current.filter(b => b !== board)
            : [...current, board];
        onChange({ filters: { ...profile.filters, jobBoards: updated } });
    };

    const daysAgo = daysSince(profile.lastOptimized);
    const needsOptimization = daysAgo === null || daysAgo >= OPTIMIZE_INTERVAL_DAYS;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-1 flex items-center gap-2">
                    <Wand2 size={20} />
                    {isNew ? 'Create New Skill Profile' : 'Edit Skill Profile'}
                </h3>
                <p className="text-gray-400 text-sm">
                    A skill profile saves your AI-recommended job search preferences based on a resume,
                    and reminds you to re-optimize weekly.
                </p>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                    <X size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {/* Profile name */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Profile Name</label>
                <input
                    type="text"
                    value={profile.name}
                    onChange={e => onChange({ name: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>

            {/* Resume + Optimize */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-400" />
                    Resume &amp; AI Optimization
                </h3>

                {resumes.length === 0 ? (
                    <p className="text-gray-500 italic">
                        No resumes loaded. Go to <span className="text-blue-400">AI Assistant</span> to add a resume first.
                    </p>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Resume</label>
                            <select
                                value={profile.resumeId ?? ''}
                                onChange={e => onChange({ resumeId: e.target.value || null })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value="">— None selected —</option>
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Optimization status */}
                        {profile.lastOptimized && (
                            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${needsOptimization
                                ? 'bg-yellow-900/30 border border-yellow-600/40 text-yellow-300'
                                : 'bg-green-900/30 border border-green-600/40 text-green-300'
                                }`}>
                                <Clock size={14} />
                                {needsOptimization
                                    ? `Last optimized ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago — weekly refresh recommended`
                                    : `Optimized ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}
                            </div>
                        )}

                        {needsOptimization && (
                            <button
                                onClick={onOptimize}
                                disabled={!profile.resumeId || isOptimizing}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                {isOptimizing
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <RefreshCw size={16} />
                                }
                                {isOptimizing ? 'Optimizing…' : (profile.lastOptimized ? 'Re-Optimize with AI' : 'Optimize with AI')}
                            </button>
                        )}

                        {!needsOptimization && (
                            <button
                                onClick={onOptimize}
                                disabled={!profile.resumeId || isOptimizing}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded-lg font-medium transition-colors text-sm"
                            >
                                {isOptimizing
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <RefreshCw size={14} />
                                }
                                {isOptimizing ? 'Optimizing…' : 'Re-Optimize'}
                            </button>
                        )}

                        {/* AI suggestions */}
                        {profile.aiJobTitles.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                    <Tag size={12} /> AI-suggested job titles
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.aiJobTitles.map(title => (
                                        <button
                                            key={title}
                                            onClick={() => onChange({ filters: { ...profile.filters, jobTitle: title } })}
                                            className="px-3 py-1 text-xs bg-purple-900/40 border border-purple-600/40 text-purple-300 rounded-full hover:bg-purple-700/40 transition-colors"
                                        >
                                            {title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.aiKeywords.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                    <Tag size={12} /> AI-extracted keywords
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.aiKeywords.map(kw => (
                                        <span
                                            key={kw}
                                            className="px-3 py-1 text-xs bg-blue-900/30 border border-blue-600/30 text-blue-300 rounded-full"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter panel */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Job Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profile.filters.jobTitle}
                                    onChange={e => onChange({ filters: { ...profile.filters, jobTitle: e.target.value } })}
                                    placeholder="e.g. Software Engineer"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={profile.filters.location}
                                    onChange={e => onChange({ filters: { ...profile.filters, location: e.target.value } })}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Company (optional)</label>
                            <input
                                type="text"
                                value={profile.filters.company}
                                onChange={e => onChange({ filters: { ...profile.filters, company: e.target.value } })}
                                placeholder="e.g. Google"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Min Salary ($/yr)</label>
                                <input
                                    type="number"
                                    value={profile.filters.salaryMin ?? ''}
                                    onChange={e => onChange({ filters: { ...profile.filters, salaryMin: e.target.value ? Number(e.target.value) : null } })}
                                    placeholder="e.g. 80000"
                                    min={0}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Max Salary ($/yr)</label>
                                <input
                                    type="number"
                                    value={profile.filters.salaryMax ?? ''}
                                    onChange={e => onChange({ filters: { ...profile.filters, salaryMax: e.target.value ? Number(e.target.value) : null } })}
                                    placeholder="e.g. 150000"
                                    min={0}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.filters.remote}
                                        onChange={e => onChange({ filters: { ...profile.filters, remote: e.target.checked } })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-300">Remote Only</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Results Wanted</label>
                                <select
                                    value={profile.filters.resultsWanted}
                                    onChange={e => onChange({ filters: { ...profile.filters, resultsWanted: Number(e.target.value) } })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {[10, 20, 50, 100].map(n => (
                                        <option key={n} value={n}>{n} results</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Job Boards</label>
                            <div className="flex flex-wrap gap-3">
                                {JOB_BOARDS.map(board => {
                                    const selected = profile.filters.jobBoards.includes(board.value);
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

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onSearch}
                    disabled={isSearching || !profile.filters.jobTitle.trim()}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                    {isSearching ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}
                    {isSearching ? 'Searching…' : 'Search Jobs'}
                </button>
                <button
                    onClick={onSave}
                    disabled={!profile.name.trim()}
                    className="flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                    Save Profile
                </button>
                <button
                    onClick={onCancel}
                    className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold transition-colors"
                >
                    Cancel
                </button>
            </div>

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
                                            {job.location && <span className="text-sm text-gray-400">{job.location}</span>}
                                            {job.salary && <span className="text-sm text-green-400 font-medium">{job.salary}</span>}
                                            {job.datePosted && <span className="text-sm text-gray-500">Posted: {job.datePosted}</span>}
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
                                            onClick={() => onAddToTracker(job)}
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

// ──────────────────────────────────────────────────────────────────────────────
// Main CreateSkill page
// ──────────────────────────────────────────────────────────────────────────────
export const CreateSkill: React.FC = () => {
    const { profileId } = useParams<{ profileId?: string }>();

    const {
        resumes,
        aiSettings,
        activeResumeId,
        skillProfiles,
        addSkillProfile,
        updateSkillProfile,
        deleteSkillProfile,
        addCompany,
    } = useJobStore();

    // ---- state for the editor ----
    const [editing, setEditing] = useState<string | null>(null); // profile id being edited, or 'new'
    const [draft, setDraft] = useState<Omit<SkillProfile, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

    const [results, setResults] = useState<JobResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [error, setError] = useState('');
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    // Open editor from URL param (e.g. /create-skill/new)
    useEffect(() => {
        if (profileId === 'new' && editing !== 'new') {
            startNew();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId]);

    function startNew() {
        setEditing('new');
        setResults([]);
        setError('');
        setAddedIds(new Set());
        setDraft({
            name: '',
            resumeId: activeResumeId,
            filters: { ...defaultJobSearchFilters },
            aiJobTitles: [],
            aiKeywords: [],
            lastOptimized: null,
        });
    }

    function startEdit(profile: SkillProfile) {
        setEditing(profile.id);
        setResults([]);
        setError('');
        setAddedIds(new Set());
        setDraft({
            name: profile.name,
            resumeId: profile.resumeId,
            filters: { ...profile.filters },
            aiJobTitles: [...profile.aiJobTitles],
            aiKeywords: [...profile.aiKeywords],
            lastOptimized: profile.lastOptimized,
        });
    }

    function cancelEdit() {
        setEditing(null);
        setDraft(null);
        setResults([]);
        setError('');
    }

    async function handleOptimize() {
        if (!draft) return;
        const resume = resumes.find(r => r.id === draft.resumeId);
        if (!resume) {
            setError('Please select a resume first.');
            return;
        }
        setIsOptimizing(true);
        setError('');
        try {
            const rec = await recommendJobsFromResume(
                resume.content,
                aiSettings.provider,
                aiSettings.model ?? defaultModel.model ?? 'llama3.2'
            );
            const now = new Date().toISOString();
            setDraft(prev => prev ? {
                ...prev,
                aiJobTitles: rec.jobTitles ?? [],
                aiKeywords: rec.keywords ?? [],
                lastOptimized: now,
                filters: {
                    ...prev.filters,
                    jobTitle: rec.suggestedFilters.jobTitle ?? prev.filters.jobTitle,
                    location: rec.suggestedFilters.location ?? prev.filters.location,
                    remote: rec.suggestedFilters.remote ?? prev.filters.remote,
                    salaryMin: rec.suggestedFilters.salaryMin ?? prev.filters.salaryMin,
                    salaryMax: rec.suggestedFilters.salaryMax ?? prev.filters.salaryMax,
                },
            } : prev);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to get AI recommendations.');
        } finally {
            setIsOptimizing(false);
        }
    }

    async function handleSearch() {
        if (!draft) return;
        if (!draft.filters.jobTitle.trim()) {
            setError('Please enter a job title to search.');
            return;
        }
        setIsSearching(true);
        setError('');
        setResults([]);
        try {
            const resume = resumes.find(r => r.id === draft.resumeId);
            const jobs = await searchJobs(draft.filters, resume?.content);
            setResults(jobs);
            if (jobs.length === 0) {
                setError('No jobs found for these filters. Try broadening your search.');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to search jobs.');
        } finally {
            setIsSearching(false);
        }
    }

    function handleSave() {
        if (!draft) return;
        if (editing === 'new') {
            addSkillProfile(draft);
        } else if (editing) {
            updateSkillProfile(editing, draft);
        }
        cancelEdit();
    }

    function handleAddToTracker(job: JobResult) {
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
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Wand2 size={32} className="text-purple-400" />
                    <h2 className="text-3xl font-bold text-white">Skill Profiles</h2>
                </div>
                {!editing && (
                    <button
                        onClick={startNew}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus size={16} />
                        New Profile
                    </button>
                )}
            </div>

            {editing && draft ? (
                <SkillEditor
                    profile={draft}
                    onChange={updates => setDraft(prev => prev ? { ...prev, ...updates } : prev)}
                    onOptimize={handleOptimize}
                    onSearch={handleSearch}
                    onSave={handleSave}
                    onCancel={cancelEdit}
                    isNew={editing === 'new'}
                    isOptimizing={isOptimizing}
                    isSearching={isSearching}
                    results={results}
                    error={error}
                    addedIds={addedIds}
                    onAddToTracker={handleAddToTracker}
                />
            ) : (
                <div className="space-y-4">
                    {skillProfiles.length === 0 && (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                            <Wand2 size={48} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No skill profiles yet</p>
                            <p className="text-gray-500 text-sm mb-6">
                                Create a profile to save AI-recommended job search settings from your resume.
                                The AI will re-optimize your filters weekly.
                            </p>
                            <button
                                onClick={startNew}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus size={18} />
                                Create Your First Profile
                            </button>
                        </div>
                    )}

                    {skillProfiles.map(profile => {
                        const daysAgo = daysSince(profile.lastOptimized);
                        const needsOpt = daysAgo === null || daysAgo >= OPTIMIZE_INTERVAL_DAYS;
                        const linkedResume = resumes.find(r => r.id === profile.resumeId);

                        return (
                            <div
                                key={profile.id}
                                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-white truncate">{profile.name}</h3>
                                            {needsOpt && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-900/40 border border-yellow-600/40 text-yellow-300 text-xs rounded-full whitespace-nowrap">
                                                    <Clock size={11} />
                                                    Optimize due
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-3">
                                            {linkedResume && (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase size={13} /> {linkedResume.name}
                                                </span>
                                            )}
                                            {profile.filters.jobTitle && (
                                                <span className="text-blue-400">{profile.filters.jobTitle}</span>
                                            )}
                                            {profile.filters.location && (
                                                <span>{profile.filters.location}</span>
                                            )}
                                            {profile.filters.remote && (
                                                <span className="text-green-400">Remote</span>
                                            )}
                                            {(profile.filters.salaryMin || profile.filters.salaryMax) && (
                                                <span className="text-green-400">
                                                    {profile.filters.salaryMin ? `$${profile.filters.salaryMin.toLocaleString()}` : ''}
                                                    {profile.filters.salaryMin && profile.filters.salaryMax ? ' – ' : ''}
                                                    {profile.filters.salaryMax ? `$${profile.filters.salaryMax.toLocaleString()}` : ''}
                                                </span>
                                            )}
                                        </div>

                                        {profile.aiJobTitles.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.aiJobTitles.slice(0, 4).map(t => (
                                                    <span key={t} className="px-2 py-0.5 text-xs bg-purple-900/30 border border-purple-600/30 text-purple-300 rounded-full">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {profile.lastOptimized && (
                                            <p className="text-xs text-gray-600 mt-2">
                                                Last optimized: {new Date(profile.lastOptimized).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => startEdit(profile)}
                                            className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Search size={14} />
                                            Open &amp; Search
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete profile "${profile.name}"?`)) {
                                                    deleteSkillProfile(profile.id);
                                                }
                                            }}
                                            className="p-2 bg-gray-700 hover:bg-red-900/40 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
