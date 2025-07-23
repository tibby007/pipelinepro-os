
import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { IndustryCategory, IndustryType } from './types';

const prisma = new PrismaClient();

// Encryption key for API keys (in production, use proper key management)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-replace-in-production-32chars';

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get user-specific Apify client
async function getUserApifyClient(userEmail: string): Promise<{ client: ApifyClient | null; hasValidKey: boolean }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        apifyApiKey: true,
        apifyKeyStatus: true,
      },
    });

    if (!user?.apifyApiKey || user.apifyKeyStatus !== 'VALID') {
      return { client: null, hasValidKey: false };
    }

    const decryptedKey = decrypt(user.apifyApiKey);
    const client = new ApifyClient({ token: decryptedKey });
    
    return { client, hasValidKey: true };
  } catch (error) {
    console.error('Error getting user Apify client:', error);
    return { client: null, hasValidKey: false };
  }
}

// Fallback global client for system-level operations (optional)
const globalApifyClient = process.env.APIFY_API_TOKEN 
  ? new ApifyClient({ token: process.env.APIFY_API_TOKEN })
  : null;

export interface ApifyBusiness {
  title: string;
  address: string;
  phone?: string;
  website?: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  location?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  hours?: string[];
  description?: string;
  imageUrl?: string;
}

export interface SearchCriteria {
  location: string;
  industryTypes: string[];
  industryCategory?: string;
  radius: number;
}

export interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  businessType: string;
  industryCategory: string;
  estimatedRevenue: string;
  yearsInBusiness: string;
  employeeCount: string;
  website?: string;
  qualificationIndicators: {
    revenueQualified: boolean;
    experienceQualified: boolean;
    locationQualified: boolean;
    industryQualified: boolean;
  };
  qualificationScore: number;
  isQualified: boolean;
  // Apollo-specific enriched contact data
  email?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  companySize?: string;
}

// COMPLETELY REWRITTEN: Industry-specific search keyword mapping
// Each industry category has precisely targeted keywords to prevent cross-contamination
const INDUSTRY_SEARCH_KEYWORDS: Record<IndustryCategory, string[]> = {
  HEALTHCARE: [
    'medical office', 'doctor office', 'physician', 'medical center', 'clinic',
    'dental office', 'dentist', 'orthodontist', 'oral surgeon',
    'veterinary', 'animal hospital', 'vet clinic', 'pet clinic',
    'physical therapy', 'physiotherapy', 'rehabilitation center',
    'mental health', 'psychiatrist', 'psychologist', 'counseling',
    'urgent care', 'walk-in clinic', 'immediate care',
    'pharmacy', 'drugstore', 'medical pharmacy',
    'chiropractor', 'chiropractic', 'spinal care',
    'optometrist', 'eye doctor', 'vision center'
  ],
  
  RESTAURANT_FOOD_SERVICE: [
    'restaurant', 'dining', 'eatery', 'bistro', 'grill', 'steakhouse',
    'fast food', 'quick service', 'burger joint', 'drive thru',
    'pizza restaurant', 'pizzeria', 'pizza place',
    'coffee shop', 'cafe', 'espresso bar', 'coffee house',
    'bakery', 'pastry shop', 'donut shop', 'bagel shop',
    'bar and grill', 'sports bar', 'pub', 'tavern',
    'catering service', 'food catering', 'event catering',
    'food truck', 'mobile food', 'street food'
  ],
  
  BEAUTY_WELLNESS: [
    'hair salon', 'beauty salon', 'hair studio', 'hairstylist',
    'nail salon', 'nail spa', 'manicure', 'pedicure',
    'day spa', 'wellness spa', 'spa services', 'wellness center',
    'massage therapy', 'therapeutic massage', 'massage studio',
    'barbershop', 'barber', 'mens grooming',
    'tattoo parlor', 'tattoo shop', 'tattoo studio',
    'beauty supply', 'cosmetics store', 'beauty products'
  ],
  
  AUTOMOTIVE_SERVICES: [
    'auto repair', 'car repair', 'automotive service', 'mechanic', 'garage',
    'oil change', 'quick lube', 'automotive maintenance',
    'tire shop', 'tire service', 'tire store', 'tire center',
    'car wash', 'auto wash', 'vehicle cleaning',
    'auto detailing', 'car detailing', 'vehicle detailing',
    'transmission repair', 'transmission service',
    'auto body shop', 'collision repair', 'body work',
    'muffler shop', 'exhaust service', 'muffler repair',
    'brake service', 'brake repair', 'brake shop'
  ],
  
  FITNESS_RECREATION: [
    'gym', 'fitness center', 'health club', 'workout facility',
    'yoga studio', 'yoga center', 'yoga classes',
    'martial arts', 'karate', 'taekwondo', 'jiu jitsu',
    'dance studio', 'dance school', 'dance classes',
    'personal training', 'fitness training',
    'sports facility', 'athletic facility', 'recreation center'
  ],
  
  PET_SERVICES: [
    'pet grooming', 'dog grooming', 'pet salon', 'grooming salon',
    'pet boarding', 'dog boarding', 'pet hotel', 'pet daycare',
    'pet training', 'dog training', 'obedience training',
    'pet store', 'pet shop', 'pet supplies', 'animal supplies',
    'dog walking', 'pet sitting', 'pet care services'
  ],
  
  SPECIALTY_RETAIL: [
    'boutique', 'clothing store', 'fashion boutique', 'apparel store',
    'jewelry store', 'jeweler', 'jewelry shop',
    'electronics repair', 'computer repair', 'phone repair',
    'bike shop', 'bicycle store', 'cycle shop',
    'bookstore', 'book shop', 'books and more',
    'gift shop', 'gift store', 'novelty store'
  ],
  
  BUSINESS_SERVICES: [
    'accounting firm', 'accountant', 'bookkeeping', 'CPA', 'tax services',
    'law firm', 'attorney', 'lawyer', 'legal services',
    'marketing agency', 'advertising agency', 'digital marketing',
    'consulting firm', 'business consultant', 'management consulting',
    'real estate office', 'realtor', 'real estate agent',
    'insurance agency', 'insurance agent', 'insurance office'
  ]
};

// STRICT BUSINESS TYPE VALIDATION: Only returns exact matches for industry categories
function strictBusinessCategorization(title: string, categories: string[] = [], requestedCategory: IndustryCategory): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  const searchText = `${title} ${categories.join(' ')}`.toLowerCase();
  
  // CRITICAL: First apply universal exclusion filters
  const globalExclusions = [
    // Technology/Web Services
    'web design', 'web development', 'website', 'digital agency', 'seo', 'software',
    // Telecommunications  
    'verizon', 'at&t', 'sprint', 'tmobile', 'phone service', 'internet provider',
    // Financial (when not searching for business services)
    'bank', 'credit union', 'mortgage', 'loan company',
    // Construction/Trades
    'construction', 'plumbing', 'electrical', 'hvac', 'roofing', 'landscaping',
    // Government/Municipal
    'government', 'municipal', 'city hall', 'courthouse', 'post office', 'dmv',
    // Medical Equipment/Supplies (not healthcare providers)
    'medical equipment', 'medical supplies', 'pharmaceutical distributor',
    // Wholesale/Distribution
    'wholesale', 'distributor', 'warehouse', 'logistics'
  ];
  
  // Exclude businesses that match global exclusion patterns
  for (const exclusion of globalExclusions) {
    if (searchText.includes(exclusion)) {
      return null;
    }
  }
  
  // CATEGORY-SPECIFIC STRICT VALIDATION
  switch (requestedCategory) {
    case 'AUTOMOTIVE_SERVICES':
      return validateAutomotiveBusiness(searchText);
    case 'RESTAURANT_FOOD_SERVICE':
      return validateRestaurantBusiness(searchText);
    case 'HEALTHCARE':
      return validateHealthcareBusiness(searchText);
    case 'BEAUTY_WELLNESS':
      return validateBeautyBusiness(searchText);
    case 'FITNESS_RECREATION':
      return validateFitnessBusiness(searchText);
    case 'PET_SERVICES':
      return validatePetServicesBusiness(searchText);
    case 'SPECIALTY_RETAIL':
      return validateRetailBusiness(searchText);
    case 'BUSINESS_SERVICES':
      return validateBusinessServicesBusiness(searchText);
    default:
      return null;
  }
}

// AUTOMOTIVE SERVICES VALIDATION - ULTRA STRICT
function validateAutomotiveBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  // MANDATORY automotive keywords - business MUST contain these
  const mandatoryAutomotiveKeywords = [
    'auto', 'car', 'vehicle', 'automotive', 'tire', 'brake', 'oil change',
    'mechanic', 'garage', 'transmission', 'muffler', 'body shop'
  ];
  
  const hasMandatoryKeyword = mandatoryAutomotiveKeywords.some(keyword => 
    searchText.includes(keyword)
  );
  
  if (!hasMandatoryKeyword) {
    return null; // REJECT: No automotive keywords found
  }
  
  // STRICT automotive exclusions
  const automotiveExclusions = [
    'auto insurance', 'car insurance', 'auto loan', 'car loan',
    'auto sales', 'car dealership', 'used cars', 'car lot'
  ];
  
  for (const exclusion of automotiveExclusions) {
    if (searchText.includes(exclusion)) {
      return null; // REJECT: Not a service business
    }
  }
  
  // Determine specific automotive service type
  if (searchText.includes('tire')) {
    return { businessType: 'TIRE_SHOP', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Tire Shop' };
  }
  if (searchText.includes('oil change') || searchText.includes('quick lube')) {
    return { businessType: 'OIL_CHANGE', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Oil Change' };
  }
  if (searchText.includes('car wash') || searchText.includes('auto wash')) {
    return { businessType: 'CAR_WASH', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Car Wash' };
  }
  if (searchText.includes('body shop') || searchText.includes('collision')) {
    return { businessType: 'BODY_SHOP', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Body Shop' };
  }
  if (searchText.includes('transmission')) {
    return { businessType: 'TRANSMISSION_REPAIR', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Transmission Repair' };
  }
  if (searchText.includes('brake')) {
    return { businessType: 'BRAKE_SERVICE', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Brake Service' };
  }
  if (searchText.includes('muffler') || searchText.includes('exhaust')) {
    return { businessType: 'MUFFLER_SHOP', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Muffler Shop' };
  }
  if (searchText.includes('detailing')) {
    return { businessType: 'AUTO_DETAILING', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Auto Detailing' };
  }
  
  // Default to auto repair for general automotive services
  return { businessType: 'AUTO_REPAIR', industryCategory: 'AUTOMOTIVE_SERVICES', displayName: 'Auto Repair' };
}

// RESTAURANT VALIDATION - ULTRA STRICT  
function validateRestaurantBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  // MANDATORY food service keywords
  const mandatoryFoodKeywords = [
    'restaurant', 'dining', 'food', 'cafe', 'coffee', 'bakery', 'pizza',
    'bar', 'grill', 'bistro', 'eatery', 'kitchen', 'catering'
  ];
  
  const hasMandatoryKeyword = mandatoryFoodKeywords.some(keyword => 
    searchText.includes(keyword)
  );
  
  if (!hasMandatoryKeyword) {
    return null; // REJECT: No food service keywords
  }
  
  // Determine specific restaurant type
  if (searchText.includes('coffee') || searchText.includes('cafe') || searchText.includes('espresso')) {
    return { businessType: 'COFFEE_SHOP', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Coffee Shop' };
  }
  if (searchText.includes('bakery') || searchText.includes('pastry') || searchText.includes('donut')) {
    return { businessType: 'BAKERY', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Bakery' };
  }
  if (searchText.includes('pizza')) {
    return { businessType: 'PIZZA_RESTAURANT', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Pizza Restaurant' };
  }
  if (searchText.includes('bar') || searchText.includes('pub') || searchText.includes('tavern')) {
    return { businessType: 'BAR_GRILL', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Bar & Grill' };
  }
  if (searchText.includes('catering')) {
    return { businessType: 'CATERING', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Catering' };
  }
  if (searchText.includes('fast') || searchText.includes('quick') || searchText.includes('drive')) {
    return { businessType: 'FAST_FOOD', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Fast Food' };
  }
  if (searchText.includes('fine') || searchText.includes('upscale') || searchText.includes('steakhouse')) {
    return { businessType: 'FINE_DINING', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Fine Dining' };
  }
  
  // Default to casual dining
  return { businessType: 'CASUAL_DINING', industryCategory: 'RESTAURANT_FOOD_SERVICE', displayName: 'Casual Dining' };
}

// HEALTHCARE VALIDATION - ULTRA STRICT
function validateHealthcareBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  if (searchText.includes('dental') || searchText.includes('dentist')) {
    return { businessType: 'DENTAL_PRACTICE', industryCategory: 'HEALTHCARE', displayName: 'Dental Practice' };
  }
  if (searchText.includes('veterinary') || searchText.includes('animal hospital') || searchText.includes('vet ')) {
    return { businessType: 'VETERINARY_CLINIC', industryCategory: 'HEALTHCARE', displayName: 'Veterinary Clinic' };
  }
  if (searchText.includes('medical') || searchText.includes('doctor') || searchText.includes('physician')) {
    return { businessType: 'MEDICAL_OFFICE', industryCategory: 'HEALTHCARE', displayName: 'Medical Office' };
  }
  if (searchText.includes('pharmacy') || searchText.includes('drugstore')) {
    return { businessType: 'PHARMACY', industryCategory: 'HEALTHCARE', displayName: 'Pharmacy' };
  }
  
  return null;
}

// Additional validation functions for other categories...
function validateBeautyBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  if (searchText.includes('hair salon') || searchText.includes('beauty salon')) {
    return { businessType: 'HAIR_SALON', industryCategory: 'BEAUTY_WELLNESS', displayName: 'Hair Salon' };
  }
  if (searchText.includes('nail salon') || searchText.includes('manicure')) {
    return { businessType: 'NAIL_SALON', industryCategory: 'BEAUTY_WELLNESS', displayName: 'Nail Salon' };
  }
  if (searchText.includes('spa') || searchText.includes('wellness')) {
    return { businessType: 'SPA_WELLNESS', industryCategory: 'BEAUTY_WELLNESS', displayName: 'Spa & Wellness' };
  }
  if (searchText.includes('barber')) {
    return { businessType: 'BARBERSHOP', industryCategory: 'BEAUTY_WELLNESS', displayName: 'Barbershop' };
  }
  
  return null;
}

function validateFitnessBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  if (searchText.includes('gym') || searchText.includes('fitness')) {
    return { businessType: 'GYM_FITNESS', industryCategory: 'FITNESS_RECREATION', displayName: 'Gym & Fitness' };
  }
  if (searchText.includes('yoga')) {
    return { businessType: 'YOGA_STUDIO', industryCategory: 'FITNESS_RECREATION', displayName: 'Yoga Studio' };
  }
  
  return null;
}

function validatePetServicesBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  if (searchText.includes('pet grooming') || searchText.includes('dog grooming')) {
    return { businessType: 'PET_GROOMING', industryCategory: 'PET_SERVICES', displayName: 'Pet Grooming' };
  }
  if (searchText.includes('pet store') || searchText.includes('pet shop')) {
    return { businessType: 'PET_STORE', industryCategory: 'PET_SERVICES', displayName: 'Pet Store' };
  }
  
  return null;
}

function validateRetailBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  if (searchText.includes('boutique') || searchText.includes('clothing')) {
    return { businessType: 'BOUTIQUE_CLOTHING', industryCategory: 'SPECIALTY_RETAIL', displayName: 'Boutique Clothing' };
  }
  if (searchText.includes('jewelry')) {
    return { businessType: 'JEWELRY_STORE', industryCategory: 'SPECIALTY_RETAIL', displayName: 'Jewelry Store' };
  }
  
  return null;
}

function validateBusinessServicesBusiness(searchText: string): {
  businessType: IndustryType;
  industryCategory: IndustryCategory;
  displayName: string;
} | null {
  
  if (searchText.includes('accounting') || searchText.includes('bookkeeping') || searchText.includes('cpa')) {
    return { businessType: 'ACCOUNTING_SERVICES', industryCategory: 'BUSINESS_SERVICES', displayName: 'Accounting Services' };
  }
  if (searchText.includes('law') || searchText.includes('attorney') || searchText.includes('lawyer')) {
    return { businessType: 'LEGAL_SERVICES', industryCategory: 'BUSINESS_SERVICES', displayName: 'Legal Services' };
  }
  if (searchText.includes('real estate') || searchText.includes('realtor')) {
    return { businessType: 'REAL_ESTATE', industryCategory: 'BUSINESS_SERVICES', displayName: 'Real Estate' };
  }
  
  return null;
}

function estimateRevenue(reviewsCount: number = 0, rating: number = 0): string {
  // Simple estimation based on reviews and rating
  const score = (reviewsCount * 0.1) + (rating * 5);
  
  if (score > 50) return '$50K-100K monthly';
  if (score > 30) return '$30K-60K monthly';
  if (score > 20) return '$25K-50K monthly';
  if (score > 10) return '$20K-35K monthly';
  return '$15K-25K monthly';
}

function estimateEmployees(reviewsCount: number = 0): string {
  if (reviewsCount > 100) return '15-25 employees';
  if (reviewsCount > 50) return '10-15 employees';
  if (reviewsCount > 20) return '8-12 employees';
  if (reviewsCount > 5) return '6-10 employees';
  return '4-8 employees';
}

function estimateYearsInBusiness(reviewsCount: number = 0): string {
  // More reviews generally indicate longer time in business
  if (reviewsCount > 200) return '5+ years';
  if (reviewsCount > 100) return '4 years';
  if (reviewsCount > 50) return '3 years';
  if (reviewsCount > 20) return '2 years';
  if (reviewsCount > 5) return '1.5 years';
  return '1 year';
}

function calculateQualificationScore(business: ApifyBusiness, businessType: string): {
  indicators: {
    revenueQualified: boolean;
    experienceQualified: boolean;
    locationQualified: boolean;
    industryQualified: boolean;
  };
  score: number;
  isQualified: boolean;
} {
  const indicators = {
    revenueQualified: (business.reviewsCount || 0) > 10, // Proxy for revenue
    experienceQualified: (business.reviewsCount || 0) > 5, // Proxy for experience
    locationQualified: business.address ? business.address.includes('USA') || 
                       business.address.includes('US') || 
                       /,\s*[A-Z]{2}\s+\d{5}/.test(business.address) : true, // US format check
    industryQualified: true, // We're searching specific industry businesses
  };
  
  const score = Object.values(indicators).filter(Boolean).length * 25;
  const isQualified = score >= 75;
  
  return { indicators, score, isQualified };
}

// NEW MULTI-ACTOR APPROACH: Different actors for different industries
async function searchBusinessesByIndustry(
  industry: string,
  location: string,
  apifyClient: any
): Promise<any[]> {
  
  // Get the appropriate actor configuration based on industry
  const getActorConfig = () => {
    switch (industry) {
      case 'RESTAURANT_FOOD_SERVICE':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `restaurants in ${location}`,
              `cafes in ${location}`,
              `food service in ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'HEALTHCARE':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `medical clinics in ${location}`,
              `doctors offices in ${location}`,
              `dental offices in ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'BEAUTY_WELLNESS':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `beauty salons in ${location}`,
              `spas in ${location}`,
              `nail salons in ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'AUTOMOTIVE_SERVICES':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `auto repair shops in ${location}`,
              `car mechanics in ${location}`,
              `tire shops in ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'FITNESS_RECREATION':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `gyms in ${location}`,
              `fitness centers in ${location}`,
              `yoga studios in ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'PET_SERVICES':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `pet stores in ${location}`,
              `veterinarians in ${location}`,
              `pet grooming in ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'SPECIALTY_RETAIL':
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [
              `specialty retail stores ${location}`,
              `boutique shops ${location}`,
              `local retailers ${location}`
            ],
            maxCrawledPlacesPerSearch: 5,
            language: 'en',
            country: 'us',
          }
        };
      
      case 'BUSINESS_SERVICES':
        // Use Apollo scraper for high-quality B2B leads with verified emails and phones
        return {
          actorId: 'code_crafter/apollo-io-scraper',
          input: {
            searchUrl: `https://app.apollo.io/#/people?finderViewId=5b6dfc6273f47b30016d12d9&prospectListId=&locationNames[]=${encodeURIComponent(location)}&organizationIndustryTagIds[]=business%20services&page=1`,
            maxResults: 50, // Apollo can handle more results with better quality
            revealPhoneNumbers: true, // Get verified phone numbers
            enrichData: true, // Get additional contact info
            includeEmails: true,
            includePhoneNumbers: true,
            includeLinkedInProfiles: true,
          }
        };
      
      default:
        // Fallback to compass/crawler-google-places
        return {
          actorId: 'compass/crawler-google-places',
          input: {
            searchStringsArray: [`${industry.toLowerCase().replace(/_/g, ' ')} in ${location}`],
            maxCrawledPlacesPerSearch: 30,
            language: 'en',
            country: 'us',
          }
        };
    }
  };

  try {
    const config = getActorConfig();
    console.log(`🎯 ATTEMPTING TO USE ACTOR: "${config.actorId}" for ${industry} search in ${location}`);
    console.log('🔧 Actor input configuration:', JSON.stringify(config.input, null, 2));
    
    // First, let's test if we can access the actor at all
    console.log('🔍 Testing actor accessibility...');
    try {
      const actorInfo = await apifyClient.actor(config.actorId).get();
      console.log('✅ Actor is accessible:', actorInfo?.name);
    } catch (actorError) {
      console.error('❌ Actor access test failed:', actorError);
      throw new Error(`Actor "${config.actorId}" is not accessible with your API key: ${actorError instanceof Error ? actorError.message : 'Unknown error'}`);
    }
    
    console.log('🚀 Calling apifyClient.actor() with actorId:', config.actorId);
    const run = await apifyClient.actor(config.actorId).call(config.input, {
      timeout: 60, // 1 minute - much faster for web requests
      waitForFinish: 120, // Wait up to 2 minutes for completion
    });
    
    console.log('✅ Actor call successful, run status:', run?.status);

    console.log('Apify run completed:', run?.status);

    // Handle different response formats based on actor type
    let results = [];
    
    if (config.actorId === 'compass/crawler-google-places') {
      // Compass Google Places Crawler returns data from dataset
      if (run.defaultDatasetId) {
        console.log('Fetching results from dataset:', run.defaultDatasetId);
        const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
        results = (dataset.items || []).filter((place: any) => {
          // Filter out closed businesses
          return !place.permanently_closed && !place.temporarily_closed;
        }).map((place: any) => ({
          title: place.title,
          address: place.address,
          phoneNumber: place.phoneNumber,
          website: place.website,
          categoryName: place.categoryName,
          totalScore: place.totalScore || place.rating,
          reviewsCount: place.reviewsCount,
          location: place.location,
          placeId: place.placeId,
          openingHours: place.openingHours,
          description: place.description,
          imageUrl: place.imageUrl,
        }));
      } else {
        // Fallback to run.items for compass actor
        results = (run.items || []).filter((place: any) => {
          return !place.permanently_closed && !place.temporarily_closed;
        }).map((place: any) => ({
          title: place.title,
          address: place.address,
          phoneNumber: place.phoneNumber,
          website: place.website,
          categoryName: place.categoryName,
          totalScore: place.totalScore || place.rating,
          reviewsCount: place.reviewsCount,
          location: place.location,
          placeId: place.placeId,
        }));
      }
    } else if (config.actorId === 'code_crafter/apollo-io-scraper') {
      // Apollo Scraper format for high-quality B2B leads with verified contacts
      results = (run.items || []).map((lead: any) => ({
        title: lead.company_name || lead.organization_name || lead.name,
        address: `${lead.city || ''}, ${lead.state || ''} ${lead.country || ''}`.trim(),
        phoneNumber: lead.phone || lead.phone_number || lead.mobile_phone,
        website: lead.website || lead.company_website,
        categoryName: lead.industry || lead.keywords || 'Business Services',
        totalScore: 5, // Apollo leads are high quality
        reviewsCount: 0, // Apollo doesn't provide reviews
        location: {
          lat: null,
          lng: null
        },
        description: lead.title || lead.job_title,
        // Apollo-specific enriched data
        email: lead.email,
        firstName: lead.first_name,
        lastName: lead.last_name,
        jobTitle: lead.title || lead.job_title,
        linkedinUrl: lead.linkedin_url,
        companySize: lead.company_size,
        revenue: lead.estimated_num_employees,
        employeeCount: lead.estimated_num_employees,
      }));
    } else {
      // Fallback for other actors - try to get from dataset
      if (run.defaultDatasetId) {
        console.log('Fetching results from dataset:', run.defaultDatasetId);
        const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
        results = (dataset.items || []).map((place: any) => ({
          title: place.title,
          address: place.address,
          phoneNumber: place.phoneNumber,
          website: place.website,
          categoryName: place.categoryName,
          totalScore: place.totalScore,
          reviewsCount: place.reviewsCount,
          location: place.location,
          placeId: place.placeId,
          permanently_closed: place.permanently_closed,
          temporarily_closed: place.temporarily_closed,
        }));
      } else {
        // Final fallback to run.items
        results = (run.items || []).map((place: any) => ({
          title: place.title,
          address: place.address,
          phoneNumber: place.phoneNumber,
          website: place.website,
          categoryName: place.categoryName,
          totalScore: place.totalScore || place.rating,
          reviewsCount: place.reviewsCount,
          location: place.location,
          placeId: place.placeId,
        }));
      }
    }

    // Filter out closed businesses
    results = results.filter((place: any) => 
      !place.permanently_closed && 
      !place.temporarily_closed
    );

    console.log(`Found ${results.length} ${industry} businesses in ${location}`);
    return results;

  } catch (error) {
    console.error(`❌ APIFY ACTOR ERROR for ${industry} in ${location}:`, error);
    console.error('🔍 ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      location,
      industry,
      attemptedActorId: 'compass/crawler-google-places'
    });
    
    // Check if this is the specific "actor not found" error
    if (error instanceof Error && error.message.includes('not found')) {
      console.error('🚨 ACTOR NOT FOUND ERROR - The actor "compass/crawler-google-places" does not exist or is not accessible with your API key');
    }
    
    throw error;
  }
}

// Industry-specific validation function
function validateBusinessForIndustry(business: any, industry: string): boolean {
  const industryKeywords: Record<string, string[]> = {
    RESTAURANT_FOOD_SERVICE: ['restaurant', 'cafe', 'food', 'dining', 'bistro', 'eatery'],
    HEALTHCARE: ['medical', 'clinic', 'doctor', 'dental', 'health', 'physician'],
    BEAUTY_WELLNESS: ['salon', 'spa', 'beauty', 'nail', 'hair', 'wellness'],
    AUTOMOTIVE_SERVICES: ['auto', 'car', 'mechanic', 'repair', 'tire', 'automotive'],
    FITNESS_RECREATION: ['gym', 'fitness', 'yoga', 'sports', 'recreation', 'exercise'],
    PET_SERVICES: ['pet', 'veterinary', 'animal', 'grooming', 'vet'],
    SPECIALTY_RETAIL: ['store', 'shop', 'retail', 'boutique', 'merchant'],
    BUSINESS_SERVICES: ['consulting', 'service', 'professional', 'business', 'office'],
  };

  const keywords = industryKeywords[industry] || [];
  const businessText = `${business.title} ${business.categoryName}`.toLowerCase();
  
  return keywords.some((keyword: string) => businessText.includes(keyword));
}

// Location formatting function
function formatLocationForSearch(location: string): string {
  // Ensure location is properly formatted
  // Remove extra spaces, add state if missing, etc.
  location = location.trim();
  
  // If it's just a city name, try to add state
  if (!location.includes(',')) {
    // You might want to add logic to append state based on context
    location = `${location}, USA`;
  }
  
  return location;
}

// Retry logic for failed searches
async function searchWithRetry(
  industry: string,
  location: string,
  apifyClient: any,
  maxRetries: number = 2
): Promise<any[]> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const results = await searchBusinessesByIndustry(industry, location, apifyClient);
      
      if (results.length > 0) {
        return results;
      }
      
      // If no results, try with a broader location
      if (attempt < maxRetries) {
        location = formatLocationForSearch(location);
        console.log(`Retry ${attempt + 1}: Searching with location: ${location}`);
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt + 1} failed, retrying...`);
    }
  }
  
  return [];
}

// COMPLETELY REWRITTEN: Industry-specific search query construction
function buildPreciseSearchQuery(criteria: SearchCriteria): string {
  const { location, industryCategory } = criteria;
  
  if (!industryCategory) {
    return `business near ${location}`;
  }
  
  // Get industry-specific keywords from our new mapping
  const industryKeywords = INDUSTRY_SEARCH_KEYWORDS[industryCategory as IndustryCategory];
  
  if (!industryKeywords || industryKeywords.length === 0) {
    return `business near ${location}`;
  }
  
  // CRITICAL: Use precise, targeted search terms for each industry
  switch (industryCategory) {
    case 'AUTOMOTIVE_SERVICES':
      // Ultra-specific automotive search to prevent contamination
      return `(auto repair OR car repair OR automotive service OR mechanic OR tire shop) near ${location}`;
      
    case 'RESTAURANT_FOOD_SERVICE':
      // Precise restaurant search
      return `(restaurant OR dining OR food service OR cafe OR bakery) near ${location}`;
      
    case 'HEALTHCARE':
      // Medical-specific search
      return `(medical office OR dental office OR clinic OR doctor office) near ${location}`;
      
    case 'BEAUTY_WELLNESS':
      // Beauty-specific search
      return `(hair salon OR beauty salon OR nail salon OR spa) near ${location}`;
      
    case 'FITNESS_RECREATION':
      // Fitness-specific search
      return `(gym OR fitness center OR yoga studio OR health club) near ${location}`;
      
    case 'PET_SERVICES':
      // Pet-specific search
      return `(pet grooming OR pet store OR veterinary OR animal hospital) near ${location}`;
      
    case 'SPECIALTY_RETAIL':
      // Retail-specific search
      return `(boutique OR jewelry store OR specialty store) near ${location}`;
      
    case 'BUSINESS_SERVICES':
      // Business services search
      return `(accounting firm OR law firm OR real estate office OR consulting) near ${location}`;
      
    default:
      // Use the top 5 keywords for the category
      const topKeywords = industryKeywords.slice(0, 5);
      return `(${topKeywords.join(' OR ')}) near ${location}`;
  }
}

export async function searchBusinesses(
  criteria: SearchCriteria, 
  userEmail?: string
): Promise<{
  businesses: Business[];
  totalResults: number;
  searchCriteria: SearchCriteria;
  dataSource: 'live' | 'mock';
  message?: string;
}> {
  console.log('🚀 SEARCH BUSINESSES: Function called with criteria:', criteria);
  let usingLiveData = false;
  let apifyClient: ApifyClient | null = null;
  let message = '';

  // CRITICAL: Validate that we have a specific industry category to search for
  if (!criteria.industryCategory || criteria.industryCategory === 'all') {
    console.log('⚠️ SEARCH BUSINESSES: No specific industry category provided - using mock data');
    const mockBusinesses = getStrictlyFilteredMockBusinesses(criteria);
    return {
      businesses: mockBusinesses,
      totalResults: mockBusinesses.length,
      searchCriteria: criteria,
      dataSource: 'mock',
      message: 'Please select a specific industry category for accurate results',
    };
  }

  // Prefer global client first (system-wide API key)  
  if (globalApifyClient) {
    apifyClient = globalApifyClient;
    usingLiveData = true;
    message = 'Using system Apify API key for live data';
    
    // Actor is working, removed debug testing for performance
  }

  // Fallback to user-specific API client if available
  if (!apifyClient && userEmail) {
    const { client, hasValidKey } = await getUserApifyClient(userEmail);
    if (hasValidKey && client) {
      apifyClient = client;
      usingLiveData = true;
      message = 'Using your personal Apify API key for live data';
    } else {
      message = 'No valid API key configured - using sample data';
    }
  }

  // If no API client available, return mock data
  if (!apifyClient) {
    console.log('No Apify client available, using mock data');
    const mockBusinesses = getStrictlyFilteredMockBusinesses(criteria);
    return {
      businesses: mockBusinesses,
      totalResults: mockBusinesses.length,
      searchCriteria: criteria,
      dataSource: 'mock',
      message: message || 'No API key configured - using sample data for demonstration',
    };
  }

  try {
    console.log('Starting STRICT Apify search with criteria:', criteria);
    console.log('Target industry category:', criteria.industryCategory);
    
    // Use new multi-actor approach with retry logic
    console.log(`Starting multi-actor search for ${criteria.industryCategory} in ${criteria.location}`);
    
    const items = await searchWithRetry(
      criteria.industryCategory as string,
      criteria.location,
      apifyClient
    );
    
    console.log(`Multi-actor search completed: ${items.length} items retrieved`);

    if (!items || items.length === 0) {
      return {
        businesses: [],
        totalResults: 0,
        searchCriteria: criteria,
        dataSource: usingLiveData ? 'live' : 'mock',
        message: 'No businesses found in this area',
      };
    }

    // ULTRA-STRICT FILTERING: Transform Apify results using new validation
    const businesses: Business[] = items
      .filter((item: any) => item && item.title && item.address)
      .map((item: any, index: number): Business | null => {
        const apifyBusiness: ApifyBusiness = {
          title: item.title || '',
          address: item.address || '',
          phone: item.phoneNumber || item.phone,
          website: item.website || item.url,
          category: item.categoryName,
          rating: item.totalScore || item.rating,
          reviewsCount: item.reviewsCount || 0,
          location: item.location,
          placeId: item.placeId,
          hours: item.openingHours,
          description: item.description,
          imageUrl: item.imageUrl,
        };

        // CRITICAL: Use new strict business categorization
        const businessClassification = strictBusinessCategorization(
          item.title || '',
          item.categories || [item.categoryName], 
          criteria.industryCategory as IndustryCategory
        );
        
        // REJECT: Business doesn't strictly match industry requirements
        if (!businessClassification) {
          console.log(`STRICT FILTER: Excluding "${item.title}" - failed industry validation for ${criteria.industryCategory}`);
          return null;
        }

        // DOUBLE-CHECK: Ensure the business category exactly matches what was requested
        if (businessClassification.industryCategory !== criteria.industryCategory) {
          console.log(`STRICT FILTER: Excluding "${item.title}" - category mismatch (${businessClassification.industryCategory} vs ${criteria.industryCategory})`);
          return null;
        }
        
        const qualification = calculateQualificationScore(apifyBusiness, businessClassification.businessType);
        
        return {
          id: `apify-${item.placeId || index}-${Date.now()}`,
          name: apifyBusiness.title,
          address: apifyBusiness.address,
          phone: apifyBusiness.phone,
          businessType: businessClassification.displayName,
          industryCategory: businessClassification.industryCategory,
          estimatedRevenue: estimateRevenue(apifyBusiness.reviewsCount, apifyBusiness.rating),
          yearsInBusiness: estimateYearsInBusiness(apifyBusiness.reviewsCount),
          employeeCount: estimateEmployees(apifyBusiness.reviewsCount),
          website: apifyBusiness.website,
          qualificationIndicators: qualification.indicators,
          qualificationScore: qualification.score,
          isQualified: qualification.isQualified,
        };
      })
      .filter((business): business is Business => business !== null); // Remove all rejected businesses

    console.log(`STRICT FILTERING: ${items.length} raw results -> ${businesses.length} validated ${criteria.industryCategory} businesses`);

    return {
      businesses,
      totalResults: businesses.length,
      searchCriteria: criteria,
      dataSource: 'live',
      message: message || `Found ${businesses.length} verified ${criteria.industryCategory.toLowerCase().replace('_', ' ')} businesses using strict validation`,
    };

  } catch (error) {
    console.error('Error in Apify search:', error);
    
    // Fallback to mock data in case of error
    const mockBusinesses = getStrictlyFilteredMockBusinesses(criteria);
    
    return {
      businesses: mockBusinesses,
      totalResults: mockBusinesses.length,
      searchCriteria: criteria,
      dataSource: 'mock',
      message: `Live data failed - using sample data (Error: ${error instanceof Error ? error.message : 'Unknown error'})`,
    };
  }
}

// STRICT MOCK DATA: Industry-specific examples with ultra-precise categorization
function getStrictlyFilteredMockBusinesses(criteria: SearchCriteria): Business[] {
  
  // COMPREHENSIVE MOCK DATA: Organized by industry category with multiple examples per category
  const allMockBusinesses: Business[] = [
    // HEALTHCARE BUSINESSES
    {
      id: 'healthcare-1',
      name: 'Family Health Clinic',
      address: `456 Healthcare Ave, ${criteria.location}`,
      phone: '(555) 555-0123',
      businessType: 'Medical Office',
      industryCategory: 'HEALTHCARE',
      estimatedRevenue: '$25K-50K monthly',
      yearsInBusiness: '3 years',
      employeeCount: '8-12 employees',
      website: 'https://familyhealthclinic.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 85,
      isQualified: true,
    },
    {
      id: 'healthcare-2',
      name: 'Sunshine Dental Group',
      address: `789 Smile Street, ${criteria.location}`,
      phone: '(555) 555-0456',
      businessType: 'Dental Practice',
      industryCategory: 'HEALTHCARE',
      estimatedRevenue: '$30K-60K monthly',
      yearsInBusiness: '5 years',
      employeeCount: '10-15 employees',
      website: 'https://sunshinedentalgroup.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 92,
      isQualified: true,
    },
    {
      id: 'healthcare-3',
      name: 'Premier Animal Hospital',
      address: `321 Pet Care Blvd, ${criteria.location}`,
      phone: '(555) 555-0789',
      businessType: 'Veterinary Clinic',
      industryCategory: 'HEALTHCARE',
      estimatedRevenue: '$40K-70K monthly',
      yearsInBusiness: '8 years',
      employeeCount: '12-18 employees',
      website: 'https://premieranimalhospital.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 95,
      isQualified: true,
    },

    // AUTOMOTIVE SERVICES BUSINESSES  
    {
      id: 'automotive-1',
      name: 'Mike\'s Auto Repair',
      address: `890 Mechanic Lane, ${criteria.location}`,
      phone: '(555) 555-0654',
      businessType: 'Auto Repair',
      industryCategory: 'AUTOMOTIVE_SERVICES',
      estimatedRevenue: '$20K-40K monthly',
      yearsInBusiness: '6 years',
      employeeCount: '8-12 employees',
      website: 'https://mikesautorepair.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 86,
      isQualified: true,
    },
    {
      id: 'automotive-2',
      name: 'QuickLube Express',
      address: `445 Service Road, ${criteria.location}`,
      phone: '(555) 555-0987',
      businessType: 'Oil Change',
      industryCategory: 'AUTOMOTIVE_SERVICES',
      estimatedRevenue: '$15K-25K monthly',
      yearsInBusiness: '3 years',
      employeeCount: '6-8 employees',
      website: 'https://quicklubeexpress.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 78,
      isQualified: true,
    },
    {
      id: 'automotive-3',
      name: 'Pro Tire Center',
      address: `667 Tire Street, ${criteria.location}`,
      phone: '(555) 555-0321',
      businessType: 'Tire Shop',
      industryCategory: 'AUTOMOTIVE_SERVICES',
      estimatedRevenue: '$30K-50K monthly',
      yearsInBusiness: '4 years',
      employeeCount: '10-14 employees',
      website: 'https://protirecenter.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 82,
      isQualified: true,
    },

    // RESTAURANT & FOOD SERVICE BUSINESSES
    {
      id: 'restaurant-1',
      name: 'Tony\'s Italian Bistro',
      address: `123 Main Street, ${criteria.location}`,
      phone: '(555) 555-0789',
      businessType: 'Casual Dining',
      industryCategory: 'RESTAURANT_FOOD_SERVICE',
      estimatedRevenue: '$35K-65K monthly',
      yearsInBusiness: '4 years',
      employeeCount: '15-20 employees',
      website: 'https://tonysitalianbistro.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 88,
      isQualified: true,
    },
    {
      id: 'restaurant-2',
      name: 'Corner Coffee House',
      address: `234 Coffee Lane, ${criteria.location}`,
      phone: '(555) 555-0456',
      businessType: 'Coffee Shop',
      industryCategory: 'RESTAURANT_FOOD_SERVICE',
      estimatedRevenue: '$20K-35K monthly',
      yearsInBusiness: '2 years',
      employeeCount: '8-12 employees',
      website: 'https://cornercoffeehouse.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 75,
      isQualified: true,
    },
    {
      id: 'restaurant-3',
      name: 'Gino\'s Pizza Palace',
      address: `345 Pizza Plaza, ${criteria.location}`,
      phone: '(555) 555-0123',
      businessType: 'Pizza Restaurant',
      industryCategory: 'RESTAURANT_FOOD_SERVICE',
      estimatedRevenue: '$25K-45K monthly',
      yearsInBusiness: '7 years',
      employeeCount: '12-16 employees',
      website: 'https://ginospizzapalace.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 90,
      isQualified: true,
    },

    // BEAUTY & WELLNESS BUSINESSES
    {
      id: 'beauty-1',
      name: 'Bella Hair Studio',
      address: `567 Beauty Boulevard, ${criteria.location}`,
      phone: '(555) 555-0321',
      businessType: 'Hair Salon',
      industryCategory: 'BEAUTY_WELLNESS',
      estimatedRevenue: '$15K-30K monthly',
      yearsInBusiness: '2 years',
      employeeCount: '6-10 employees',
      website: 'https://bellahairstudio.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 80,
      isQualified: true,
    },
    {
      id: 'beauty-2',
      name: 'Luxe Nail Spa',
      address: `678 Spa Street, ${criteria.location}`,
      phone: '(555) 555-0654',
      businessType: 'Nail Salon',
      industryCategory: 'BEAUTY_WELLNESS',
      estimatedRevenue: '$18K-32K monthly',
      yearsInBusiness: '3 years',
      employeeCount: '8-12 employees',
      website: 'https://luxenailspa.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 83,
      isQualified: true,
    },

    // FITNESS & RECREATION BUSINESSES
    {
      id: 'fitness-1',
      name: 'PowerFit Gym',
      address: `234 Fitness Street, ${criteria.location}`,
      phone: '(555) 555-0987',
      businessType: 'Gym & Fitness',
      industryCategory: 'FITNESS_RECREATION',
      estimatedRevenue: '$25K-55K monthly',
      yearsInBusiness: '3 years',
      employeeCount: '12-18 employees',
      website: 'https://powerfitgym.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 83,
      isQualified: true,
    },

    // PET SERVICES BUSINESSES
    {
      id: 'pet-1',
      name: 'Happy Tails Pet Grooming',
      address: `789 Pet Lane, ${criteria.location}`,
      phone: '(555) 555-0147',
      businessType: 'Pet Grooming',
      industryCategory: 'PET_SERVICES',
      estimatedRevenue: '$12K-22K monthly',
      yearsInBusiness: '2 years',
      employeeCount: '4-6 employees',
      website: 'https://happytailsgrooming.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 76,
      isQualified: true,
    },

    // BUSINESS SERVICES BUSINESSES
    {
      id: 'business-1',
      name: 'Thompson & Associates CPA',
      address: `890 Business Park Dr, ${criteria.location}`,
      phone: '(555) 555-0258',
      businessType: 'Accounting Services',
      industryCategory: 'BUSINESS_SERVICES',
      estimatedRevenue: '$40K-80K monthly',
      yearsInBusiness: '8 years',
      employeeCount: '15-25 employees',
      website: 'https://thompsoncpa.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        industryQualified: true,
      },
      qualificationScore: 94,
      isQualified: true,
    }
  ];

  // ULTRA-STRICT FILTERING: Only return businesses that exactly match the requested industry category
  if (!criteria.industryCategory || criteria.industryCategory === 'all') {
    console.log('MOCK DATA: No specific industry category requested - returning limited sample');
    // Return a small sample from each category
    return allMockBusinesses.slice(0, 6);
  }

  // Filter by exact industry category match
  const categoryFilteredBusinesses = allMockBusinesses.filter(business => 
    business.industryCategory === criteria.industryCategory
  );

  console.log(`MOCK DATA: Filtered to ${categoryFilteredBusinesses.length} businesses for category ${criteria.industryCategory}`);
  
  // Additional filtering by specific industry types if provided
  if (criteria.industryTypes && criteria.industryTypes.length > 0) {
    const typeFilteredBusinesses = categoryFilteredBusinesses.filter(business => {
      // Convert display names back to enum values for matching
      const businessTypeEnum = business.businessType.toUpperCase().replace(/\s+/g, '_').replace(/&/g, '');
      return criteria.industryTypes.some(type => 
        type === businessTypeEnum || 
        business.businessType === type ||
        business.businessType.includes(type)
      );
    });
    
    console.log(`MOCK DATA: Further filtered to ${typeFilteredBusinesses.length} businesses for specific types`);
    return typeFilteredBusinesses;
  }

  return categoryFilteredBusinesses;
}

export default {
  searchBusinesses,
};
