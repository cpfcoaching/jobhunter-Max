export type Rating = 0 | 1 | 2 | 3;

export type ContactStatus = 'Identified' | 'Contacted' | 'Meeting Set' | 'Referred' | 'No Response';

export type ContactChannel = 'LinkedIn' | 'Email' | 'Text' | 'Phone' | 'Other';

export type ApplicationStatus = 'Not Applied' | 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted' | 'Declined';

export interface Application {
    id: string;
    companyId: string;
    position: string;
    status: ApplicationStatus;
    appliedDate?: string; // ISO string
    jobUrl?: string;
    salary?: string;
    notes?: string;
}

export interface Communication {
    id: string;
    contactId: string;
    companyId: string;
    date: string; // ISO string
    channel: ContactChannel;
    subject?: string;
    content: string;
    direction: 'Sent' | 'Received';
    followUpRequired: boolean;
    followUpDate?: string; // ISO string
}

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phone?: string;
    linkedinProfile?: string;
    status: ContactStatus;
    lastContactDate: string | null; // ISO string
    nextFollowUp: string | null; // ISO string
    notes?: string;
    channel?: ContactChannel; // Track how they were contacted
    communications?: Communication[]; // Communication history
}

export interface Appointment {
    id: string;
    companyId: string;
    companyName: string;
    contactId: string;
    contactName: string;
    date: string; // ISO string
    time?: string;
    notes?: string;
    type: 'Informational' | 'Interview' | 'Follow-up' | 'Other';
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
    applications: Application[]; // Track job applications
    researchStatus: 'Pending' | 'In Progress' | 'Completed';
    interviewPrep: PrepData;
    notes?: string;
    dateAdded: string; // ISO string
}
