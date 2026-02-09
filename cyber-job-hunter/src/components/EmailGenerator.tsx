import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { Contact, Company } from '../types';

interface EmailGeneratorProps {
    contact: Contact;
    company: Company;
    onClose: () => void;
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ contact, company, onClose }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Default template from requirements
        setSubject(`Quick question - ${company.name}`);
        setBody(`Hi ${contact.name},

I hope you're doing well! I truly value your insights and would love to hear your advice. Given your experience with ${company.name}, could you share any tips or guidance? I’m interested in understanding both the specific roles and the broader picture of the company.

Thanks so much!`);
    }, [contact, company]);

    const handleCopy = () => {
        const fullText = `Subject: ${subject}\n\n${body}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Draft Email</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">To</label>
                        <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-300">
                            {contact.name} &lt;{contact.email}&gt;
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                        <textarea
                            rows={10}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
