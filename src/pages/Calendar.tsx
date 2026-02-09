import React, { useState } from 'react';
import { useJobStore } from '../store/useJobStore';
import { Calendar as CalendarIcon, Clock, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddAppointmentForm } from '../components/appointments/AddAppointmentForm';

export const Calendar: React.FC = () => {
    const { companies, appointments, deleteAppointment } = useJobStore();
    const navigate = useNavigate();
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);

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

    const sortedAppointments = [...appointments].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const upcomingAppointments = sortedAppointments.filter(apt => new Date(apt.date) >= today);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <CalendarIcon size={32} /> Schedule
                </h2>
                <button
                    onClick={() => setShowAppointmentForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors"
                >
                    <Plus size={20} />
                    Book Appointment
                </button>
            </div>

            <div className="space-y-8">
                {/* Appointments Section */}
                <div className="space-y-4">
                    <h3 className="text-green-400 font-bold text-lg flex items-center gap-2">
                        <CalendarIcon size={20} /> Upcoming Appointments
                    </h3>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-gray-500 italic">No upcoming appointments.</p>
                    ) : (
                        upcomingAppointments.map(apt => (
                            <div
                                key={apt.id}
                                className="bg-gray-800 border-l-4 border-green-500 rounded-r-lg p-4 flex justify-between items-center hover:bg-gray-700 transition-colors group"
                            >
                                <div className="flex-1">
                                    <h4 className="font-bold text-white">{apt.contactName} <span className="text-gray-400 font-normal">at {apt.companyName}</span></h4>
                                    <p className="text-sm text-gray-400">{apt.type}</p>
                                    {apt.notes && <p className="text-xs text-gray-500 mt-1">{apt.notes}</p>}
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className="text-green-400 font-medium text-sm">
                                            {new Date(apt.date).toLocaleDateString()}
                                            {apt.time && ` at ${apt.time}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteAppointment(apt.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Overdue Follow-ups Section */}
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
                                    <h4 className="font-bold text-white">{item.firstName} {item.lastName} <span className="text-gray-400 font-normal">at {item.companyName}</span></h4>
                                    <p className="text-sm text-gray-400">{item.role} {item.channel && `• via ${item.channel}`}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-400 font-medium text-sm">Due: {new Date(item.nextFollowUp!).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upcoming Follow-ups Section */}
                <div className="space-y-4">
                    <h3 className="text-blue-400 font-bold text-lg flex items-center gap-2">
                        <CheckCircle size={20} /> Upcoming Follow-ups
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
                                    <h4 className="font-bold text-white">{item.firstName} {item.lastName} <span className="text-gray-400 font-normal">at {item.companyName}</span></h4>
                                    <p className="text-sm text-gray-400">{item.role} {item.channel && `• via ${item.channel}`}</p>
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

            {showAppointmentForm && <AddAppointmentForm onClose={() => setShowAppointmentForm(false)} />}
        </div>
    );
};
