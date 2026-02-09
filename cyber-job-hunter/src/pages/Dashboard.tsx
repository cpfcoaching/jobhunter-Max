import React from 'react';
import { useJobStore } from '../store/useJobStore';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { companies } = useJobStore();
    const navigate = useNavigate();

    const stats = {
        tracked: companies.length,
        interviews: companies.flatMap(c => c.contacts).filter(cnt => cnt.status === 'Meeting Set').length,
        followUps: companies.flatMap(c => c.contacts).filter(cnt => {
            if (!cnt.nextFollowUp) return false;
            const today = new Date();
            const followUp = new Date(cnt.nextFollowUp);
            return followUp <= today && cnt.status !== 'Meeting Set' && cnt.status !== 'Referred'; // Simple due logic
        }).length
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate('/companies')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Companies Tracked</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.tracked}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Interviews Scheduled</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.interviews}</p>
                </div>
                <div
                    onClick={() => navigate('/calendar')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Follow-ups Due Today</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.followUps}</p>
                </div>
            </div>
        </div>
    );
};
