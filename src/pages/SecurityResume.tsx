import React, { useState } from 'react';
import { useJobStore } from '../store/useJobStore';
import { FileText, Sparkles, Loader2, Download, Check, Clipboard } from 'lucide-react';
import { optimizeResume } from '../utils/backend-api';
import { exportToPdf, exportToWord, stripMarkdown } from '../utils/resumeExport';

interface SecurityRole {
    id: string;
    title: string;
    description: string;
}

const SECURITY_ROLES: SecurityRole[] = [
    { id: 'SOC', title: 'SOC', description: 'Security Operations Center Analyst' },
    { id: 'GRC', title: 'GRC', description: 'Governance, Risk, and Compliance Analyst' },
    { id: 'Cloud Security', title: 'Cloud Security', description: 'Cloud Security Engineer / Architect' },
    { id: 'IAM', title: 'IAM', description: 'Identity and Access Management Engineer' },
    { id: 'Business Continuity Analyst', title: 'Business Continuity Analyst', description: 'Business Continuity & Disaster Recovery Specialist' },
    { id: 'Leadership Roles', title: 'Leadership Roles', description: 'Security Manager / Director' },
    { id: 'BISO', title: 'BISO', description: 'Business Information Security Officer' },
    { id: 'CISO', title: 'CISO', description: 'Chief Information Security Officer' },
    { id: 'Defensive Analyst', title: 'Defensive Analyst', description: 'Blue Team / Threat Incident Responder' },
    { id: 'Offensive Analyst', title: 'Offensive Analyst', description: 'Red Team / Penetration Tester' },
];

export const SecurityResume: React.FC = () => {
    const { resumes, aiSettings, addResume } = useJobStore();

    // Inputs
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [baseResumeId, setBaseResumeId] = useState<string>('');
    const [customResumeText, setCustomResumeText] = useState<string>('');

    // Outputs & State
    const [optimizedResume, setOptimizedResume] = useState<string>('');
    const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
    const [isSavedToApp, setIsSavedToApp] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleSelectSavedResume = (id: string) => {
        setBaseResumeId(id);
        if (id) {
            const selected = resumes.find(r => r.id === id);
            if (selected) {
                setCustomResumeText(selected.content);
            }
        } else {
            setCustomResumeText('');
        }
    };

    const handleOptimize = async () => {
        if (!selectedRole) {
            setError('Please select a target security role.');
            return;
        }
        if (!customResumeText.trim()) {
            setError('Please paste or select a base resume content.');
            return;
        }

        setIsOptimizing(true);
        setError('');
        setOptimizedResume('');
        setIsSavedToApp(false);

        try {
            const optimized = await optimizeResume(
                customResumeText,
                selectedRole,
                aiSettings.provider,
                aiSettings.model ?? 'llama3.2'
            );
            // Cleanup any markdown headers or bold indicators to ensure clean plain text
            const cleanedResume = stripMarkdown(optimized);
            setOptimizedResume(cleanedResume);
        } catch (err: unknown) {
            console.error('Failed to optimize resume:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate targeted resume. Please check your AI provider configuration.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleSaveToApp = () => {
        if (!optimizedResume) return;

        const roleTitle = SECURITY_ROLES.find(r => r.id === selectedRole)?.title || selectedRole;
        const newResumeName = `${roleTitle} Optimized Resume - ${new Date().toLocaleDateString()}`;

        addResume({
            name: newResumeName,
            content: optimizedResume,
        });

        setIsSavedToApp(true);
        setTimeout(() => setIsSavedToApp(false), 3000);
    };

    const handleCopyToClipboard = async () => {
        if (!optimizedResume) return;
        try {
            await navigator.clipboard.writeText(optimizedResume);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const handleExportWord = () => {
        const roleTitle = SECURITY_ROLES.find(r => r.id === selectedRole)?.title || selectedRole;
        const filename = `${roleTitle.toLowerCase().replace(/\s+/g, '_')}_resume`;
        exportToWord(filename, optimizedResume);
        setShowExportMenu(false);
    };

    const handleExportPdf = () => {
        const roleTitle = SECURITY_ROLES.find(r => r.id === selectedRole)?.title || selectedRole;
        const filename = `${roleTitle.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`;
        exportToPdf(filename, optimizedResume);
        setShowExportMenu(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl">
                    <FileText size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Targeted Security Resume</h2>
                    <p className="text-sm text-gray-400">Optimize your generic resume for specific InfoSec roles.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs Pane */}
                <div className="space-y-6">
                    {/* Role Selection */}
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full w-6 h-6 text-xs">1</span>
                            Select Target Role
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {SECURITY_ROLES.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`py-3 px-4 rounded-xl border text-left text-sm font-medium transition-all group relative overflow-hidden ${
                                        selectedRole === role.id
                                            ? 'bg-purple-950/50 border-purple-500 text-purple-300 shadow-md shadow-purple-500/5'
                                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">{role.title}</div>
                                    <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">{role.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paste Base Resume */}
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <span className="flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full w-6 h-6 text-xs">2</span>
                            Paste Base Resume
                        </h3>

                        <div className="space-y-2">
                            <label htmlFor="saved-resume-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Select from saved resumes:</label>
                            <select
                                id="saved-resume-select"
                                title="Select from saved resumes"
                                value={baseResumeId}
                                onChange={(e) => handleSelectSavedResume(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                <option value="">-- Choose a saved resume --</option>
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="raw-resume-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Or paste raw resume text:</label>
                                <span className="text-[10px] text-gray-500">Plain text format preferred</span>
                            </div>
                            <textarea
                                id="raw-resume-input"
                                title="Raw resume content"
                                value={customResumeText}
                                onChange={(e) => setCustomResumeText(e.target.value)}
                                rows={10}
                                placeholder="Paste your current generic resume content here..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono resize-none"
                            />
                        </div>

                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Optimizing Resume...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Optimize Resume
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Outputs Pane */}
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full w-6 h-6 text-xs">3</span>
                            Optimized Output
                        </h3>

                        {optimizedResume && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="p-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                    title="Copy to clipboard"
                                >
                                    {isCopied ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                                    {isCopied ? 'Copied' : 'Copy'}
                                </button>

                                <button
                                    onClick={handleSaveToApp}
                                    className={`p-2 border rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-medium ${
                                        isSavedToApp
                                            ? 'bg-green-950 border-green-500 text-green-400'
                                            : 'bg-purple-900/40 border-purple-500 text-purple-300 hover:bg-purple-900/60'
                                    }`}
                                >
                                    {isSavedToApp ? <Check size={16} /> : <FileText size={16} />}
                                    {isSavedToApp ? 'Saved to App' : 'Save to App'}
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                    >
                                        <Download size={16} />
                                        Export
                                    </button>
                                    
                                    {showExportMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                            <button
                                                onClick={handleExportPdf}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                                            >
                                                Export to PDF (Print)
                                            </button>
                                            <button
                                                onClick={handleExportWord}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-800 border-t border-gray-800 text-gray-300 hover:text-white transition-colors"
                                            >
                                                Export to Word (.doc)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col">
                        {isOptimizing ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
                                <Loader2 size={36} className="animate-spin text-purple-400" />
                                <span className="text-sm font-medium animate-pulse">AI is rewriting and formatting your resume...</span>
                            </div>
                        ) : optimizedResume ? (
                            <textarea
                                readOnly
                                title="Optimized Resume Output"
                                aria-label="Optimized Resume Output"
                                value={optimizedResume}
                                className="flex-1 w-full bg-gray-950/70 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 font-mono resize-none focus:outline-none h-full min-h-[400px]"
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic p-8 text-center">
                                Select a role and input your base resume, then click "Optimize Resume" to view the tailored result here.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
