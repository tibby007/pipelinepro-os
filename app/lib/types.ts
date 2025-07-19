
// Core type definitions for CCC Healthcare Prospect Pipeline

export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Prospect {
  id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessType: HealthcareType;
  monthlyRevenue?: number;
  yearsInBusiness?: number;
  employeeCount?: number;
  website?: string;
  status: ProspectStatus;
  qualificationScore?: number;
  isQualified: boolean;
  notes?: string;
  tags: string[];
  source?: string;
  assignedToId?: string;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HealthcareType = 
  | 'MEDICAL_OFFICE'
  | 'DENTAL_PRACTICE'
  | 'VETERINARY_CLINIC'
  | 'PHYSICAL_THERAPY'
  | 'MENTAL_HEALTH'
  | 'URGENT_CARE'
  | 'MEDICAL_IMAGING'
  | 'LABORATORY'
  | 'PHARMACY'
  | 'SPECIALTY_CLINIC'
  | 'OTHER';

export type ProspectStatus = 
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SUBMITTED'
  | 'NURTURING'
  | 'CONVERTED'
  | 'DEAD';

export type OutreachType = 
  | 'EMAIL'
  | 'PHONE'
  | 'LINKEDIN'
  | 'IN_PERSON'
  | 'OTHER';

export type OutreachStatus = 
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'RESPONDED'
  | 'FAILED';

export type DocumentType = 
  | 'BANK_STATEMENT'
  | 'TAX_RETURN'
  | 'FINANCIAL_STATEMENT'
  | 'BUSINESS_LICENSE'
  | 'IDENTIFICATION'
  | 'APPLICATION_FORM'
  | 'SUPPORTING_DOCUMENT'
  | 'OTHER';

export type DocumentStatus = 
  | 'PENDING'
  | 'UPLOADED'
  | 'REVIEWED'
  | 'APPROVED'
  | 'REJECTED'
  | 'MISSING';

export interface OutreachActivity {
  id: string;
  prospectId: string;
  userId: string;
  type: OutreachType;
  subject?: string;
  content?: string;
  status: OutreachStatus;
  scheduledAt?: Date;
  completedAt?: Date;
  response?: string;
  responseDate?: Date;
  emailOpened: boolean;
  emailClicked: boolean;
  linkedInMessage?: string;
  phoneCallNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Qualification {
  id: string;
  prospectId: string;
  userId: string;
  totalScore: number;
  maxScore: number;
  isComplete: boolean;
  qualificationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'QUALIFIED' | 'DISQUALIFIED';
  responses: Record<string, any>;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  prospectId: string;
  userId: string;
  name: string;
  type: DocumentType;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  status: DocumentStatus;
  isRequired: boolean;
  notes?: string;
  uploadedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  prospectId: string;
  userId: string;
  status: 'PREPARING' | 'READY' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  submissionType: string;
  submittedToEmail: string;
  ccEmails: string[];
  notes?: string;
  submittedAt?: Date;
  responseReceived: boolean;
  responseDate?: Date;
  responseNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsEvent {
  id: string;
  prospectId?: string;
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
  value?: number;
  createdAt: Date;
}

// UI Component Types
export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface DashboardMetric {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface ProspectFormData {
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessType: HealthcareType;
  monthlyRevenue?: number;
  yearsInBusiness?: number;
  employeeCount?: number;
  website?: string;
  notes?: string;
  tags?: string[];
  source?: string;
}

export interface OutreachFormData {
  type: OutreachType;
  subject?: string;
  content?: string;
  scheduledAt?: Date;
}

// Constants
export const HEALTHCARE_TYPES = [
  { value: 'MEDICAL_OFFICE', label: 'Medical Office' },
  { value: 'DENTAL_PRACTICE', label: 'Dental Practice' },
  { value: 'VETERINARY_CLINIC', label: 'Veterinary Clinic' },
  { value: 'PHYSICAL_THERAPY', label: 'Physical Therapy' },
  { value: 'MENTAL_HEALTH', label: 'Mental Health' },
  { value: 'URGENT_CARE', label: 'Urgent Care' },
  { value: 'MEDICAL_IMAGING', label: 'Medical Imaging' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'SPECIALTY_CLINIC', label: 'Specialty Clinic' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const PROSPECT_STATUSES = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-green-100 text-green-800' },
  { value: 'SUBMITTED', label: 'Submitted', color: 'bg-purple-100 text-purple-800' },
  { value: 'NURTURING', label: 'Nurturing', color: 'bg-orange-100 text-orange-800' },
  { value: 'CONVERTED', label: 'Converted', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'DEAD', label: 'Dead', color: 'bg-red-100 text-red-800' },
] as const;

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const;
