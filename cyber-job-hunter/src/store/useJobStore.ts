import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Contact, Appointment, Application, Communication } from '../types';
import type { Resume, AiModel } from '../types/ai';
import { defaultModel } from '../types/ai';

interface JobStore {
    companies: Company[];
    appointments: Appointment[];
    resumes: Resume[];
    aiSettings: AiModel;

    addCompany: (company: Omit<Company, 'id' | 'dateAdded' | 'contacts' | 'interviewPrep' | 'researchStatus'>) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    deleteCompany: (id: string) => void;

    addContact: (companyId: string, contact: Omit<Contact, 'id'>) => void;
    updateContact: (companyId: string, contactId: string, updates: Partial<Contact>) => void;
    deleteContact: (companyId: string, contactId: string) => void;

    addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    updateAppointment: (id: string, updates: Partial<Appointment>) => void;
    deleteAppointment: (id: string) => void;

    addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateResume: (id: string, updates: Partial<Resume>) => void;
    deleteResume: (id: string) => void;

    updateAiSettings: (settings: AiModel) => void;

    // Application management
    addApplication: (companyId: string, application: Omit<Application, 'id' | 'companyId'>) => void;
    updateApplication: (companyId: string, applicationId: string, updates: Partial<Application>) => void;
    deleteApplication: (companyId: string, applicationId: string) => void;

    // Communication management
    addCommunication: (companyId: string, contactId: string, communication: Omit<Communication, 'id' | 'companyId' | 'contactId'>) => void;
    updateCommunication: (companyId: string, contactId: string, communicationId: string, updates: Partial<Communication>) => void;
    deleteCommunication: (companyId: string, contactId: string, communicationId: string) => void;
}

export const useJobStore = create<JobStore>()(
    persist(
        (set) => ({
            companies: [],
            appointments: [],
            resumes: [],
            aiSettings: defaultModel,

            addCompany: (companyData) => set((state) => {
                const newCompany: Company = {
                    ...companyData,
                    id: crypto.randomUUID(),
                    dateAdded: new Date().toISOString(),
                    contacts: [],
                    applications: [],
                    researchStatus: 'Pending',
                    interviewPrep: {
                        investorRelationsReviewed: false,
                        headlinesReviewed: false,
                        tiara: {
                            trends: '',
                            insights: '',
                            advice: '',
                            resources: '',
                            assignments: '',
                        },
                        commonQuestionsAnswers: {
                            tellMeAboutYourself: '',
                            whyUs: '',
                            whyRole: '',
                            whyIndustry: '',
                        },
                    },
                };
                return { companies: [newCompany, ...state.companies] };
            }),

            updateCompany: (id, updates) => set((state) => ({
                companies: state.companies.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                ),
            })),

            deleteCompany: (id) => set((state) => ({
                companies: state.companies.filter((c) => c.id !== id),
            })),

            addContact: (companyId, contactData) => set((state) => ({
                companies: state.companies.map((c) => {
                    if (c.id !== companyId) return c;

                    const newContact: Contact = {
                        ...contactData,
                        id: crypto.randomUUID(),
                    };

                    return { ...c, contacts: [...c.contacts, newContact] };
                }),
            })),

            updateContact: (companyId, contactId, updates) => set((state) => ({
                companies: state.companies.map((c) => {
                    if (c.id !== companyId) return c;

                    return {
                        ...c,
                        contacts: c.contacts.map((contact) => {
                            if (contact.id !== contactId) return contact;

                            const updatedContact = { ...contact, ...updates };

                            // Auto-calculate follow-up if status changed
                            if (updates.status && updates.status !== contact.status) {
                                const d = new Date();
                                if (updates.status === 'Contacted') {
                                    // 3 Business Days
                                    updatedContact.lastContactDate = d.toISOString();
                                    let daysToAdd = 3;
                                    let count = 0;
                                    while (count < daysToAdd) {
                                        d.setDate(d.getDate() + 1);
                                        if (d.getDay() !== 0 && d.getDay() !== 6) count++;
                                    }
                                    updatedContact.nextFollowUp = d.toISOString();
                                } else if (updates.status === 'No Response') {
                                    // 7 Business Days logic (simplified)
                                    let daysToAdd = 7;
                                    let count = 0;
                                    while (count < daysToAdd) {
                                        d.setDate(d.getDate() + 1);
                                        if (d.getDay() !== 0 && d.getDay() !== 6) count++;
                                    }
                                    updatedContact.nextFollowUp = d.toISOString();
                                }
                            }

                            return updatedContact;
                        }),
                    };
                }),
            })),

            deleteContact: (companyId, contactId) => set((state) => ({
                companies: state.companies.map((c) => {
                    if (c.id !== companyId) return c;
                    return {
                        ...c,
                        contacts: c.contacts.filter((contact) => contact.id !== contactId),
                    };
                }),
            })),

            // Appointments management
            addAppointment: (appointmentData) => set((state) => ({
                appointments: [...state.appointments, { ...appointmentData, id: crypto.randomUUID() }],
            })),

            updateAppointment: (id, updates) => set((state) => ({
                appointments: state.appointments.map((apt) =>
                    apt.id === id ? { ...apt, ...updates } : apt
                ),
            })),

            deleteAppointment: (id) => set((state) => ({
                appointments: state.appointments.filter((apt) => apt.id !== id),
            })),

            // Resume management
            addResume: (resumeData) => set((state) => ({
                resumes: [...state.resumes, {
                    ...resumeData,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }],
            })),

            updateResume: (id, updates) => set((state) => ({
                resumes: state.resumes.map((resume) =>
                    resume.id === id ? { ...resume, ...updates, updatedAt: new Date().toISOString() } : resume
                ),
            })),

            deleteResume: (id) => set((state) => ({
                resumes: state.resumes.filter((resume) => resume.id !== id),
            })),

            // AI Settings
            updateAiSettings: (settings) => set(() => ({
                aiSettings: settings,
            })),

            // Application management
            addApplication: (companyId, applicationData) => set((state) => ({
                companies: state.companies.map((company) =>
                    company.id === companyId
                        ? {
                            ...company,
                            applications: [
                                ...company.applications,
                                {
                                    ...applicationData,
                                    id: crypto.randomUUID(),
                                    companyId,
                                },
                            ],
                        }
                        : company
                ),
            })),

            updateApplication: (companyId, applicationId, updates) => set((state) => ({
                companies: state.companies.map((company) =>
                    company.id === companyId
                        ? {
                            ...company,
                            applications: company.applications.map((app) =>
                                app.id === applicationId ? { ...app, ...updates } : app
                            ),
                        }
                        : company
                ),
            })),

            deleteApplication: (companyId, applicationId) => set((state) => ({
                companies: state.companies.map((company) =>
                    company.id === companyId
                        ? {
                            ...company,
                            applications: company.applications.filter((app) => app.id !== applicationId),
                        }
                        : company
                ),
            })),

            // Communication management
            addCommunication: (companyId, contactId, communicationData) => set((state) => ({
                companies: state.companies.map((company) =>
                    company.id === companyId
                        ? {
                            ...company,
                            contacts: company.contacts.map((contact) =>
                                contact.id === contactId
                                    ? {
                                        ...contact,
                                        communications: [
                                            ...(contact.communications || []),
                                            {
                                                ...communicationData,
                                                id: crypto.randomUUID(),
                                                companyId,
                                                contactId,
                                            },
                                        ],
                                        // Auto-update lastContactDate and nextFollowUp
                                        lastContactDate: communicationData.date,
                                        nextFollowUp: communicationData.followUpRequired
                                            ? communicationData.followUpDate || null
                                            : contact.nextFollowUp,
                                    }
                                    : contact
                            ),
                        }
                        : company
                ),
            })),

            updateCommunication: (companyId, contactId, communicationId, updates) => set((state) => ({
                companies: state.companies.map((company) =>
                    company.id === companyId
                        ? {
                            ...company,
                            contacts: company.contacts.map((contact) =>
                                contact.id === contactId
                                    ? {
                                        ...contact,
                                        communications: (contact.communications || []).map((comm) =>
                                            comm.id === communicationId ? { ...comm, ...updates } : comm
                                        ),
                                    }
                                    : contact
                            ),
                        }
                        : company
                ),
            })),

            deleteCommunication: (companyId, contactId, communicationId) => set((state) => ({
                companies: state.companies.map((company) =>
                    company.id === companyId
                        ? {
                            ...company,
                            contacts: company.contacts.map((contact) =>
                                contact.id === contactId
                                    ? {
                                        ...contact,
                                        communications: (contact.communications || []).filter(
                                            (comm) => comm.id !== communicationId
                                        ),
                                    }
                                    : contact
                            ),
                        }
                        : company
                ),
            })),
        }),
        {
            name: 'cyber-job-hunter-storage',
        }
    )
);
