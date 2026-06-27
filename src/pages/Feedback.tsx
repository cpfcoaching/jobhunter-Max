import React, { useState } from 'react';
import { submitBugReport, submitFeatureRequest } from '../utils/feedback-api';
import { Bug, Sparkles, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const Feedback: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'bug' | 'feature'>('bug');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Bug form state
    const [bugFeedback, setBugFeedback] = useState('');
    const [bugExpectations, setBugExpectations] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);

    // Feature request form state
    const [featureTitle, setFeatureTitle] = useState('');
    const [featureDesc, setFeatureDesc] = useState('');
    const [featureCategory, setFeatureCategory] = useState('General');
    const [featurePriority, setFeaturePriority] = useState<'low' | 'medium' | 'high'>('medium');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            convertToBase64(file);
        }
    };

    const convertToBase64 = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload only image files.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setScreenshot(reader.result as string);
            setErrorMessage(null);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            convertToBase64(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const item = e.clipboardData.items[0];
        if (item && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                convertToBase64(file);
            }
        }
    };

    const handleBugSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bugFeedback.trim() || !bugExpectations.trim()) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        try {
            await submitBugReport(bugFeedback, bugExpectations, screenshot);
            setSuccessMessage('Bug report submitted successfully! Thank you for helping us improve.');
            setBugFeedback('');
            setBugExpectations('');
            setScreenshot(null);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to submit bug report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeatureSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!featureTitle.trim() || !featureDesc.trim()) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        try {
            await submitFeatureRequest(featureTitle, featureDesc, featureCategory, featurePriority);
            setSuccessMessage('Feature request submitted successfully! We review all suggestions.');
            setFeatureTitle('');
            setFeatureDesc('');
            setFeatureCategory('General');
            setFeaturePriority('medium');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feature request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto" onPaste={handlePaste}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl">
                    <Sparkles className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Feedback & Support</h2>
                    <p className="text-sm text-gray-400">Report bugs, submit suggestions, or help us make JobHunter Max even better.</p>
                </div>
            </div>

            {/* Alert Messages */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-950/50 border border-green-500/30 text-green-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                    <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                    <AlertCircle size={20} className="text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-800 mb-8">
                <button
                    onClick={() => { setActiveTab('bug'); setErrorMessage(null); }}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all ${
                        activeTab === 'bug'
                            ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Bug size={18} />
                    Report a Bug
                </button>
                <button
                    onClick={() => { setActiveTab('feature'); setErrorMessage(null); }}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all ${
                        activeTab === 'feature'
                            ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Sparkles size={18} />
                    Feature Request
                </button>
            </div>

            {/* Bug Reporting Tab */}
            {activeTab === 'bug' && (
                <form onSubmit={handleBugSubmit} className="space-y-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            What happened? <span className="text-purple-400">*</span>
                        </label>
                        <p className="text-xs text-gray-500">Provide a clear description of the issue or error you encountered.</p>
                        <textarea
                            value={bugFeedback}
                            onChange={(e) => setBugFeedback(e.target.value)}
                            required
                            placeholder="I clicked on the Search button and the screen went blank..."
                            rows={4}
                            className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            What did you expect to happen? <span className="text-purple-400">*</span>
                        </label>
                        <p className="text-xs text-gray-500">Describe the expected behaviour of the system.</p>
                        <textarea
                            value={bugExpectations}
                            onChange={(e) => setBugExpectations(e.target.value)}
                            required
                            placeholder="I expected to see a list of jobs matching the keywords from my resume..."
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    {/* Screenshot Upload Drop Zone */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            Screenshot of the screen
                        </label>
                        <p className="text-xs text-gray-500">Upload, drag-and-drop, or paste (Ctrl+V / Cmd+V) a screenshot of the error.</p>
                        
                        {!screenshot ? (
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-purple-500/5 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                                onClick={() => document.getElementById('screenshot-upload')?.click()}
                            >
                                <UploadCloud className="text-gray-500 group-hover:text-purple-400 transition-colors" size={36} />
                                <span className="text-sm font-medium text-gray-400">Drag & drop image here or click to browse</span>
                                <span className="text-xs text-gray-600">Supports PNG, JPG, JPEG (Max 5MB)</span>
                                <input
                                    id="screenshot-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="relative border border-gray-700 rounded-xl overflow-hidden bg-gray-900 p-2 max-w-lg">
                                <img
                                    src={screenshot}
                                    alt="Screenshot preview"
                                    className="max-h-64 w-auto rounded-lg object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => setScreenshot(null)}
                                    className="absolute top-4 right-4 p-1.5 bg-gray-800/80 hover:bg-red-600 text-white rounded-full transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/10 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Bug Report'}
                    </button>
                </form>
            )}

            {/* Feature Request Tab */}
            {activeTab === 'feature' && (
                <form onSubmit={handleFeatureSubmit} className="space-y-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            Feature Title <span className="text-purple-400">*</span>
                        </label>
                        <p className="text-xs text-gray-500">Provide a short, descriptive name for the requested feature.</p>
                        <input
                            type="text"
                            value={featureTitle}
                            onChange={(e) => setFeatureTitle(e.target.value)}
                            required
                            placeholder="Add Dark/Light mode toggle..."
                            className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            Detailed Description <span className="text-purple-400">*</span>
                        </label>
                        <p className="text-xs text-gray-500">Explain the goal of the feature and how you visualize it working.</p>
                        <textarea
                            value={featureDesc}
                            onChange={(e) => setFeatureDesc(e.target.value)}
                            required
                            placeholder="It would be awesome if there was a button in the header to toggle dark and light modes, saving preference in local storage..."
                            rows={5}
                            className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-300">
                                Feature Category
                            </label>
                            <select
                                value={featureCategory}
                                onChange={(e) => setFeatureCategory(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            >
                                <option value="Dashboard">Dashboard</option>
                                <option value="Companies">Companies</option>
                                <option value="Calendar">Calendar</option>
                                <option value="Job Search">Job Search</option>
                                <option value="Skill Profiles">Skill Profiles</option>
                                <option value="AI Assistant">AI Assistant</option>
                                <option value="Settings">Settings</option>
                                <option value="General">General / Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-300">
                                Suggested Priority
                            </label>
                            <div className="flex gap-3">
                                {(['low', 'medium', 'high'] as const).map((priority) => (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => setFeaturePriority(priority)}
                                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                                            featurePriority === priority
                                                ? priority === 'low'
                                                    ? 'bg-blue-950 border-blue-500 text-blue-400 shadow-md shadow-blue-500/5'
                                                    : priority === 'medium'
                                                    ? 'bg-yellow-950 border-yellow-500 text-yellow-400 shadow-md shadow-yellow-500/5'
                                                    : 'bg-red-950 border-red-500 text-red-400 shadow-md shadow-red-500/5'
                                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                                        }`}
                                    >
                                        {priority}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/10 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Feature Request'}
                    </button>
                </form>
            )}
        </div>
    );
};
