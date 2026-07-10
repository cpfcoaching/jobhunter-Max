import React, { useState } from 'react';
import { useJobStore } from '../store/useJobStore';
import { useNavigate } from 'react-router-dom';
import { Building2, CalendarDays, Clock, Plus, UserPlus } from 'lucide-react';
import { AddAppointmentForm } from '../components/appointments/AddAppointmentForm';
import { AddContactForm } from '../components/contacts/AddContactForm';
import { AddCompanyForm } from '../components/AddCompanyForm';

export const Dashboard: React.FC = () => {
    const { companies, appointments } = useJobStore();
    const navigate = useNavigate();
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);

    const hasCompanies = companies.length > 0;
    const hasContacts = companies.some(company => company.contacts.length > 0);

    const dueFollowUps = companies.flatMap(company =>
        company.contacts
            .filter(contact => {
                if (!contact.nextFollowUp) return false;
                const today = new Date();
                const followUp = new Date(contact.nextFollowUp);
                return followUp <= today && contact.status !== 'Meeting Set' && contact.status !== 'Referred';
            })
            .map(contact => ({
                ...contact,
                companyName: company.name,
            }))
    );

    const upcomingAppointments = [...appointments]
        .filter(appointment => new Date(`${appointment.date}T${appointment.time || '00:00'}`) >= new Date())
        .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime())
        .slice(0, 3);

    const recentCompanies = [...companies].slice(0, 3);

    const stats = {
        tracked: companies.length,
        interviews: appointments.length,
        followUps: dueFollowUps.length
    };

    const openContactForm = () => {
        if (!hasCompanies) {
            setShowCompanyForm(true);
            return;
        }
        setShowContactForm(true);
    };

    const openAppointmentForm = () => {
        if (!hasCompanies) {
            setShowCompanyForm(true);
            return;
        }
        if (!hasContacts) {
            setShowContactForm(true);
            return;
        }
        setShowAppointmentForm(true);
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Dashboard</h2>
                    <p className="text-gray-400 mt-1">Keep your job search moving with the next action in sight.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={openContactForm}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/20 transition-colors"
                    >
                        <UserPlus size={20} />
                        Add Contact
                    </button>
                    <button
                        onClick={openAppointmentForm}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors"
                    >
                        <Plus size={20} />
                        Book Appointment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                    onClick={() => navigate('/companies')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-left hover:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Companies Tracked</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.tracked}</p>
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-left hover:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Appointments Booked</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.interviews}</p>
                </button>
                <button
                    onClick={() => navigate('/calendar')}
                    className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-left hover:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none transition-colors"
                >
                    <h3 className="text-gray-400 text-sm font-medium">Follow-ups Due Today</h3>
                    <p className="text-3xl font-bold mt-2 text-white">{stats.followUps}</p>
                </button>
            </div>

            {!hasCompanies && (
                <section className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-8">
                    <div className="max-w-2xl">
                        <div className="w-12 h-12 rounded-lg bg-blue-600/20 text-blue-300 flex items-center justify-center mb-4">
                            <Building2 size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Start by adding your first target company</h3>
                        <p className="text-gray-400 mb-6">
                            Contacts and appointments both need a company to attach to. Add one target company first, then build your outreach list from there.
                        </p>
                        <button
                            onClick={() => setShowCompanyForm(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors"
                        >
                            <Plus size={20} />
                            Add First Company
                        </button>
                    </div>
                </section>
            )}

            {hasCompanies && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
                    <section className="xl:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-white">Next Actions</h3>
                                <p className="text-sm text-gray-400 mt-1">The shortest path to meaningful job-search momentum.</p>
                            </div>
                            <Clock className="text-blue-400 shrink-0" size={24} />
                        </div>

                        {!hasContacts ? (
                            <div className="border border-dashed border-gray-600 rounded-lg p-5">
                                <h4 className="font-semibold text-white mb-1">Add a contact for one of your target companies</h4>
                                <p className="text-sm text-gray-400 mb-4">Appointments require a contact. Capture a recruiter, hiring manager, referral partner, or warm intro next.</p>
                                <button
                                    onClick={() => setShowContactForm(true)}
                                    className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-medium"
                                >
                                    <UserPlus size={18} />
                                    Add Contact
                                </button>
                            </div>
                        ) : dueFollowUps.length > 0 ? (
                            <div className="space-y-3">
                                {dueFollowUps.slice(0, 3).map(contact => (
                                    <div key={contact.id} className="flex items-start justify-between gap-4 border border-gray-700 rounded-lg p-4">
                                        <div>
                                            <p className="font-medium text-white">{contact.firstName} {contact.lastName}</p>
                                            <p className="text-sm text-gray-400">{contact.companyName} · {contact.status}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/companies')}
                                            className="text-sm text-blue-300 hover:text-blue-200 font-medium"
                                        >
                                            Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-600 rounded-lg p-5">
                                <h4 className="font-semibold text-white mb-1">No follow-ups due right now</h4>
                                <p className="text-sm text-gray-400 mb-4">Book the next conversation while your pipeline is clean.</p>
                                <button
                                    onClick={() => setShowAppointmentForm(true)}
                                    className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-medium"
                                >
                                    <CalendarDays size={18} />
                                    Book Appointment
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-5">Pipeline Snapshot</h3>
                        <div className="space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-300">Upcoming Appointments</p>
                                    <button onClick={() => navigate('/calendar')} className="text-xs text-blue-300 hover:text-blue-200">View all</button>
                                </div>
                                {upcomingAppointments.length > 0 ? (
                                    <div className="space-y-2">
                                        {upcomingAppointments.map(appointment => (
                                            <div key={appointment.id} className="text-sm text-gray-300 border border-gray-700 rounded-lg p-3">
                                                <p className="font-medium text-white">{appointment.companyName}</p>
                                                <p className="text-gray-400">{appointment.date}{appointment.time ? ` at ${appointment.time}` : ''}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No upcoming appointments.</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-300">Recent Companies</p>
                                    <button onClick={() => navigate('/companies')} className="text-xs text-blue-300 hover:text-blue-200">View all</button>
                                </div>
                                <div className="space-y-2">
                                    {recentCompanies.map(company => (
                                        <div key={company.id} className="text-sm text-gray-300 border border-gray-700 rounded-lg p-3">
                                            <p className="font-medium text-white">{company.name}</p>
                                            <p className="text-gray-400">{company.industry || 'Industry not specified'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {showCompanyForm && <AddCompanyForm onClose={() => setShowCompanyForm(false)} />}
            {showAppointmentForm && <AddAppointmentForm onClose={() => setShowAppointmentForm(false)} />}
            {showContactForm && <AddContactForm onClose={() => setShowContactForm(false)} />}
        </div>
    );
};
