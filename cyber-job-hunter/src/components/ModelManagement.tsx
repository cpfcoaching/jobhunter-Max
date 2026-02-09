import React, { useState, useEffect } from 'react';
import { Download, Trash2, CheckCircle, Loader, AlertCircle, Star } from 'lucide-react';
import {
    listInstalledModels,
    downloadOllamaModel,
    deleteOllamaModel,
    checkOllamaStatus,
} from '../utils/ai';
import type { ModelInfo } from '../types/ai';

const AVAILABLE_MODELS: Omit<ModelInfo, 'isDownloaded' | 'isDownloading'>[] = [
    {
        name: 'llama3.2',
        displayName: 'Llama 3.2',
        size: '2.0GB',
        provider: 'ollama',
        recommended: true,
        description: 'Recommended - Fast and efficient for most tasks',
    },
    {
        name: 'llama3.1',
        displayName: 'Llama 3.1',
        size: '4.7GB',
        provider: 'ollama',
        description: 'More powerful, better for complex analysis',
    },
    {
        name: 'tinyllama',
        displayName: 'Tiny Llama',
        size: '637MB',
        provider: 'ollama',
        description: 'Lightweight - Great for low-resource systems',
    },
    {
        name: 'phi',
        displayName: 'Phi',
        size: '1.6GB',
        provider: 'ollama',
        description: 'Microsoft\'s efficient small model',
    },
    {
        name: 'mistral',
        displayName: 'Mistral',
        size: '4.1GB',
        provider: 'ollama',
        description: 'High-quality open-source model',
    },
];

const CLOUD_MODELS: Omit<ModelInfo, 'isDownloaded' | 'isDownloading'>[] = [
    {
        name: 'gpt-4',
        displayName: 'GPT-4',
        size: 'Cloud',
        provider: 'openai',
        recommended: true,
        description: 'Most capable OpenAI model',
    },
    {
        name: 'gpt-4o',
        displayName: 'GPT-4o',
        size: 'Cloud',
        provider: 'openai',
        description: 'Optimized for speed and cost',
    },
    {
        name: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        size: 'Cloud',
        provider: 'openai',
        description: 'Fast and cost-effective',
    },
    {
        name: 'deepseek-chat',
        displayName: 'DeepSeek Chat',
        size: 'Cloud',
        provider: 'deepseek',
        recommended: true,
        description: 'General purpose chat model',
    },
    {
        name: 'deepseek-coder',
        displayName: 'DeepSeek Coder',
        size: 'Cloud',
        provider: 'deepseek',
        description: 'Specialized for code and technical content',
    },
];

export const ModelManagement: React.FC = () => {
    const [installedModels, setInstalledModels] = useState<string[]>([]);
    const [downloadingModels, setDownloadingModels] = useState<Map<string, number>>(new Map());
    const [ollamaRunning, setOllamaRunning] = useState(false);

    useEffect(() => {
        loadInstalledModels();
    }, []);

    const loadInstalledModels = async () => {
        const running = await checkOllamaStatus();
        setOllamaRunning(running);

        if (running) {
            const models = await listInstalledModels();
            setInstalledModels(models);
        }
    };

    const handleDownload = async (modelName: string) => {
        setDownloadingModels(new Map(downloadingModels.set(modelName, 0)));

        const success = await downloadOllamaModel(modelName, (progress) => {
            setDownloadingModels(new Map(downloadingModels.set(modelName, progress)));
        });

        if (success) {
            setDownloadingModels((prev) => {
                const newMap = new Map(prev);
                newMap.delete(modelName);
                return newMap;
            });
            await loadInstalledModels();
        }
    };

    const handleDelete = async (modelName: string) => {
        if (!confirm(`Are you sure you want to delete ${modelName}? This cannot be undone.`)) {
            return;
        }

        const success = await deleteOllamaModel(modelName);
        if (success) {
            await loadInstalledModels();
        }
    };

    const isModelDownloaded = (modelName: string) => {
        return installedModels.includes(modelName);
    };

    const isModelDownloading = (modelName: string) => {
        return downloadingModels.has(modelName);
    };

    const getDownloadProgress = (modelName: string) => {
        return downloadingModels.get(modelName) || 0;
    };

    return (
        <div className="space-y-6">
            {/* Ollama Status */}
            {!ollamaRunning && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-yellow-200 font-medium">Ollama is not running</p>
                        <p className="text-yellow-300/70 text-sm mt-1">
                            Please start Ollama to download and manage local models.
                        </p>
                    </div>
                </div>
            )}

            {/* Ollama Models */}
            <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Download size={20} className="text-purple-400" />
                    Ollama Models (Local)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                    {AVAILABLE_MODELS.map((model) => {
                        const downloaded = isModelDownloaded(model.name);
                        const downloading = isModelDownloading(model.name);
                        const progress = getDownloadProgress(model.name);

                        return (
                            <div
                                key={model.name}
                                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className="font-semibold text-white">
                                                {model.displayName}
                                            </h5>
                                            {model.recommended && (
                                                <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                                                    <Star size={12} />
                                                    Recommended
                                                </span>
                                            )}
                                            {downloaded && (
                                                <CheckCircle
                                                    size={16}
                                                    className="text-green-400"
                                                />
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {model.description}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Size: {model.size}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {downloading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-32">
                                                    <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-purple-500 h-full transition-all duration-300"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 text-center">
                                                        {progress}%
                                                    </p>
                                                </div>
                                                <Loader
                                                    size={20}
                                                    className="text-purple-400 animate-spin"
                                                />
                                            </div>
                                        ) : downloaded ? (
                                            <button
                                                onClick={() => handleDelete(model.name)}
                                                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDownload(model.name)}
                                                disabled={!ollamaRunning}
                                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cloud Models */}
            <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Download size={20} className="text-blue-400" />
                    Cloud Models
                </h4>
                <div className="grid grid-cols-1 gap-3">
                    {CLOUD_MODELS.map((model) => (
                        <div
                            key={model.name}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h5 className="font-semibold text-white">
                                            {model.displayName}
                                        </h5>
                                        {model.recommended && (
                                            <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                                                <Star size={12} />
                                                Recommended
                                            </span>
                                        )}
                                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                            {model.provider === 'openai' ? 'OpenAI' : 'DeepSeek'}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {model.description}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Requires API key in Settings
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
