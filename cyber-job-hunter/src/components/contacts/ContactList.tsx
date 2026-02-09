import React, { useState } from 'react';
import { Plus, Mail, Trash2, Linkedin, CalendarClock } from 'lucide-react';
import type { Company } from '../../types';
import { AddContactForm } from './AddContactForm';
import { EmailGenerator } from '../EmailGenerator';
import { useJobStore } from '../../store/useJobStore';
import clsx from 'clsx';
import type { Contact } from '../../types';

interface ContactListProps {
    company: Company;
}

export const ContactList: React.FC<ContactListProps> = ({ company }) => {
    const { deleteContact } = useJobStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [emailContact, setEmailContact] = useState<Contact | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Identified': return 'bg-gray-700 text-gray-300';
            case 'Contacted': return 'bg-blue-900/50 text-blue-300 border-blue-800';
            case 'Meeting Set': return 'bg-purple-900/50 text-purple-300 border-purple-800';
            case 'Referred': return 'bg-green-900/50 text-green-300 border-green-800';
            case 'No Response': return 'bg-red-900/50 text-red-300 border-red-800';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Contacts ({company.contacts.length})</h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={18} /> Add Contact
                </button>
            </div>

            <div className="space-y-4">
                {company.contacts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No contacts added yet.</p>
                ) : (
                    company.contacts.map((contact) => (
                        <div key={contact.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{contact.name}</h4>
                                    <p className="text-sm text-gray-400">{contact.role}</p>
                                    <p className="text-sm text-gray-500 mt-1">{contact.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={clsx('px-2 py-0.5 rounded text-xs border', getStatusColor(contact.status))}>
                                        {contact.status}
                                    </span>
                                    {contact.nextFollowUp && (
                                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                                            <CalendarClock size={12} />
                                            Follow-up: {new Date(contact.nextFollowUp).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
                                {contact.linkedinProfile && (
                                    <a
                                        href={contact.linkedinProfile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/10 rounded-lg transition-colors"
                                        title="LinkedIn Profile"
                                    >
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                <button
                                    onClick={() => setEmailContact(contact)}
                                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                    title="Generate Email"
                                >
                                    <Mail size={18} />
                                    <span className="text-sm">Draft Email</span>
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => deleteContact(company.id, contact.id)}
                                    className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete Contact"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isAddModalOpen && (
                <AddContactForm companyId={company.id} onClose={() => setIsAddModalOpen(false)} />
            )}

            {emailContact && (
                <EmailGenerator
                    contact={emailContact}
                    company={company}
                    onClose={() => setEmailContact(null)}
                />
            )}
        </div>
    );
};
