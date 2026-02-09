import React from 'react';
import { useJobStore } from '../store/useJobStore';
import { Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Calendar: React.FC = () => {
    const { companies } = useJobStore();
    const navigate = useNavigate();

    const allFollowUps = companies.flatMap(company =>
        company.contacts
            .filter(contact => contact.nextFollowUp)
            .map(contact => ({
                ...contact,
                companyName: company.name,
                companyId: company.id,
            }))
    ).sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = allFollowUps.filter(c => new Date(c.nextFollowUp!) < today);
    const upcoming = allFollowUps.filter(c => new Date(c.nextFollowUp!) >= today);

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <CalendarIcon size={32} /> Follow-up Schedule
            </h2>

            <div className="space-y-8">
                {/* Overdue Section */}
                {overdue.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-red-400 font-bold text-lg flex items-center gap-2">
                            <Clock size={20} /> Overdue / Due Now
                        </h3>
                        {overdue.map(item => (
                            <div
                                key={`${item.companyId}-${item.id}`}
                                className="bg-gray-800 border-l-4 border-red-500 rounded-r-lg p-4 flex justify-between items-center hover:bg-gray-700 transition-colors group cursor-pointer"
                                onClick={() => navigate(`/companies/${item.companyId}`)}
                            >
                                <div>
                                    <h4 className="font-bold text-white">{item.name} <span className="text-gray-400 font-normal">at {item.companyName}</span></h4>
                                    <p className="text-sm text-gray-400">{item.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-400 font-medium text-sm">Due: {new Date(item.nextFollowUp!).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upcoming Section */}
                <div className="space-y-4">
                    <h3 className="text-blue-400 font-bold text-lg flex items-center gap-2">
                        <CheckCircle size={20} /> Upcoming
                    </h3>
                    {upcoming.length === 0 ? (
                        <p className="text-gray-500 italic">No upcoming follow-ups scheduled.</p>
                    ) : (
                        upcoming.map(item => (
                            <div
                                key={`${item.companyId}-${item.id}`}
                                className="bg-gray-800 border-l-4 border-blue-500 rounded-r-lg p-4 flex justify-between items-center hover:bg-gray-700 transition-colors cursor-pointer"
                                onClick={() => navigate(`/companies/${item.companyId}`)}
                            >
                                <div>
                                    <h4 className="font-bold text-white">{item.name} <span className="text-gray-400 font-normal">at {item.companyName}</span></h4>
                                    <p className="text-sm text-gray-400">{item.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-400 font-medium text-sm">Due: {new Date(item.nextFollowUp!).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">{item.status}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
