import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobStore } from '../store/useJobStore';
import { ArrowLeft, Users, FileText, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import { ContactList } from '../components/contacts/ContactList';
import { ResearchModule } from '../components/research/ResearchModule';
import { InterviewPrepModule } from '../components/prep/InterviewPrepModule';

export const CompanyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const company = useJobStore((state) => state.companies.find((c) => c.id === id));
    const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'prep'>('contacts');

    if (!company) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-white mb-4">Company not found</h2>
                <button onClick={() => navigate('/companies')} className="text-blue-400 hover:underline">
                    Back to list
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <button
                    onClick={() => navigate('/companies')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Companies
                </button>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    {company.name}
                    <span className="text-lg font-normal text-gray-400 bg-gray-800 px-3 py-0.5 rounded-full border border-gray-700">
                        {company.industry}
                    </span>
                </h1>
            </div>

            <div className="flex gap-4 border-b border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors',
                        activeTab === 'contacts'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                    )}
                >
                    <Users size={18} /> Contacts
                </button>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors',
                        activeTab === 'overview'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                    )}
                >
                    <FileText size={18} /> Research
                </button>
                <button
                    onClick={() => setActiveTab('prep')}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors',
                        activeTab === 'prep'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                    )}
                >
                    <CheckSquare size={18} /> Interview Prep
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-[400px] mb-8">
                {activeTab === 'contacts' && <ContactList company={company} />}
                {activeTab === 'overview' && <ResearchModule company={company} />}
                {activeTab === 'prep' && <InterviewPrepModule company={company} />}
            </div>
        </div>
    );
};
