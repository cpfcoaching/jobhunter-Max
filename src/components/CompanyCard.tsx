import React from 'react';
import { MapPin, Globe, Trash2, ArrowRight } from 'lucide-react';
import type { Company } from '../types';
import { StarRating } from './StarRating';
import { useJobStore } from '../store/useJobStore';


interface CompanyCardProps {
    company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
    const { updateCompany, deleteCompany } = useJobStore();

    const effectiveRating = company.rating - (company.relocationUncertain ? 0.5 : 0);

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {company.name}
                        {company.linkedinConnection && (
                            <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-800">
                                Connected
                            </span>
                        )}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                        {company.industry || 'Industry not specified'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2" title={`Base Rating: ${company.rating} - Relocation Penalty: ${company.relocationUncertain ? 0.5 : 0}`}>
                        <StarRating
                            rating={company.rating}
                            onRate={(r) => updateCompany(company.id, { rating: r as any })}
                        />
                        <span className="text-lg font-bold text-yellow-400 min-w-[2rem] text-right">
                            {effectiveRating}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{company.location || 'Location not specified'}</span>
                </div>
                {company.website && (
                    <div className="flex items-center gap-2 text-gray-300 text-sm truncate">
                        <Globe size={16} className="text-gray-500" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {company.website}
                        </a>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    {/* Relocation Toggle */}
                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={company.relocationUncertain}
                            onChange={(e) => updateCompany(company.id, { relocationUncertain: e.target.checked })}
                            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-offset-gray-800"
                        />
                        Relocation Uncertain?
                    </label>

                    <div className="h-4 w-px bg-gray-700 mx-2" />

                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={company.linkedinConnection}
                            onChange={(e) => updateCompany(company.id, { linkedinConnection: e.target.checked })}
                            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-offset-gray-800"
                        />
                        LI Connected
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => deleteCompany(company.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Company"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Details <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
