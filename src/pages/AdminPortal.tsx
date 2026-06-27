import React, { useState, useEffect } from 'react';
import {
    getBugs, getFeatures, getApiErrors, getSecurityLogs,
    updateBugStatus, updateFeatureStatus, clearLogs
} from '../utils/feedback-api';
import type { BugReport, FeatureRequest, ApiErrorLog, SecurityEventLog } from '../utils/feedback-api';
import {
    ShieldAlert, Terminal, Lock, Trash2, RefreshCw,
    ChevronDown, ChevronUp, AlertTriangle, Bug, Sparkles, Image
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'submissions' | 'api_errors' | 'security'>('submissions');
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Data lists
    const [bugs, setBugs] = useState<BugReport[]>([]);
    const [features, setFeatures] = useState<FeatureRequest[]>([]);
    const [apiErrors, setApiErrors] = useState<ApiErrorLog[]>([]);
    const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>([]);

    // Submissions filters
    const [subType, setSubType] = useState<'all' | 'bug' | 'feature'>('all');
    const [subStatus, setSubStatus] = useState<string>('all');

    // Expanded rows (for logs stack trace)
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Modal state for screenshot
    const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

    // Load data
    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'submissions') {
                const [bList, fList] = await Promise.all([getBugs(), getFeatures()]);
                setBugs(bList);
                setFeatures(fList);
            } else if (activeTab === 'api_errors') {
                const errList = await getApiErrors();
                setApiErrors(errList);
            } else if (activeTab === 'security') {
                const secList = await getSecurityLogs();
                setSecurityLogs(secList);
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleBugStatusUpdate = async (id: string, newStatus: BugReport['status']) => {
        setActionLoading(id);
        try {
            await updateBugStatus(id, newStatus);
            setBugs(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            alert('Failed to update bug status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFeatureStatusUpdate = async (id: string, newStatus: FeatureRequest['status']) => {
        setActionLoading(id);
        try {
            await updateFeatureStatus(id, newStatus);
            setFeatures(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        } catch (err) {
            alert('Failed to update feature status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearLogs = async (type: 'errors' | 'security') => {
        if (!window.confirm(`Are you sure you want to clear all ${type === 'errors' ? 'API Error' : 'Security'} logs?`)) {
            return;
        }

        try {
            await clearLogs(type);
            if (type === 'errors') {
                setApiErrors([]);
            } else {
                setSecurityLogs([]);
            }
            alert('Logs cleared successfully');
        } catch (err) {
            alert('Failed to clear logs');
        }
    };

    // Filter submissions list
    const getFilteredSubmissions = () => {
        const list: Array<{ type: 'bug' | 'feature'; data: any }> = [];

        if (subType === 'all' || subType === 'bug') {
            bugs.forEach(bug => {
                if (subStatus === 'all' || bug.status === subStatus) {
                    list.push({ type: 'bug', data: bug });
                }
            });
        }

        if (subType === 'all' || subType === 'feature') {
            features.forEach(feat => {
                if (subStatus === 'all' || feat.status === subStatus) {
                    list.push({ type: 'feature', data: feat });
                }
            });
        }

        // Sort by timestamp desc
        return list.sort((a, b) => new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime());
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
                        <p className="text-sm text-gray-400">Monitor system errors, audit security events, and manage user feedback.</p>
                    </div>
                </div>

                <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all border border-gray-700 disabled:opacity-50 text-sm font-medium self-start md:self-auto shadow-md"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all ${
                        activeTab === 'submissions'
                            ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Terminal size={18} />
                    User Submissions ({bugs.length + features.length})
                </button>
                <button
                    onClick={() => setActiveTab('api_errors')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all ${
                        activeTab === 'api_errors'
                            ? 'border-red-500 text-red-400 bg-red-500/5'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <AlertTriangle size={18} />
                    API Error Logs ({apiErrors.length})
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all ${
                        activeTab === 'security'
                            ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Lock size={18} />
                    Security Logs ({securityLogs.length})
                </button>
            </div>

            {/* Content Container */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            {!isLoading && activeTab === 'submissions' && (
                <div className="space-y-6">
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center gap-4 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Type:</span>
                            <select
                                value={subType}
                                onChange={(e) => { setSubType(e.target.value as any); setSubStatus('all'); }}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                <option value="all">All Submissions</option>
                                <option value="bug">Bugs Only</option>
                                <option value="feature">Features Only</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status:</span>
                            <select
                                value={subStatus}
                                onChange={(e) => setSubStatus(e.target.value)}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                <option value="all">All Statuses</option>
                                {subType === 'bug' && (
                                    <>
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </>
                                )}
                                {subType === 'feature' && (
                                    <>
                                        <option value="pending">Pending</option>
                                        <option value="planned">Planned</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="declined">Declined</option>
                                    </>
                                )}
                                {subType === 'all' && (
                                    <>
                                        <option value="open">Open / Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved / Completed</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Submissions List */}
                    <div className="grid grid-cols-1 gap-4">
                        {getFilteredSubmissions().length === 0 ? (
                            <div className="text-center py-12 bg-gray-800/20 border border-gray-800 rounded-xl text-gray-500">
                                No submissions match the selected filters.
                            </div>
                        ) : (
                            getFilteredSubmissions().map(({ type, data }) => {
                                const isBug = type === 'bug';
                                return (
                                    <div
                                        key={data.id}
                                        className="bg-gray-800/40 border border-gray-700/50 hover:border-gray-600/70 rounded-2xl p-6 transition-all shadow-sm flex flex-col md:flex-row justify-between gap-6"
                                    >
                                        <div className="space-y-4 flex-1">
                                            {/* Header Info */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className={`px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1 ${
                                                    isBug
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                }`}>
                                                    {isBug ? <Bug size={12} /> : <Sparkles size={12} />}
                                                    {isBug ? 'Bug' : 'Feature Request'}
                                                </span>

                                                <span className="text-gray-500">
                                                    {new Date(data.timestamp).toLocaleString()}
                                                </span>

                                                {!isBug && (
                                                    <span className={`px-2.5 py-1 rounded-full font-medium capitalize text-xs ${
                                                        data.priority === 'high'
                                                            ? 'bg-red-950 text-red-400'
                                                            : data.priority === 'medium'
                                                            ? 'bg-yellow-950 text-yellow-400'
                                                            : 'bg-blue-950 text-blue-400'
                                                    }`}>
                                                        {data.priority} Priority
                                                    </span>
                                                )}
                                                {!isBug && data.category && (
                                                    <span className="bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded text-[11px]">
                                                        {data.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Submission Details */}
                                            {isBug ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Feedback / Issue:</span>
                                                        <p className="text-white text-sm whitespace-pre-wrap font-medium">{data.feedback}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Expectations:</span>
                                                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{data.expectations}</p>
                                                    </div>
                                                    {data.screenshotUrl && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedScreenshot(`${API_BASE_URL}${data.screenshotUrl}`)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-700 border border-gray-700 text-purple-400 hover:text-purple-300 rounded-lg text-xs font-semibold transition-colors"
                                                            >
                                                                <Image size={14} />
                                                                View Screenshot
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Request Title:</span>
                                                        <p className="text-white text-sm font-semibold">{data.title}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Description:</span>
                                                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{data.description}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Update / Action Section */}
                                        <div className="md:w-56 shrink-0 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                                            <div className="space-y-2 w-full">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1 md:text-right">Manage Status:</span>
                                                {isBug ? (
                                                    <select
                                                        value={data.status}
                                                        disabled={actionLoading === data.id}
                                                        onChange={(e) => handleBugStatusUpdate(data.id, e.target.value as any)}
                                                        className={`w-full bg-gray-900 border rounded-lg px-3 py-1.5 text-sm outline-none font-medium transition-all ${
                                                            data.status === 'resolved'
                                                                ? 'border-green-500/50 text-green-400'
                                                                : data.status === 'in_progress'
                                                                ? 'border-yellow-500/50 text-yellow-400'
                                                                : 'border-red-500/50 text-red-400'
                                                        }`}
                                                    >
                                                        <option value="open">Open</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                    </select>
                                                ) : (
                                                    <select
                                                        value={data.status}
                                                        disabled={actionLoading === data.id}
                                                        onChange={(e) => handleFeatureStatusUpdate(data.id, e.target.value as any)}
                                                        className={`w-full bg-gray-900 border rounded-lg px-3 py-1.5 text-sm outline-none font-medium transition-all ${
                                                            data.status === 'completed'
                                                                ? 'border-green-500/50 text-green-400'
                                                                : data.status === 'planned' || data.status === 'in_progress'
                                                                ? 'border-yellow-500/50 text-yellow-400'
                                                                : data.status === 'declined'
                                                                ? 'border-red-500/50 text-red-400'
                                                                : 'border-gray-600 text-gray-400'
                                                        }`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="planned">Planned</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="declined">Declined</option>
                                                    </select>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-2 block select-none">
                                                ID: {data.id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* API Error Logs Tab */}
            {!isLoading && activeTab === 'api_errors' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                        <span className="text-sm text-gray-400 font-medium">Logged error events occurring in API calls.</span>
                        {apiErrors.length > 0 && (
                            <button
                                onClick={() => handleClearLogs('errors')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors"
                            >
                                <Trash2 size={14} />
                                Clear Errors
                            </button>
                        )}
                    </div>

                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                        <table className="w-full border-collapse text-left text-sm text-gray-300">
                            <thead className="bg-gray-800/60 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Source</th>
                                    <th className="p-4">Endpoint</th>
                                    <th className="p-4">Message</th>
                                    <th className="p-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {apiErrors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No API errors logged.</td>
                                    </tr>
                                ) : (
                                    apiErrors.map((log) => {
                                        const isExpanded = expandedRow === log.id;
                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr className={`hover:bg-gray-800/30 transition-colors ${isExpanded ? 'bg-gray-800/20' : ''}`}>
                                                    <td className="p-4 font-mono text-xs whitespace-nowrap text-gray-400">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                                            log.source === 'client'
                                                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        }`}>
                                                            {log.source}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono text-xs font-bold text-gray-200">
                                                        {log.endpoint}
                                                    </td>
                                                    <td className="p-4 text-red-400 truncate max-w-xs font-medium">
                                                        {log.errorMessage}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                                                            className="text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="bg-gray-950/70">
                                                        <td colSpan={5} className="p-6 font-mono text-xs space-y-4">
                                                            {log.stack && (
                                                                <div>
                                                                    <span className="text-gray-500 font-bold block mb-1">Stack Trace:</span>
                                                                    <pre className="p-4 bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto text-red-300 max-h-60 whitespace-pre">
                                                                        {log.stack}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.context && Object.keys(log.context).length > 0 && (
                                                                <div>
                                                                    <span className="text-gray-500 font-bold block mb-1">Log Context:</span>
                                                                    <pre className="p-4 bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto text-gray-400">
                                                                        {JSON.stringify(log.context, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Security Logs Tab */}
            {!isLoading && activeTab === 'security' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                        <span className="text-sm text-gray-400 font-medium">Logged security audits, API key mutations, and validation issues.</span>
                        {securityLogs.length > 0 && (
                            <button
                                onClick={() => handleClearLogs('security')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors"
                            >
                                <Trash2 size={14} />
                                Clear Audit Logs
                            </button>
                        )}
                    </div>

                    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                        <table className="w-full border-collapse text-left text-sm text-gray-300">
                            <thead className="bg-gray-800/60 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Event Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {securityLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">No security events logged.</td>
                                    </tr>
                                ) : (
                                    securityLogs.map((log) => {
                                        const isExpanded = expandedRow === log.id;
                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr className={`hover:bg-gray-800/30 transition-colors ${isExpanded ? 'bg-gray-800/20' : ''}`}>
                                                    <td className="p-4 font-mono text-xs whitespace-nowrap text-gray-400">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap">
                                                        <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px] tracking-wider">
                                                            {log.eventType}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-200 font-medium">
                                                        {log.description}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                                                            className="text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && log.context && Object.keys(log.context).length > 0 && (
                                                    <tr className="bg-gray-950/70">
                                                        <td colSpan={4} className="p-6 font-mono text-xs">
                                                            <span className="text-gray-500 font-bold block mb-1">Event Context:</span>
                                                            <pre className="p-4 bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto text-gray-400">
                                                                {JSON.stringify(log.context, null, 2)}
                                                            </pre>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Screenshot Viewer Modal */}
            {selectedScreenshot && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={() => setSelectedScreenshot(null)}
                >
                    <div
                        className="relative bg-gray-900 border border-gray-700 max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden p-2 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedScreenshot}
                            alt="Full reported screenshot"
                            className="object-contain max-h-[75vh] rounded-lg"
                        />
                        <div className="flex justify-between items-center mt-3 px-3">
                            <span className="text-xs text-gray-400">User Bug Screenshot</span>
                            <button
                                onClick={() => setSelectedScreenshot(null)}
                                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
