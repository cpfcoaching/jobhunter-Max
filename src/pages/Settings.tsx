import React, { useState, useEffect } from 'react';
import { useJobStore } from '../store/useJobStore';
import { Settings as SettingsIcon, Brain, Mail, Linkedin, CheckCircle, XCircle, Download, Lock } from 'lucide-react';
import { fetchOllamaModels, checkIfOllamaModelIsRunning, keepOllamaModelAlive } from '../utils/ai';
import { storeApiKey, checkApiKey, deleteApiKey } from '../utils/backend-api';
import type { AiProvider } from '../types/ai';
import { ModelManagement } from '../components/ModelManagement';

export const Settings: React.FC = () => {
    const { aiSettings, updateAiSettings } = useJobStore();
    const [selectedProvider, setSelectedProvider] = useState<AiProvider>(aiSettings.provider);
    const [selectedModel, setSelectedModel] = useState<string | undefined>(aiSettings.model);
    const [ollamaModels, setOllamaModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [modelStatus, setModelStatus] = useState<{
        isRunning: boolean;
        runningModelName?: string;
        error?: string;
    }>({ isRunning: false });

    // API Key management
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [deepseekApiKey, setDeepseekApiKey] = useState('');
    const [openaiKeyConfigured, setOpenaiKeyConfigured] = useState(false);
    const [deepseekKeyConfigured, setDeepseekKeyConfigured] = useState(false);
    const [isSavingApiKey, setIsSavingApiKey] = useState(false);
    const [apiKeyMessage, setApiKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Email integration settings
    const [emailSettings, setEmailSettings] = useState({
        provider: 'gmail',
        email: '',
        connected: false,
    });

    // LinkedIn integration settings
    const [linkedInSettings, setLinkedInSettings] = useState({
        connected: false,
        profileUrl: '',
    });

    useEffect(() => {
        if (selectedProvider === 'ollama') {
            loadOllamaModels();
        }
    }, [selectedProvider]);

    useEffect(() => {
        if (selectedProvider === 'ollama' && selectedModel) {
            checkModelStatus();
        }
    }, [selectedModel, selectedProvider]);

    // Check API key status on component mount
    useEffect(() => {
        checkApiKeyStatus();
    }, []);

    const checkApiKeyStatus = async () => {
        try {
            const openaiConfigured = await checkApiKey('openai');
            const deepseekConfigured = await checkApiKey('deepseek');
            setOpenaiKeyConfigured(openaiConfigured);
            setDeepseekKeyConfigured(deepseekConfigured);
        } catch (error) {
            console.error('Failed to check API key status:', error);
        }
    };

    const handleSaveApiKey = async (provider: 'openai' | 'deepseek') => {
        const apiKey = provider === 'openai' ? openaiApiKey : deepseekApiKey;

        if (!apiKey.trim()) {
            setApiKeyMessage({ type: 'error', text: 'Please enter an API key' });
            return;
        }

        setIsSavingApiKey(true);
        try {
            await storeApiKey(provider, apiKey);
            setApiKeyMessage({
                type: 'success',
                text: `${provider === 'openai' ? 'OpenAI' : 'DeepSeek'} API key saved securely!`,
            });

            // Clear the input field and update status
            if (provider === 'openai') {
                setOpenaiApiKey('');
                setOpenaiKeyConfigured(true);
            } else {
                setDeepseekApiKey('');
                setDeepseekKeyConfigured(true);
            }

            // Clear message after 3 seconds
            setTimeout(() => setApiKeyMessage(null), 3000);
        } catch (error) {
            setApiKeyMessage({
                type: 'error',
                text: `Failed to save API key: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        } finally {
            setIsSavingApiKey(false);
        }
    };

    const handleDeleteApiKey = async (provider: 'openai' | 'deepseek') => {
        if (!window.confirm(`Delete ${provider} API key?`)) {
            return;
        }

        try {
            await deleteApiKey(provider);
            if (provider === 'openai') {
                setOpenaiKeyConfigured(false);
            } else {
                setDeepseekKeyConfigured(false);
            }
            setApiKeyMessage({
                type: 'success',
                text: `${provider === 'openai' ? 'OpenAI' : 'DeepSeek'} API key deleted`,
            });
            setTimeout(() => setApiKeyMessage(null), 3000);
        } catch (error) {
            setApiKeyMessage({
                type: 'error',
                text: `Failed to delete API key: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
    };

    const loadOllamaModels = async () => {
        setIsLoadingModels(true);
        try {
            const models = await fetchOllamaModels();
            setOllamaModels(models);

            // Auto-select first model if none selected
            if (models.length > 0 && !selectedModel) {
                setSelectedModel(models[0]);
            }
        } catch (error) {
            console.error('Failed to load Ollama models:', error);
        } finally {
            setIsLoadingModels(false);
        }
    };

    const checkModelStatus = async () => {
        if (!selectedModel) return;

        const status = await checkIfOllamaModelIsRunning(selectedModel);
        setModelStatus(status);

        if (status.isRunning && status.runningModelName) {
            await keepOllamaModelAlive(status.runningModelName);
        }
    };

    const handleSaveAiSettings = () => {
        updateAiSettings({
            provider: selectedProvider,
            model: selectedModel,
        });
        alert('AI settings saved successfully!');
    };

    const handleConnectEmail = () => {
        // Placeholder for email OAuth integration
        alert('Email integration coming soon! This will connect to your email provider.');
        setEmailSettings({ ...emailSettings, connected: true });
    };

    const handleConnectLinkedIn = () => {
        // Placeholder for LinkedIn OAuth integration
        alert('LinkedIn integration coming soon! This will connect to your LinkedIn account.');
        setLinkedInSettings({ ...linkedInSettings, connected: true });
    };

    const handleDownloadSetupScript = () => {
        const platform = navigator.platform.toLowerCase();
        const isWindows = platform.includes('win');
        const scriptName = isWindows ? 'setup-ollama.bat' : 'setup-ollama.sh';

        // Create download link
        const link = document.createElement('a');
        link.href = `/${scriptName}`;
        link.download = scriptName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`Downloaded ${scriptName}! Run this script to automatically set up Ollama with llama3.2.`);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <SettingsIcon size={32} className="text-blue-400" />
                <h2 className="text-3xl font-bold text-white">Settings</h2>
            </div>

            <div className="space-y-6">
                {/* AI Settings Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Brain size={24} className="text-purple-400" />
                        AI Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                AI Provider
                            </label>
                            <select
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value as AiProvider)}
                                className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value="ollama">Ollama (Local)</option>
                                <option value="openai">OpenAI</option>
                                <option value="deepseek">DeepSeek</option>
                            </select>
                        </div>

                        {selectedProvider === 'ollama' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Model
                                </label>
                                <select
                                    value={selectedModel || ''}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={isLoadingModels || ollamaModels.length === 0}
                                    className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                                >
                                    {isLoadingModels ? (
                                        <option>Loading models...</option>
                                    ) : ollamaModels.length === 0 ? (
                                        <option>No models found</option>
                                    ) : (
                                        ollamaModels.map((model) => (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        ))
                                    )}
                                </select>

                                {modelStatus.isRunning && modelStatus.runningModelName && (
                                    <div className="flex items-center gap-2 text-green-400 text-sm mt-2">
                                        <CheckCircle size={16} />
                                        <span>{modelStatus.runningModelName} is running</span>
                                    </div>
                                )}

                                {modelStatus.error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                        <XCircle size={16} />
                                        <span>{modelStatus.error}</span>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-2">
                                    Make sure Ollama is installed and running. Visit{' '}
                                    <a
                                        href="https://ollama.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:underline"
                                    >
                                        ollama.com
                                    </a>{' '}
                                    to get started.
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'openai' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <Lock size={16} />
                                    OpenAI API Key (Securely Stored)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="sk-..."
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        onClick={() => handleSaveApiKey('openai')}
                                        disabled={isSavingApiKey || !openaiApiKey.trim()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isSavingApiKey ? 'Saving...' : 'Save'}
                                    </button>
                                    {openaiKeyConfigured && (
                                        <button
                                            onClick={() => handleDeleteApiKey('openai')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                {openaiKeyConfigured && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <CheckCircle size={14} /> API key is configured
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Get your API key from{' '}
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:underline"
                                    >
                                        OpenAI Platform
                                    </a>
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'deepseek' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <Lock size={16} />
                                    DeepSeek API Key (Securely Stored)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="Enter your DeepSeek API key"
                                        value={deepseekApiKey}
                                        onChange={(e) => setDeepseekApiKey(e.target.value)}
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        onClick={() => handleSaveApiKey('deepseek')}
                                        disabled={isSavingApiKey || !deepseekApiKey.trim()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isSavingApiKey ? 'Saving...' : 'Save'}
                                    </button>
                                    {deepseekKeyConfigured && (
                                        <button
                                            onClick={() => handleDeleteApiKey('deepseek')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                {deepseekKeyConfigured && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <CheckCircle size={14} /> API key is configured
                                    </p>
                                )}
                            </div>
                        )}

                        {apiKeyMessage && (
                            <div
                                className={`p-3 rounded-lg text-sm ${
                                    apiKeyMessage.type === 'success'
                                        ? 'bg-green-900 text-green-200'
                                        : 'bg-red-900 text-red-200'
                                }`}
                            >
                                {apiKeyMessage.text}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveAiSettings}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/20 transition-colors"
                            >
                                Save AI Settings
                            </button>

                            {selectedProvider === 'ollama' && (
                                <button
                                    onClick={handleDownloadSetupScript}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Download size={18} />
                                    Download Setup Script
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Model Management Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Brain size={24} className="text-purple-400" />
                        Model Management
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Download and manage AI models for local and cloud providers.
                    </p>
                    <ModelManagement />
                </div>

                {/* Email Integration Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Mail size={24} className="text-blue-400" />
                        Email Integration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email Provider
                            </label>
                            <select
                                value={emailSettings.provider}
                                onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
                                className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="gmail">Gmail</option>
                                <option value="outlook">Outlook</option>
                                <option value="yahoo">Yahoo Mail</option>
                            </select>
                        </div>

                        {emailSettings.connected ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle size={20} />
                                <span>Connected to {emailSettings.provider}</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnectEmail}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors"
                            >
                                Connect {emailSettings.provider}
                            </button>
                        )}

                        <p className="text-sm text-gray-400">
                            Connect your email to send job applications and follow-ups directly from JobHunter Max.
                        </p>
                    </div>
                </div>

                {/* LinkedIn Integration Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <Linkedin size={24} className="text-blue-500" />
                        LinkedIn Integration
                    </h3>

                    <div className="space-y-4">
                        {linkedInSettings.connected ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle size={20} />
                                <span>Connected to LinkedIn</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnectLinkedIn}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors"
                            >
                                Connect LinkedIn
                            </button>
                        )}

                        <p className="text-sm text-gray-400">
                            Connect your LinkedIn account to import connections and send InMail messages.
                        </p>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>

                    <div className="space-y-4">
                        <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                            Export Data
                        </button>

                        <button className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors">
                            Clear All Data
                        </button>

                        <p className="text-sm text-gray-400">
                            Export your data as JSON or clear all stored information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
