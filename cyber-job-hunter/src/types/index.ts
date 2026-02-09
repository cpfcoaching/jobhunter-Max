export type Rating = 0 | 1 | 2 | 3;

export type ContactStatus = 'Identified' | 'Contacted' | 'Meeting Set' | 'Referred' | 'No Response';

export interface Contact {
    id: string;
    name: string;
    role: string;
    email: string;
    linkedinProfile?: string;
    status: ContactStatus;
    lastContactDate: string | null; // ISO string
    nextFollowUp: string | null; // ISO string
    notes?: string;
}

export interface PrepData {
    investorRelationsReviewed: boolean;
    headlinesReviewed: boolean;
    tiara: {
        trends: string;
        insights: string;
        advice: string;
        resources: string;
        assignments: string;
    };
    commonQuestionsAnswers: {
        tellMeAboutYourself: string;
        whyUs: string;
        whyRole: string;
        whyIndustry: string;
    };
}

export interface Company {
    id: string;
    name: string;
    industry?: string;
    location?: string;
    description?: string;
    rating: Rating;
    relocationUncertain: boolean;
    linkedinConnection: boolean; // Y/N
    website?: string;
    contacts: Contact[];
    researchStatus: 'Pending' | 'In Progress' | 'Completed';
    interviewPrep: PrepData;
    notes?: string;
    dateAdded: string; // ISO string
}
