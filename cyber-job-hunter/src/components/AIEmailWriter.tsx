import React, { useState } from 'react';
import { Mail, Wand2, Copy, Send, Loader2 } from 'lucide-react';
import { useJobStore } from '../store/useJobStore';
import type { Contact } from '../types';

interface AIEmailWriterProps {
    contact?: Contact;
    companyName?: string;
    purpose?: 'introduction' | 'follow-up' | 'thank-you' | 'application' | 'custom';
    onClose: () => void;
    onSend?: (email: { to: string; subject: string; body: string }) => void;
}

export const AIEmailWriter: React.FC<AIEmailWriterProps> = ({
    contact,
    companyName,
    purpose = 'custom',
    onClose,
    onSend,
}) => {
    const { aiSettings } = useJobStore();
    const [emailData, setEmailData] = useState({
        to: contact?.email || '',
        subject: '',
        body: '',
    });
    const [customPrompt, setCustomPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const purposeTemplates = {
        introduction: 'Write a professional introduction email',
        'follow-up': 'Write a follow-up email after a previous conversation',
        'thank-you': 'Write a thank you email after an interview',
        application: 'Write a job application email',
        custom: 'Write a professional email',
    };

    const handleGenerateEmail = async () => {
        setIsGenerating(true);
        try {
            const prompt = customPrompt || purposeTemplates[purpose];
            const context = `
Contact: ${contact?.firstName} ${contact?.lastName}
Company: ${companyName || 'the company'}
Role: ${contact?.role || 'Hiring Manager'}

${prompt}
            `.trim();

            // Simulate AI generation (replace with actual AI call)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const generatedSubject = getGeneratedSubject(purpose, companyName);
            const generatedBody = getGeneratedBody(purpose, contact, companyName);

            setEmailData({
                ...emailData,
                subject: generatedSubject,
                body: generatedBody,
            });
        } catch (error) {
            console.error('Failed to generate email:', error);
            alert('Failed to generate email. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        const fullEmail = `To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
        navigator.clipboard.writeText(fullEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = () => {
        if (onSend) {
            onSend(emailData);
        } else {
            // Open default email client
            const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(
                emailData.subject
            )}&body=${encodeURIComponent(emailData.body)}`;
            window.location.href = mailtoLink;
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mail size={24} className="text-blue-400" />
                        AI Email Writer
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl">
                        ×
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* AI Settings Info */}
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-sm text-purple-300">
                            ✨ Using {aiSettings.provider} ({aiSettings.model || 'default model'}) to generate emails
                        </p>
                    </div>

                    {/* Email Purpose */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Purpose</label>
                        <select
                            value={purpose}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled
                        >
                            <option value="introduction">Introduction</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="thank-you">Thank You</option>
                            <option value="application">Job Application</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Custom Prompt */}
                    {purpose === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Custom Instructions (Optional)
                            </label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                placeholder="E.g., Mention my recent project experience..."
                            />
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerateEmail}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Generate Email with AI
                            </>
                        )}
                    </button>

                    {/* Email Form */}
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">To</label>
                            <input
                                type="email"
                                value={emailData.to}
                                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="recipient@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                            <input
                                type="text"
                                value={emailData.subject}
                                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Email subject"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                            <textarea
                                value={emailData.body}
                                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-64 resize-none font-mono text-sm"
                                placeholder="Email body"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            <Copy size={18} />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!emailData.to || !emailData.subject || !emailData.body}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                            <Send size={18} />
                            Send Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions for email generation (simplified - replace with actual AI)
function getGeneratedSubject(purpose: string, companyName?: string): string {
    const subjects = {
        introduction: `Introduction - Exploring Opportunities at ${companyName || 'Your Company'}`,
        'follow-up': `Following Up on Our Recent Conversation`,
        'thank-you': `Thank You for the Interview Opportunity`,
        application: `Application for Position at ${companyName || 'Your Company'}`,
        custom: `Professional Inquiry`,
    };
    return subjects[purpose as keyof typeof subjects] || subjects.custom;
}

function getGeneratedBody(purpose: string, contact?: Contact, companyName?: string): string {
    const name = contact ? `${contact.firstName} ${contact.lastName}` : 'Hiring Manager';

    const templates = {
        introduction: `Dear ${name},

I hope this email finds you well. I am reaching out to express my interest in potential opportunities at ${companyName || 'your company'}.

With my background in [Your Field], I believe I could contribute significantly to your team. I would love the opportunity to discuss how my skills and experience align with your company's goals.

Would you be available for a brief call in the coming weeks?

Best regards,
[Your Name]`,
        'follow-up': `Dear ${name},

I wanted to follow up on our recent conversation regarding [Topic]. I've been thinking about our discussion and wanted to share some additional thoughts.

[Add your follow-up points here]

I look forward to hearing from you.

Best regards,
[Your Name]`,
        'thank-you': `Dear ${name},

Thank you for taking the time to meet with me regarding the [Position] role at ${companyName || 'your company'}. I enjoyed our conversation and learning more about the team and the exciting work you're doing.

I am very enthusiastic about the opportunity to contribute to [specific project or goal discussed]. Please let me know if you need any additional information from me.

I look forward to hearing from you.

Best regards,
[Your Name]`,
        application: `Dear ${name},

I am writing to express my strong interest in the [Position] role at ${companyName || 'your company'}. With my experience in [Your Field] and passion for [Industry/Technology], I am confident I would be a valuable addition to your team.

[Highlight 2-3 key qualifications]

I have attached my resume for your review. I would welcome the opportunity to discuss how my background aligns with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`,
        custom: `Dear ${name},

[Your message here]

Best regards,
[Your Name]`,
    };

    return templates[purpose as keyof typeof templates] || templates.custom;
}
