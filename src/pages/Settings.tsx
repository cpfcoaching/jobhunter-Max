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
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [claudeApiKey, setClaudeApiKey] = useState('');
    const [cohereApiKey, setCohereApiKey] = useState('');
    const [openaiKeyConfigured, setOpenaiKeyConfigured] = useState(false);
    const [deepseekKeyConfigured, setDeepseekKeyConfigured] = useState(false);
    const [geminiKeyConfigured, setGeminiKeyConfigured] = useState(false);
    const [claudeKeyConfigured, setClaudeKeyConfigured] = useState(false);
    const [cohereKeyConfigured, setCohereKeyConfigured] = useState(false);
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

    // Handle provider changes, model updates, and auto-save AI settings
    useEffect(() => {
        const defaultModels: Record<AiProvider, string> = {
            'ollama': 'llama3.2',
            'openai': 'gpt-4o-mini',
            'deepseek': 'deepseek-chat',
            'gemini': 'gemini-flash-latest',
            'claude': 'claude-3-haiku-20240307',
            'cohere': 'command-light'
        };

        // Set default model for the selected provider
        setSelectedModel(defaultModels[selectedProvider]);

        // Load Ollama models if provider is Ollama
        if (selectedProvider === 'ollama') {
            loadOllamaModels();
        }

        // Auto-save AI settings
        if (selectedProvider && selectedModel) {
            updateAiSettings({
                provider: selectedProvider,
                model: selectedModel,
            });

            // Check Ollama model status if Ollama is selected
            if (selectedProvider === 'ollama') {
                checkModelStatus();
            }
        }
    }, [selectedProvider, selectedModel, updateAiSettings]);

    // Check API key status on component mount
    useEffect(() => {
        checkApiKeyStatus();
    }, []);

    const checkApiKeyStatus = async () => {
        try {
            const [openaiConfigured, deepseekConfigured, geminiConfigured, claudeConfigured, cohereConfigured] = await Promise.all([
                checkApiKey('openai'),
                checkApiKey('deepseek'),
                checkApiKey('gemini'),
                checkApiKey('claude'),
                checkApiKey('cohere'),
            ]);
            setOpenaiKeyConfigured(openaiConfigured);
            setDeepseekKeyConfigured(deepseekConfigured);
            setGeminiKeyConfigured(geminiConfigured);
            setClaudeKeyConfigured(claudeConfigured);
            setCohereKeyConfigured(cohereConfigured);
        } catch (error) {
            console.error('Failed to check API key status:', error);
        }
    };

    const handleSaveApiKey = async (provider: 'openai' | 'deepseek' | 'gemini' | 'claude' | 'cohere') => {
        const apiKey = provider === 'openai' ? openaiApiKey
            : provider === 'deepseek' ? deepseekApiKey
                : provider === 'gemini' ? geminiApiKey
                    : provider === 'claude' ? claudeApiKey
                        : cohereApiKey;

        if (!apiKey.trim()) {
            setApiKeyMessage({ type: 'error', text: 'Please enter an API key' });
            return;
        }

        setIsSavingApiKey(true);
        try {
            await storeApiKey(provider, apiKey);
            const providerName = provider === 'openai' ? 'OpenAI'
                : provider === 'deepseek' ? 'DeepSeek'
                    : provider === 'gemini' ? 'Google Gemini'
                        : provider === 'claude' ? 'Anthropic Claude'
                            : 'Cohere';
            setApiKeyMessage({
                type: 'success',
                text: `${providerName} API key saved securely!`,
            });

            // Clear the input field and update status
            if (provider === 'openai') {
                setOpenaiApiKey('');
                setOpenaiKeyConfigured(true);
            } else if (provider === 'deepseek') {
                setDeepseekApiKey('');
                setDeepseekKeyConfigured(true);
            } else if (provider === 'gemini') {
                setGeminiApiKey('');
                setGeminiKeyConfigured(true);
            } else if (provider === 'claude') {
                setClaudeApiKey('');
                setClaudeKeyConfigured(true);
            } else if (provider === 'cohere') {
                setCohereApiKey('');
                setCohereKeyConfigured(true);
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

    const handleDeleteApiKey = async (provider: 'openai' | 'deepseek' | 'gemini' | 'claude' | 'cohere') => {
        const providerName = provider === 'openai' ? 'OpenAI'
            : provider === 'deepseek' ? 'DeepSeek'
                : provider === 'gemini' ? 'Google Gemini'
                    : provider === 'claude' ? 'Anthropic Claude'
                        : 'Cohere';

        if (!window.confirm(`Delete ${providerName} API key?`)) {
            return;
        }

        try {
            await deleteApiKey(provider);
            if (provider === 'openai') {
                setOpenaiKeyConfigured(false);
            } else if (provider === 'deepseek') {
                setDeepseekKeyConfigured(false);
            } else if (provider === 'gemini') {
                setGeminiKeyConfigured(false);
            } else if (provider === 'claude') {
                setClaudeKeyConfigured(false);
            } else if (provider === 'cohere') {
                setCohereKeyConfigured(false);
            }
            setApiKeyMessage({
                type: 'success',
                text: `${providerName} API key deleted`,
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
                                <option value="gemini">Google Gemini</option>
                                <option value="claude">Anthropic Claude</option>
                                <option value="cohere">Cohere</option>
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
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Model
                                </label>
                                <select
                                    value={selectedModel || 'gpt-4o-mini'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select the OpenAI model to use for AI-powered features
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'deepseek' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Model
                                </label>
                                <select
                                    value={selectedModel || 'deepseek-chat'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="deepseek-chat">DeepSeek Chat (Recommended)</option>
                                    <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                                    <option value="deepseek-coder">DeepSeek Coder</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select the DeepSeek model to use for AI-powered features
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'gemini' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Model
                                </label>
                                <select
                                    value={selectedModel || 'gemini-flash-latest'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="gemini-flash-latest">Gemini Flash (Latest)</option>
                                    <option value="gemini-flash-lite-latest">Gemini Flash-Lite (Latest)</option>
                                    <option value="gemini-pro-latest">Gemini Pro (Latest)</option>
                                    <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
                                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
                                    <option value="gemini-3-pro-preview">Gemini 3 Pro (Preview)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select the Google Gemini model to use. Try "Flash (Latest)" for best performance.
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'claude' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Model
                                </label>
                                <select
                                    value={selectedModel || 'claude-3-haiku-20240307'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="claude-3-haiku-20240307">Claude 3 Haiku (Recommended)</option>
                                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select the Anthropic Claude model to use for AI-powered features
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'cohere' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Model
                                </label>
                                <select
                                    value={selectedModel || 'command-light'}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full md:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="command-light">Command Light (Recommended)</option>
                                    <option value="command">Command</option>
                                    <option value="command-r">Command R</option>
                                    <option value="command-r-plus">Command R+</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Select the Cohere model to use for AI-powered features
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

                        {selectedProvider === 'gemini' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <Lock size={16} />
                                    Google Gemini API Key (Securely Stored)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="Enter your Gemini API key"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        onClick={() => handleSaveApiKey('gemini')}
                                        disabled={isSavingApiKey || !geminiApiKey.trim()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isSavingApiKey ? 'Saving...' : 'Save'}
                                    </button>
                                    {geminiKeyConfigured && (
                                        <button
                                            onClick={() => handleDeleteApiKey('gemini')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                {geminiKeyConfigured && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <CheckCircle size={14} /> API key is configured
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Get your API key from{' '}
                                    <a
                                        href="https://makersuite.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:underline"
                                    >
                                        Google AI Studio
                                    </a>
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'claude' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <Lock size={16} />
                                    Anthropic Claude API Key (Securely Stored)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="Enter your Claude API key"
                                        value={claudeApiKey}
                                        onChange={(e) => setClaudeApiKey(e.target.value)}
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        onClick={() => handleSaveApiKey('claude')}
                                        disabled={isSavingApiKey || !claudeApiKey.trim()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isSavingApiKey ? 'Saving...' : 'Save'}
                                    </button>
                                    {claudeKeyConfigured && (
                                        <button
                                            onClick={() => handleDeleteApiKey('claude')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                {claudeKeyConfigured && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <CheckCircle size={14} /> API key is configured
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Get your API key from{' '}
                                    <a
                                        href="https://console.anthropic.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:underline"
                                    >
                                        Anthropic Console
                                    </a>
                                </p>
                            </div>
                        )}

                        {selectedProvider === 'cohere' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                    <Lock size={16} />
                                    Cohere API Key (Securely Stored)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="Enter your Cohere API key"
                                        value={cohereApiKey}
                                        onChange={(e) => setCohereApiKey(e.target.value)}
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        onClick={() => handleSaveApiKey('cohere')}
                                        disabled={isSavingApiKey || !cohereApiKey.trim()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isSavingApiKey ? 'Saving...' : 'Save'}
                                    </button>
                                    {cohereKeyConfigured && (
                                        <button
                                            onClick={() => handleDeleteApiKey('cohere')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                {cohereKeyConfigured && (
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <CheckCircle size={14} /> API key is configured
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Get your API key from{' '}
                                    <a
                                        href="https://dashboard.cohere.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:underline"
                                    >
                                        Cohere Dashboard
                                    </a>
                                </p>
                            </div>
                        )}

                        {apiKeyMessage && (
                            <div
                                className={`p-3 rounded-lg text-sm ${apiKeyMessage.type === 'success'
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
