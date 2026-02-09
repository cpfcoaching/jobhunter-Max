import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Contact } from '../types';

interface JobStore {
    companies: Company[];
    addCompany: (company: Omit<Company, 'id' | 'dateAdded' | 'contacts' | 'interviewPrep' | 'researchStatus'>) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    deleteCompany: (id: string) => void;

    addContact: (companyId: string, contact: Omit<Contact, 'id'>) => void;
    updateContact: (companyId: string, contactId: string, updates: Partial<Contact>) => void;
    deleteContact: (companyId: string, contactId: string) => void;
}

export const useJobStore = create<JobStore>()(
    persist(
        (set) => ({
            companies: [],

            addCompany: (companyData) => set((state) => {
                const newCompany: Company = {
                    ...companyData,
                    id: crypto.randomUUID(),
                    dateAdded: new Date().toISOString(),
                    contacts: [],
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
        }),
        {
            name: 'cyber-job-hunter-storage',
        }
    )
);
