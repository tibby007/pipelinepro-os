
// Core type definitions for PipelinePro OS - Multi-Industry Prospect Pipeline

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
  businessType: IndustryType;
  industryCategory: IndustryCategory;
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

export type IndustryCategory = 
  | 'HEALTHCARE'
  | 'RESTAURANT_FOOD_SERVICE'
  | 'BEAUTY_WELLNESS'
  | 'AUTOMOTIVE_SERVICES'
  | 'FITNESS_RECREATION'
  | 'PET_SERVICES'
  | 'SPECIALTY_RETAIL'
  | 'BUSINESS_SERVICES';

export type IndustryType = 
  // Healthcare
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
  | 'CHIROPRACTIC'
  | 'OPTOMETRY'
  | 'DERMATOLOGY'
  // Restaurants & Food Service
  | 'FAST_FOOD'
  | 'CASUAL_DINING'
  | 'FINE_DINING'
  | 'COFFEE_SHOP'
  | 'BAKERY'
  | 'FOOD_TRUCK'
  | 'CATERING'
  | 'BAR_GRILL'
  | 'PIZZA_RESTAURANT'
  | 'ETHNIC_CUISINE'
  // Beauty & Wellness
  | 'HAIR_SALON'
  | 'NAIL_SALON'
  | 'SPA_WELLNESS'
  | 'MASSAGE_THERAPY'
  | 'TATTOO_PARLOR'
  | 'BARBERSHOP'
  | 'BEAUTY_SUPPLY'
  | 'COSMETIC_SERVICES'
  | 'TANNING_SALON'
  // Automotive Services
  | 'AUTO_REPAIR'
  | 'OIL_CHANGE'
  | 'TIRE_SHOP'
  | 'CAR_WASH'
  | 'AUTO_DETAILING'
  | 'TRANSMISSION_REPAIR'
  | 'BODY_SHOP'
  | 'MUFFLER_SHOP'
  | 'BRAKE_SERVICE'
  // Fitness & Recreation
  | 'GYM_FITNESS'
  | 'YOGA_STUDIO'
  | 'MARTIAL_ARTS'
  | 'DANCE_STUDIO'
  | 'PERSONAL_TRAINING'
  | 'SPORTS_FACILITY'
  | 'RECREATION_CENTER'
  | 'CLIMBING_GYM'
  // Pet Services
  | 'VETERINARY_SERVICES'
  | 'PET_GROOMING'
  | 'PET_BOARDING'
  | 'PET_TRAINING'
  | 'PET_DAYCARE'
  | 'PET_STORE'
  | 'DOG_WALKING'
  // Specialty Retail
  | 'BOUTIQUE_CLOTHING'
  | 'JEWELRY_STORE'
  | 'ELECTRONICS_REPAIR'
  | 'BIKE_SHOP'
  | 'BOOKSTORE'
  | 'GIFT_SHOP'
  | 'SPORTING_GOODS'
  | 'HOME_DECOR'
  | 'ANTIQUE_SHOP'
  // Business Services
  | 'ACCOUNTING_SERVICES'
  | 'LEGAL_SERVICES'
  | 'MARKETING_AGENCY'
  | 'CONSULTING'
  | 'REAL_ESTATE'
  | 'INSURANCE_AGENCY'
  | 'FINANCIAL_PLANNING'
  | 'IT_SERVICES'
  | 'CLEANING_SERVICES'
  | 'LANDSCAPING'
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
  businessType: IndustryType;
  industryCategory: IndustryCategory;
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
export const INDUSTRY_CATEGORIES = [
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'RESTAURANT_FOOD_SERVICE', label: 'Restaurants & Food Service' },
  { value: 'BEAUTY_WELLNESS', label: 'Beauty & Wellness' },
  { value: 'AUTOMOTIVE_SERVICES', label: 'Automotive Services' },
  { value: 'FITNESS_RECREATION', label: 'Fitness & Recreation' },
  { value: 'PET_SERVICES', label: 'Pet Services' },
  { value: 'SPECIALTY_RETAIL', label: 'Specialty Retail' },
  { value: 'BUSINESS_SERVICES', label: 'Business Services' },
] as const;

export const INDUSTRY_TYPES = {
  HEALTHCARE: [
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
    { value: 'CHIROPRACTIC', label: 'Chiropractic' },
    { value: 'OPTOMETRY', label: 'Optometry' },
    { value: 'DERMATOLOGY', label: 'Dermatology' },
  ],
  RESTAURANT_FOOD_SERVICE: [
    { value: 'FAST_FOOD', label: 'Fast Food' },
    { value: 'CASUAL_DINING', label: 'Casual Dining' },
    { value: 'FINE_DINING', label: 'Fine Dining' },
    { value: 'COFFEE_SHOP', label: 'Coffee Shop' },
    { value: 'BAKERY', label: 'Bakery' },
    { value: 'FOOD_TRUCK', label: 'Food Truck' },
    { value: 'CATERING', label: 'Catering' },
    { value: 'BAR_GRILL', label: 'Bar & Grill' },
    { value: 'PIZZA_RESTAURANT', label: 'Pizza Restaurant' },
    { value: 'ETHNIC_CUISINE', label: 'Ethnic Cuisine' },
  ],
  BEAUTY_WELLNESS: [
    { value: 'HAIR_SALON', label: 'Hair Salon' },
    { value: 'NAIL_SALON', label: 'Nail Salon' },
    { value: 'SPA_WELLNESS', label: 'Spa & Wellness' },
    { value: 'MASSAGE_THERAPY', label: 'Massage Therapy' },
    { value: 'TATTOO_PARLOR', label: 'Tattoo Parlor' },
    { value: 'BARBERSHOP', label: 'Barbershop' },
    { value: 'BEAUTY_SUPPLY', label: 'Beauty Supply' },
    { value: 'COSMETIC_SERVICES', label: 'Cosmetic Services' },
    { value: 'TANNING_SALON', label: 'Tanning Salon' },
  ],
  AUTOMOTIVE_SERVICES: [
    { value: 'AUTO_REPAIR', label: 'Auto Repair' },
    { value: 'OIL_CHANGE', label: 'Oil Change' },
    { value: 'TIRE_SHOP', label: 'Tire Shop' },
    { value: 'CAR_WASH', label: 'Car Wash' },
    { value: 'AUTO_DETAILING', label: 'Auto Detailing' },
    { value: 'TRANSMISSION_REPAIR', label: 'Transmission Repair' },
    { value: 'BODY_SHOP', label: 'Body Shop' },
    { value: 'MUFFLER_SHOP', label: 'Muffler Shop' },
    { value: 'BRAKE_SERVICE', label: 'Brake Service' },
  ],
  FITNESS_RECREATION: [
    { value: 'GYM_FITNESS', label: 'Gym & Fitness' },
    { value: 'YOGA_STUDIO', label: 'Yoga Studio' },
    { value: 'MARTIAL_ARTS', label: 'Martial Arts' },
    { value: 'DANCE_STUDIO', label: 'Dance Studio' },
    { value: 'PERSONAL_TRAINING', label: 'Personal Training' },
    { value: 'SPORTS_FACILITY', label: 'Sports Facility' },
    { value: 'RECREATION_CENTER', label: 'Recreation Center' },
    { value: 'CLIMBING_GYM', label: 'Climbing Gym' },
  ],
  PET_SERVICES: [
    { value: 'VETERINARY_SERVICES', label: 'Veterinary Services' },
    { value: 'PET_GROOMING', label: 'Pet Grooming' },
    { value: 'PET_BOARDING', label: 'Pet Boarding' },
    { value: 'PET_TRAINING', label: 'Pet Training' },
    { value: 'PET_DAYCARE', label: 'Pet Daycare' },
    { value: 'PET_STORE', label: 'Pet Store' },
    { value: 'DOG_WALKING', label: 'Dog Walking' },
  ],
  SPECIALTY_RETAIL: [
    { value: 'BOUTIQUE_CLOTHING', label: 'Boutique Clothing' },
    { value: 'JEWELRY_STORE', label: 'Jewelry Store' },
    { value: 'ELECTRONICS_REPAIR', label: 'Electronics Repair' },
    { value: 'BIKE_SHOP', label: 'Bike Shop' },
    { value: 'BOOKSTORE', label: 'Bookstore' },
    { value: 'GIFT_SHOP', label: 'Gift Shop' },
    { value: 'SPORTING_GOODS', label: 'Sporting Goods' },
    { value: 'HOME_DECOR', label: 'Home Decor' },
    { value: 'ANTIQUE_SHOP', label: 'Antique Shop' },
  ],
  BUSINESS_SERVICES: [
    { value: 'ACCOUNTING_SERVICES', label: 'Accounting Services' },
    { value: 'LEGAL_SERVICES', label: 'Legal Services' },
    { value: 'MARKETING_AGENCY', label: 'Marketing Agency' },
    { value: 'CONSULTING', label: 'Consulting' },
    { value: 'REAL_ESTATE', label: 'Real Estate' },
    { value: 'INSURANCE_AGENCY', label: 'Insurance Agency' },
    { value: 'FINANCIAL_PLANNING', label: 'Financial Planning' },
    { value: 'IT_SERVICES', label: 'IT Services' },
    { value: 'CLEANING_SERVICES', label: 'Cleaning Services' },
    { value: 'LANDSCAPING', label: 'Landscaping' },
  ],
} as const;

// Flattened list of all industry types for easier use in components
export const ALL_INDUSTRY_TYPES = Object.values(INDUSTRY_TYPES).flat();

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
