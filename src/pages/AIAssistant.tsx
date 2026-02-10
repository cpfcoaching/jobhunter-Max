import React, { useState, useRef } from 'react';
import { useJobStore } from '../store/useJobStore';
import { Brain, FileText, Target, Plus, Trash2, Loader2, Upload } from 'lucide-react';
import { generateResumeReview, generateJobMatch } from '../utils/ai';
import type { ResumeReviewResponse, JobMatchResponse } from '../types/ai';
import { uploadResumeFile, isValidFileType, isValidFileSize, removeFileExtension } from '../utils/fileUpload';

export const AIAssistant: React.FC = () => {
    const { resumes, aiSettings, addResume, deleteResume } = useJobStore();
    const [showAddResume, setShowAddResume] = useState(false);
    const [selectedResume, setSelectedResume] = useState<string>('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeReview, setResumeReview] = useState<ResumeReviewResponse | null>(null);
    const [jobMatch, setJobMatch] = useState<JobMatchResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string>('');

    const handleAddResume = (name: string, content: string) => {
        addResume({ name, content });
        setShowAddResume(false);
    };

    const handleResumeReview = async () => {
        if (!selectedResume) {
            setError('Please select a resume');
            return;
        }
        const resume = resumes.find(r => r.id === selectedResume);
        if (!resume) return;

        setIsAnalyzing(true);
        setError('');
        try {
            const review = await generateResumeReview(resume.content, aiSettings);
            setResumeReview(review);
        } catch (err: any) {
            console.error('Resume review error:', err);
            setError(err.message || 'Failed to generate resume review. Please check your AI provider settings.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleJobMatch = async () => {
        if (!selectedResume || !jobDescription) {
            setError('Please select a resume and enter a job description');
            return;
        }
        const resume = resumes.find(r => r.id === selectedResume);
        if (!resume) return;

        setIsAnalyzing(true);
        setError('');
        try {
            const match = await generateJobMatch(resume.content, jobDescription, aiSettings);
            setJobMatch(match);
        } catch (err: any) {
            console.error('Job match error:', err);
            setError(err.message || 'Failed to generate job match. Please check your AI provider settings.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Brain size={32} className="text-purple-400" />
                <h2 className="text-3xl font-bold text-white">AI Assistant</h2>
            </div>

            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-2">🤖 AI-Powered Career Tools</h3>
                <p className="text-gray-300">
                    Leverage AI to review your resumes and match them with job descriptions.
                    Powered by {aiSettings.provider === 'ollama' ? 'Ollama (Local)' : aiSettings.provider}.
                </p>
                {aiSettings.model && (
                    <p className="text-sm text-gray-400 mt-2">
                        Current Model: <span className="text-purple-400 font-mono">{aiSettings.model}</span>
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resume Management Panel */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={24} className="text-blue-400" />
                            My Resumes
                        </h3>
                        <button
                            onClick={() => setShowAddResume(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            Add Resume
                        </button>
                    </div>

                    {resumes.length === 0 ? (
                        <p className="text-gray-500 italic">No resumes added yet. Add your first resume to get started!</p>
                    ) : (
                        <div className="space-y-3">
                            {resumes.map(resume => (
                                <div
                                    key={resume.id}
                                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${selectedResume === resume.id
                                        ? 'bg-blue-900/30 border-blue-500'
                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                        }`}
                                    onClick={() => setSelectedResume(resume.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white">{resume.name}</h4>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteResume(resume.id);
                                                if (selectedResume === resume.id) setSelectedResume('');
                                            }}
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Analysis Panel */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Target size={24} className="text-purple-400" />
                        AI Analysis
                    </h3>

                    <div className="space-y-4">
                        <button
                            onClick={handleResumeReview}
                            disabled={!selectedResume || isAnalyzing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />}
                            Review Resume
                        </button>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Job Description (for matching)
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                                placeholder="Paste job description here..."
                            />
                        </div>

                        <button
                            onClick={handleJobMatch}
                            disabled={!selectedResume || !jobDescription || isAnalyzing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Target size={20} />}
                            Match with Job
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {(resumeReview || jobMatch) && (
                <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Analysis Results</h3>

                    {resumeReview && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">Resume Review</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-bold text-purple-400">{resumeReview.overallScore || 0}</span>
                                    <span className="text-gray-400">/ 100</span>
                                </div>
                                <p className="text-gray-300">{resumeReview.summary || "No summary available."}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <h5 className="font-semibold text-green-400 mb-2">Strengths</h5>
                                        {resumeReview.strengths?.length > 0 ? (
                                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                                {resumeReview.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        ) : <p className="text-gray-500 italic">No specific strengths identified.</p>}
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-yellow-400 mb-2">Areas to Improve</h5>
                                        {resumeReview.weaknesses?.length > 0 ? (
                                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                                {resumeReview.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                            </ul>
                                        ) : <p className="text-gray-500 italic">No specific areas to improve identified.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {jobMatch && (
                        <div>
                            <h4 className="text-lg font-semibold text-green-300 mb-3">Job Match Analysis</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-bold text-green-400">{jobMatch.overallMatch || 0}%</span>
                                    <span className="text-gray-400">Match Score</span>
                                </div>
                                <p className="text-gray-300">{jobMatch.summary || "No summary provided."}</p>

                                <div className="mt-4">
                                    <h5 className="font-semibold text-blue-400 mb-2">Tailoring Tips</h5>
                                    {jobMatch.tailoringTips?.length > 0 ? (
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            {jobMatch.tailoringTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                        </ul>
                                    ) : <p className="text-gray-500 italic">No specific tailoring tips provided.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Resume Modal */}
            {
                showAddResume && (
                    <AddResumeModal
                        onClose={() => setShowAddResume(false)}
                        onAdd={handleAddResume}
                    />
                )
            }
        </div >
    );
};

// Enhanced Add Resume Modal Component with File Upload
const AddResumeModal: React.FC<{
    onClose: () => void;
    onAdd: (name: string, content: string) => void;
}> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [inputMethod, setInputMethod] = useState<'paste' | 'upload'>('paste');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!isValidFileType(file)) {
            setUploadError('Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.');
            return;
        }

        // Validate file size (5MB)
        if (!isValidFileSize(file)) {
            setUploadError('File size exceeds 5MB limit.');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            const text = await uploadResumeFile(file);
            setContent(text);

            // Auto-fill name if not set
            if (!name) {
                setName(removeFileExtension(file.name));
            }
        } catch (error) {
            console.error('File upload error:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && content) {
            onAdd(name, content);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Add New Resume</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Resume Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="e.g., Software Engineer Resume"
                        />
                    </div>

                    {/* Input Method Tabs */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setInputMethod('paste')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${inputMethod === 'paste'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}>
                            Paste Text
                        </button>
                        <button
                            type="button"
                            onClick={() => setInputMethod('upload')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${inputMethod === 'upload'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}>
                            Upload File
                        </button>
                    </div>

                    {inputMethod === 'paste' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Resume Content *</label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none h-64 resize-none font-mono text-sm"
                                placeholder="Paste your resume content here..."
                            />
                        </div>
                    )}

                    {inputMethod === 'upload' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Upload Resume File *</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt,.doc,.docx"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                                {isUploading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Click to upload PDF, TXT, DOC, or DOCX
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>

                            {uploadError && (
                                <p className="text-sm text-red-400 mt-2">{uploadError}</p>
                            )}

                            {content && !uploadError && (
                                <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                    <p className="text-sm text-green-400">✓ File uploaded successfully</p>
                                    <p className="text-xs text-gray-400 mt-1">{content.length} characters extracted</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/20"
                        >
                            Add Resume
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
