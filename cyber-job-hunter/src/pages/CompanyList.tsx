import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useJobStore } from '../store/useJobStore';
import { CompanyCard } from '../components/CompanyCard';
import { AddCompanyForm } from '../components/AddCompanyForm';

export const CompanyList: React.FC = () => {
    const { companies } = useJobStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Sort companies by effective rating (descending)
    const sortedCompanies = [...companies]
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const ratingA = a.rating - (a.relocationUncertain ? 0.5 : 0);
            const ratingB = b.rating - (b.relocationUncertain ? 0.5 : 0);
            return ratingB - ratingA;
        });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Target Companies</h2>
                    <p className="text-gray-400 mt-1">Track and prioritize your potential employers</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                    <Plus size={20} />
                    Add Company
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {sortedCompanies.length === 0 ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No companies found</h3>
                    <p className="text-gray-400 mb-6">Get started by adding companies you're interested in.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                    >
                        Add your first company
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCompanies.map((company) => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            )}

            {isAddModalOpen && (
                <AddCompanyForm onClose={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
};
