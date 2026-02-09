import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useJobStore } from '../store/useJobStore';
import type { Rating } from '../types';
import { StarRating } from './StarRating';

interface AddCompanyFormProps {
    onClose: () => void;
}

export const AddCompanyForm: React.FC<AddCompanyFormProps> = ({ onClose }) => {
    const { addCompany } = useJobStore();
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        location: '',
        website: '',
        rating: 0 as Rating,
        relocationUncertain: false,
        linkedinConnection: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addCompany(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Add New Company</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Company Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Cybersecurity"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="City, State"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="py-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Interest Rating</label>
                        <div className="flex items-center gap-3">
                            <StarRating
                                rating={formData.rating}
                                onRate={(r) => setFormData({ ...formData, rating: r as Rating })}
                                size={24}
                            />
                            <span className="text-gray-500 text-sm">({formData.rating}/3)</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.relocationUncertain}
                                onChange={(e) => setFormData({ ...formData, relocationUncertain: e.target.checked })}
                                className="rounded bg-gray-700 border-gray-600 text-blue-500"
                            />
                            Relocation allows uncertainty (-0.5 penalty)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.linkedinConnection}
                                onChange={(e) => setFormData({ ...formData, linkedinConnection: e.target.checked })}
                                className="rounded bg-gray-700 border-gray-600 text-blue-500"
                            />
                            I have a LinkedIn connection
                        </label>
                    </div>

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
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                        >
                            Add Company
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
