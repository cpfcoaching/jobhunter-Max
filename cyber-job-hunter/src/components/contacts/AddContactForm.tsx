import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useJobStore } from '../../store/useJobStore';
import type { ContactStatus } from '../../types';

interface AddContactFormProps {
    companyId: string;
    onClose: () => void;
}

export const AddContactForm: React.FC<AddContactFormProps> = ({ companyId, onClose }) => {
    const { addContact } = useJobStore();
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        linkedinProfile: '',
        status: 'Identified' as ContactStatus,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addContact(companyId, {
            ...formData,
            lastContactDate: null,
            nextFollowUp: null,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Add New Contact</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Hiring Manager / Recruiter"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn Profile</label>
                        <input
                            type="url"
                            value={formData.linkedinProfile}
                            onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Initial Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Identified">Identified</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Meeting Set">Meeting Set</option>
                            <option value="Referred">Referred</option>
                            <option value="No Response">No Response</option>
                        </select>
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
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20"
                        >
                            Add Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
