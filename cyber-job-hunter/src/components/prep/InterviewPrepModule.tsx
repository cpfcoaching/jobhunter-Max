import React from 'react';
import type { Company } from '../../types';
import { useJobStore } from '../../store/useJobStore';

interface InterviewPrepModuleProps {
    company: Company;
}

export const InterviewPrepModule: React.FC<InterviewPrepModuleProps> = ({ company }) => {
    const { updateCompany } = useJobStore();
    const { interviewPrep } = company;

    const updateTiara = (field: keyof typeof interviewPrep.tiara, value: string) => {
        updateCompany(company.id, {
            interviewPrep: {
                ...interviewPrep,
                tiara: {
                    ...interviewPrep.tiara,
                    [field]: value,
                },
            },
        });
    };

    const updateQuestion = (field: keyof typeof interviewPrep.commonQuestionsAnswers, value: string) => {
        updateCompany(company.id, {
            interviewPrep: {
                ...interviewPrep,
                commonQuestionsAnswers: {
                    ...interviewPrep.commonQuestionsAnswers,
                    [field]: value,
                },
            },
        });
    };

    return (
        <div className="space-y-12">
            {/* Small Talk Section */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-900/30">
                <h3 className="text-xl font-bold text-white mb-2">Movement #1: Small Talk</h3>
                <p className="text-gray-400 mb-4">Break the ice naturally (~5 mins). Try one of these:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>"How is your day going so far?"</li>
                    <li>"What’s been your path to joining {company.name}?"</li>
                    <li>"What are you working on right now?"</li>
                </ul>
            </div>

            {/* TIARA Framework */}
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Movement #2: TIARA Questions</h3>
                <p className="text-gray-400 mb-6">Ask insightful questions to show expertise and interest.</p>

                <div className="space-y-6">
                    {[
                        { key: 'trends', label: 'Trends', placeholder: 'What trends are impacting the industry right now?' },
                        { key: 'insights', label: 'Insights', placeholder: 'What surprises you most about working here?' },
                        { key: 'advice', label: 'Advice', placeholder: 'What advice would you give someone in my position?' },
                        { key: 'resources', label: 'Resources', placeholder: 'What resources/blogs do you recommend I follow?' },
                        { key: 'assignments', label: 'Assignments', placeholder: 'What projects are critical for the team right now?' },
                    ].map((item) => (
                        <div key={item.key}>
                            <label className="block text-sm font-medium text-blue-400 mb-1 uppercase tracking-wider">{item.label}</label>
                            <textarea
                                value={(interviewPrep.tiara as any)[item.key]}
                                onChange={(e) => updateTiara(item.key as any, e.target.value)}
                                placeholder={`Draft your ${item.label} question: "${item.placeholder}"`}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Common Questions */}
            <div className="border-t border-gray-700 pt-8">
                <h3 className="text-xl font-bold text-white mb-2">Prepare Your Answers</h3>
                <p className="text-gray-400 mb-6">Be ready for these common questions.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { key: 'tellMeAboutYourself', label: 'Tell me about yourself' },
                        { key: 'whyUs', label: `Why ${company.name}?` },
                        { key: 'whyRole', label: 'Why this role?' },
                        { key: 'whyIndustry', label: 'Why this industry?' },
                    ].map((item) => (
                        <div key={item.key}>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{item.label}</label>
                            <textarea
                                value={(interviewPrep.commonQuestionsAnswers as any)[item.key]}
                                onChange={(e) => updateQuestion(item.key as any, e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Closing */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">Movement #3: Next Steps</h3>
                <ul className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>If a referral is offered, commit to follow up in <strong>two weeks</strong>.</li>
                    <li>If not, transition to "Two-Part Informational Closing".</li>
                    <li>Send a thank-you note within <strong>24 hours</strong>.</li>
                    <li>Log your notes and set a follow-up reminder!</li>
                </ul>
            </div>
        </div>
    );
};
