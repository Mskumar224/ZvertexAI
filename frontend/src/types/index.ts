export interface Job {
    id: string;
    title: string;
    posted: string;
    location: string;
    requiresDocs: boolean;
    company?: string; // Added for email
  }