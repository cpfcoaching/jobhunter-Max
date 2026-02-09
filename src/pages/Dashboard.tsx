import React, { useState } from 'react';
import { useJobStore } from '../store/useJobStore';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus } from 'lucide-react';
import { AddAppointmentForm } from '../components/appointments/AddAppointmentForm';
import { AddContactForm } from '../components/contacts/AddContactForm';

export const Dashboard: React.FC = () => {
    const { companies, appointments } = useJobStore();
    const navigate = useNavigate();
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);

    const stats = {
        tracked: companies.length,
        interviews: appointments.length,
        followUps: companies.flatMap(c => c.contacts).filter(cnt => {
            if (!cnt.nextFollowUp) return false;
            const today = new Date();
            const followUp = new Date(cnt.nextFollowUp);
            return followUp <= today && cnt.status !== 'Meeting Set' && cnt.status !== 'Referred'; // Simple due logic
        }).length
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowContactForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/20 transition-colors"
                    >
                        <UserPlus size={20} />
                        Add Contact
                    </button>
                    <button
                        onClick={() => setShowAppointmentForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors"
                    >
                        <Plus size={20} />
                        Book Appointment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate('/companies')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Companies Tracked</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.tracked}</p>
                </div>
                <div
                    onClick={() => navigate('/calendar')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Appointments Booked</h3>
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


            {showAppointmentForm && <AddAppointmentForm onClose={() => setShowAppointmentForm(false)} />}
            {showContactForm && <AddContactForm onClose={() => setShowContactForm(false)} />}
        </div>
    );
};
