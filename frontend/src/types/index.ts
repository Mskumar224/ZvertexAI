export interface Job {
    id: string;
    title: string;
    posted: string;
    location: string;
    requiresDocs: boolean;
    company?: string;
  }
  
  export interface CompanyResumeMap {
    company: string;
    resumePath: string;
  }
  
  export interface AppliedJob {
    jobId: string;
    company: string;
    resumePath: string;
    date: Date;
  }