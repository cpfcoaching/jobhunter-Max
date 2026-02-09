import React, { useState } from 'react';
import { useJobStore } from '../store/useJobStore';
import { Briefcase } from 'lucide-react';
import type { ApplicationStatus } from '../types';

interface AddApplicationFormProps {
    companyId: string;
    companyName: string;
    onClose: () => void;
}

export const AddApplicationForm: React.FC<AddApplicationFormProps> = ({ companyId, companyName, onClose }) => {
    const { addApplication } = useJobStore();
    const [formData, setFormData] = useState({
        position: '',
        status: 'Applied' as ApplicationStatus,
        appliedDate: new Date().toISOString().split('T')[0],
        jobUrl: '',
        salary: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addApplication(companyId, formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Briefcase size={24} className="text-green-400" />
                        Add Application - {companyName}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Position / Job Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="e.g., Senior Software Engineer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Status *</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="Not Applied">Not Applied</option>
                                <option value="Applied">Applied</option>
                                <option value="Phone Screen">Phone Screen</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Declined">Declined</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Applied Date</label>
                            <input
                                type="date"
                                value={formData.appliedDate}
                                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Job Posting URL</label>
                        <input
                            type="url"
                            value={formData.jobUrl}
                            onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Salary Range</label>
                        <input
                            type="text"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="e.g., $120k - $150k"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                            placeholder="Any additional notes about this application..."
                        />
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
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg shadow-green-500/20"
                        >
                            Add Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
