import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useJobStore } from '../../store/useJobStore';
import type { ContactStatus } from '../../types';

interface AddContactFormProps {
    companyId?: string;
    onClose: () => void;
}

export const AddContactForm: React.FC<AddContactFormProps> = ({ companyId, onClose }) => {
    const { addContact, companies } = useJobStore();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        role: '',
        email: '',
        phone: '',
        linkedinProfile: '',
        status: 'Identified' as ContactStatus,
        channel: undefined as any,
        notes: '',
        selectedCompanyId: companyId || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.selectedCompanyId) {
            alert('Please select a company');
            return;
        }
        addContact(formData.selectedCompanyId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            email: formData.email,
            phone: formData.phone,
            linkedinProfile: formData.linkedinProfile,
            status: formData.status,
            channel: formData.channel,
            notes: formData.notes,
            lastContactDate: null,
            nextFollowUp: null,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-white">Add New Contact</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {!companyId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Company *</label>
                            <select
                                required
                                value={formData.selectedCompanyId}
                                onChange={(e) => setFormData({ ...formData, selectedCompanyId: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select a company</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role / Title</label>
                        <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Hiring Manager / Recruiter"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="(555) 123-4567"
                            />
                        </div>
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

                    <div className="grid grid-cols-2 gap-4">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Contact Channel</label>
                            <select
                                value={formData.channel || ''}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Not specified</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Email">Email</option>
                                <option value="Text">Text</option>
                                <option value="Phone">Phone</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            placeholder="Add any notes about this contact..."
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
