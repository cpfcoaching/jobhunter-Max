import React from 'react';
import type { Company } from '../../types';
import { useJobStore } from '../../store/useJobStore';
import { CheckCircle, Circle, ExternalLink } from 'lucide-react';

interface ResearchModuleProps {
    company: Company;
}

export const ResearchModule: React.FC<ResearchModuleProps> = ({ company }) => {
    const { updateCompany } = useJobStore();
    const { interviewPrep } = company;

    const toggleCheck = (field: 'investorRelationsReviewed' | 'headlinesReviewed') => {
        updateCompany(company.id, {
            interviewPrep: {
                ...interviewPrep,
                [field]: !interviewPrep[field],
            },
        });
    };

    const researchItems = [
        {
            id: 'investorRelationsReviewed',
            label: 'Review Investor Relations / About Us Page',
            checked: interviewPrep.investorRelationsReviewed,
            description: 'Look for company mission, recent funding, annual reports, or strategic goals.',
        },
        {
            id: 'headlinesReviewed',
            label: 'Review Recent News Headlines',
            checked: interviewPrep.headlinesReviewed,
            description: 'Check their homepage and Google News for positive/negative press.',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Research Checklist</h3>
                <p className="text-gray-400 mb-6">Spend ~15 minutes researching the company before your informational interview.</p>

                <div className="space-y-4">
                    {researchItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => toggleCheck(item.id as any)}
                            className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors"
                        >
                            <div className="mt-1">
                                {item.checked ? (
                                    <CheckCircle className="text-green-400" size={24} />
                                ) : (
                                    <Circle className="text-gray-600" size={24} />
                                )}
                            </div>
                            <div>
                                <h4 className={`text-lg font-medium ${item.checked ? 'text-white' : 'text-gray-300'}`}>
                                    {item.label}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            </div>
                        </div>
                    ))}

                    <div className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <div className="mt-1">
                            <ExternalLink className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-gray-300">Google Search</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Search for <span className="text-white font-mono">"{company.name} reviews"</span> and <span className="text-white font-mono">"{company.name} news"</span>.
                                Also research your interviewer if known.
                            </p>
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(company.name + ' news')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-sm mt-2 inline-block"
                            >
                                Search Google News &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-4">Research Notes</h3>
                <textarea
                    value={company.notes || ''}
                    onChange={(e) => updateCompany(company.id, { notes: e.target.value })}
                    placeholder="Jot down key findings, questions, or red flags here..."
                    className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
            </div>
        </div>
    );
};
