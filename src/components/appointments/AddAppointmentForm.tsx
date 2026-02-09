import React, { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { useJobStore } from '../../store/useJobStore';
import type { Appointment } from '../../types';

interface AddAppointmentFormProps {
    onClose: () => void;
    preselectedCompanyId?: string;
    preselectedContactId?: string;
}

export const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({
    onClose,
    preselectedCompanyId,
    preselectedContactId
}) => {
    const { companies, addAppointment } = useJobStore();
    const [formData, setFormData] = useState({
        companyId: preselectedCompanyId || '',
        contactId: preselectedContactId || '',
        date: '',
        time: '',
        type: 'Informational' as Appointment['type'],
        notes: '',
    });

    const selectedCompany = companies.find(c => c.id === formData.companyId);
    const availableContacts = selectedCompany?.contacts || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const company = companies.find(c => c.id === formData.companyId);
        const contact = company?.contacts.find(c => c.id === formData.contactId);

        if (!company || !contact) return;

        addAppointment({
            companyId: formData.companyId,
            companyName: company.name,
            contactId: formData.contactId,
            contactName: `${contact.firstName} ${contact.lastName}`,
            date: formData.date,
            time: formData.time,
            type: formData.type,
            notes: formData.notes,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon size={24} />
                        Book Appointment
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Company *</label>
                        <select
                            required
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value, contactId: '' })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select a company</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Contact *</label>
                        <select
                            required
                            value={formData.contactId}
                            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={!formData.companyId}
                        >
                            <option value="">Select a contact</option>
                            {availableContacts.map(contact => (
                                <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName} - {contact.role}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Appointment['type'] })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Informational">Informational</option>
                            <option value="Interview">Interview</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            placeholder="Add any notes about this appointment..."
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
                            Book Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
