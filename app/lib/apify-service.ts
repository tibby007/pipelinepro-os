
import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

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
}

// Map search business types to Google Maps search terms
const businessTypeMapping: Record<string, string[]> = {
  // Healthcare
  'MEDICAL_OFFICE': ['medical office', 'family practice', 'primary care', 'general practitioner'],
  'DENTAL_PRACTICE': ['dental office', 'dentist', 'dental clinic', 'orthodontist'],
  'VETERINARY_CLINIC': ['veterinary clinic', 'animal hospital', 'vet clinic', 'veterinarian'],
  'PHYSICAL_THERAPY': ['physical therapy', 'physiotherapy', 'rehabilitation center'],
  'MENTAL_HEALTH': ['mental health clinic', 'psychiatrist', 'psychologist', 'counseling center'],
  'URGENT_CARE': ['urgent care', 'walk-in clinic', 'immediate care'],
  'MEDICAL_IMAGING': ['medical imaging', 'radiology center', 'MRI center', 'X-ray clinic'],
  'LABORATORY': ['medical laboratory', 'lab services', 'diagnostic lab'],
  'PHARMACY': ['pharmacy', 'drugstore', 'medical pharmacy'],
  'SPECIALTY_CLINIC': ['specialty clinic', 'specialist', 'medical specialist'],
  'CHIROPRACTIC': ['chiropractor', 'chiropractic clinic', 'spinal adjustment'],
  'OPTOMETRY': ['optometrist', 'eye doctor', 'vision center', 'optical shop'],
  'DERMATOLOGY': ['dermatologist', 'skin clinic', 'dermatology office'],
  
  // Restaurants & Food Service
  'FAST_FOOD': ['fast food', 'quick service restaurant', 'burger', 'pizza', 'sandwich shop'],
  'CASUAL_DINING': ['restaurant', 'casual dining', 'family restaurant', 'bistro', 'grill'],
  'FINE_DINING': ['fine dining', 'upscale restaurant', 'steakhouse', 'fine restaurant'],
  'COFFEE_SHOP': ['coffee shop', 'cafe', 'coffee house', 'espresso bar'],
  'BAKERY': ['bakery', 'bakehouse', 'pastry shop', 'bread shop'],
  'FOOD_TRUCK': ['food truck', 'mobile food', 'street food'],
  'CATERING': ['catering', 'catering service', 'event catering'],
  'BAR_GRILL': ['bar and grill', 'sports bar', 'pub', 'tavern'],
  'PIZZA_RESTAURANT': ['pizza', 'pizzeria', 'pizza restaurant'],
  'ETHNIC_CUISINE': ['ethnic restaurant', 'mexican restaurant', 'chinese restaurant', 'italian restaurant'],
  
  // Beauty & Wellness
  'HAIR_SALON': ['hair salon', 'beauty salon', 'hairstylist', 'hair studio'],
  'NAIL_SALON': ['nail salon', 'nail spa', 'manicure', 'pedicure'],
  'SPA_WELLNESS': ['spa', 'wellness center', 'day spa', 'wellness spa'],
  'MASSAGE_THERAPY': ['massage therapy', 'massage therapist', 'therapeutic massage'],
  'TATTOO_PARLOR': ['tattoo parlor', 'tattoo shop', 'tattoo artist'],
  'BARBERSHOP': ['barbershop', 'barber', 'mens grooming'],
  'BEAUTY_SUPPLY': ['beauty supply', 'cosmetics store', 'beauty products'],
  'COSMETIC_SERVICES': ['cosmetic services', 'makeup artist', 'esthetician'],
  'TANNING_SALON': ['tanning salon', 'tanning studio', 'sun tanning'],
  
  // Automotive Services
  'AUTO_REPAIR': ['auto repair', 'car repair', 'automotive service', 'mechanic', 'garage'],
  'OIL_CHANGE': ['oil change', 'quick lube', 'automotive maintenance'],
  'TIRE_SHOP': ['tire shop', 'tire service', 'tire store'],
  'CAR_WASH': ['car wash', 'auto wash', 'vehicle cleaning'],
  'AUTO_DETAILING': ['auto detailing', 'car detailing', 'vehicle detailing'],
  'TRANSMISSION_REPAIR': ['transmission repair', 'transmission service'],
  'BODY_SHOP': ['auto body shop', 'collision repair', 'body work'],
  'MUFFLER_SHOP': ['muffler shop', 'exhaust service', 'muffler repair'],
  'BRAKE_SERVICE': ['brake service', 'brake repair', 'brake shop'],
  
  // Fitness & Recreation
  'GYM_FITNESS': ['gym', 'fitness center', 'health club', 'workout facility'],
  'YOGA_STUDIO': ['yoga studio', 'yoga class', 'yoga center'],
  'MARTIAL_ARTS': ['martial arts', 'karate', 'taekwondo', 'jiu jitsu'],
  'DANCE_STUDIO': ['dance studio', 'dance school', 'dance lessons'],
  'PERSONAL_TRAINING': ['personal trainer', 'fitness trainer', 'personal training'],
  'SPORTS_FACILITY': ['sports facility', 'athletic facility', 'sports center'],
  'RECREATION_CENTER': ['recreation center', 'community center', 'rec center'],
  'CLIMBING_GYM': ['climbing gym', 'rock climbing', 'bouldering'],
  
  // Pet Services
  'VETERINARY_SERVICES': ['veterinarian', 'animal hospital', 'vet clinic', 'pet clinic'],
  'PET_GROOMING': ['pet grooming', 'dog grooming', 'pet salon'],
  'PET_BOARDING': ['pet boarding', 'dog boarding', 'pet hotel'],
  'PET_TRAINING': ['pet training', 'dog training', 'obedience training'],
  'PET_DAYCARE': ['pet daycare', 'dog daycare', 'pet care'],
  'PET_STORE': ['pet store', 'pet shop', 'pet supplies'],
  'DOG_WALKING': ['dog walking', 'pet sitting', 'dog walker'],
  
  // Specialty Retail
  'BOUTIQUE_CLOTHING': ['boutique', 'clothing store', 'fashion boutique', 'apparel'],
  'JEWELRY_STORE': ['jewelry store', 'jeweler', 'jewelry shop'],
  'ELECTRONICS_REPAIR': ['electronics repair', 'computer repair', 'phone repair'],
  'BIKE_SHOP': ['bike shop', 'bicycle store', 'cycle shop'],
  'BOOKSTORE': ['bookstore', 'book shop', 'books'],
  'GIFT_SHOP': ['gift shop', 'gift store', 'novelty store'],
  'SPORTING_GOODS': ['sporting goods', 'sports store', 'athletic equipment'],
  'HOME_DECOR': ['home decor', 'furniture store', 'interior design'],
  'ANTIQUE_SHOP': ['antique shop', 'antiques', 'vintage store'],
  
  // Business Services
  'ACCOUNTING_SERVICES': ['accounting', 'accountant', 'bookkeeping', 'CPA', 'tax services'],
  'LEGAL_SERVICES': ['lawyer', 'attorney', 'law firm', 'legal services'],
  'MARKETING_AGENCY': ['marketing agency', 'advertising agency', 'digital marketing'],
  'CONSULTING': ['consulting', 'business consultant', 'management consulting'],
  'REAL_ESTATE': ['real estate', 'realtor', 'real estate agent', 'property management'],
  'INSURANCE_AGENCY': ['insurance', 'insurance agent', 'insurance agency'],
  'FINANCIAL_PLANNING': ['financial planner', 'financial advisor', 'investment advisor'],
  'IT_SERVICES': ['IT services', 'computer services', 'technology services'],
  'CLEANING_SERVICES': ['cleaning service', 'janitorial', 'commercial cleaning'],
  'LANDSCAPING': ['landscaping', 'lawn care', 'gardening service'],
  
  'all': ['business', 'service', 'store', 'shop', 'center', 'office']
};

// Map display names back to our enum values and determine industry categories
const displayNameToType: Record<string, { type: string; category: string }> = {
  // Healthcare
  'Medical Office': { type: 'MEDICAL_OFFICE', category: 'HEALTHCARE' },
  'Dental Practice': { type: 'DENTAL_PRACTICE', category: 'HEALTHCARE' },
  'Veterinary Clinic': { type: 'VETERINARY_CLINIC', category: 'HEALTHCARE' },
  'Physical Therapy': { type: 'PHYSICAL_THERAPY', category: 'HEALTHCARE' },
  'Mental Health': { type: 'MENTAL_HEALTH', category: 'HEALTHCARE' },
  'Urgent Care': { type: 'URGENT_CARE', category: 'HEALTHCARE' },
  'Medical Imaging': { type: 'MEDICAL_IMAGING', category: 'HEALTHCARE' },
  'Laboratory': { type: 'LABORATORY', category: 'HEALTHCARE' },
  'Pharmacy': { type: 'PHARMACY', category: 'HEALTHCARE' },
  'Specialty Clinic': { type: 'SPECIALTY_CLINIC', category: 'HEALTHCARE' },
  'Chiropractic': { type: 'CHIROPRACTIC', category: 'HEALTHCARE' },
  'Optometry': { type: 'OPTOMETRY', category: 'HEALTHCARE' },
  'Dermatology': { type: 'DERMATOLOGY', category: 'HEALTHCARE' },
  
  // Restaurants & Food Service
  'Fast Food': { type: 'FAST_FOOD', category: 'RESTAURANT_FOOD_SERVICE' },
  'Casual Dining': { type: 'CASUAL_DINING', category: 'RESTAURANT_FOOD_SERVICE' },
  'Fine Dining': { type: 'FINE_DINING', category: 'RESTAURANT_FOOD_SERVICE' },
  'Coffee Shop': { type: 'COFFEE_SHOP', category: 'RESTAURANT_FOOD_SERVICE' },
  'Bakery': { type: 'BAKERY', category: 'RESTAURANT_FOOD_SERVICE' },
  'Food Truck': { type: 'FOOD_TRUCK', category: 'RESTAURANT_FOOD_SERVICE' },
  'Catering': { type: 'CATERING', category: 'RESTAURANT_FOOD_SERVICE' },
  'Bar & Grill': { type: 'BAR_GRILL', category: 'RESTAURANT_FOOD_SERVICE' },
  'Pizza Restaurant': { type: 'PIZZA_RESTAURANT', category: 'RESTAURANT_FOOD_SERVICE' },
  'Ethnic Cuisine': { type: 'ETHNIC_CUISINE', category: 'RESTAURANT_FOOD_SERVICE' },
  
  // Beauty & Wellness
  'Hair Salon': { type: 'HAIR_SALON', category: 'BEAUTY_WELLNESS' },
  'Nail Salon': { type: 'NAIL_SALON', category: 'BEAUTY_WELLNESS' },
  'Spa & Wellness': { type: 'SPA_WELLNESS', category: 'BEAUTY_WELLNESS' },
  'Massage Therapy': { type: 'MASSAGE_THERAPY', category: 'BEAUTY_WELLNESS' },
  'Tattoo Parlor': { type: 'TATTOO_PARLOR', category: 'BEAUTY_WELLNESS' },
  'Barbershop': { type: 'BARBERSHOP', category: 'BEAUTY_WELLNESS' },
  'Beauty Supply': { type: 'BEAUTY_SUPPLY', category: 'BEAUTY_WELLNESS' },
  'Cosmetic Services': { type: 'COSMETIC_SERVICES', category: 'BEAUTY_WELLNESS' },
  'Tanning Salon': { type: 'TANNING_SALON', category: 'BEAUTY_WELLNESS' },
  
  // Automotive Services
  'Auto Repair': { type: 'AUTO_REPAIR', category: 'AUTOMOTIVE_SERVICES' },
  'Oil Change': { type: 'OIL_CHANGE', category: 'AUTOMOTIVE_SERVICES' },
  'Tire Shop': { type: 'TIRE_SHOP', category: 'AUTOMOTIVE_SERVICES' },
  'Car Wash': { type: 'CAR_WASH', category: 'AUTOMOTIVE_SERVICES' },
  'Auto Detailing': { type: 'AUTO_DETAILING', category: 'AUTOMOTIVE_SERVICES' },
  'Transmission Repair': { type: 'TRANSMISSION_REPAIR', category: 'AUTOMOTIVE_SERVICES' },
  'Body Shop': { type: 'BODY_SHOP', category: 'AUTOMOTIVE_SERVICES' },
  'Muffler Shop': { type: 'MUFFLER_SHOP', category: 'AUTOMOTIVE_SERVICES' },
  'Brake Service': { type: 'BRAKE_SERVICE', category: 'AUTOMOTIVE_SERVICES' },
  
  // Add more categories as needed - keeping this shorter for now
  'Other': { type: 'OTHER', category: 'BUSINESS_SERVICES' }
};

function categorizeBusinessType(categories: string[] = [], title: string = ''): { type: string; category: string } | null {
  const searchText = `${categories.join(' ')} ${title}`.toLowerCase();
  
  // First, check for obvious non-food businesses that should be excluded
  const excludePatterns = [
    'telecom', 'telecommunications', 'verizon', 'at&t', 'sprint', 'internet', 'phone service',
    'web design', 'web development', 'web llc', 'website', 'digital marketing', 'seo',
    'insurance', 'financial', 'bank', 'credit', 'loan', 'mortgage',
    'construction', 'plumbing', 'electrical', 'hvac', 'roofing',
    'medical equipment', 'supplies', 'wholesale', 'distribution',
    'government', 'municipal', 'city hall', 'courthouse', 'post office'
  ];
  
  for (const pattern of excludePatterns) {
    if (searchText.includes(pattern)) {
      return null; // Exclude this business entirely
    }
  }
  
  // Healthcare
  if (searchText.includes('dental') || searchText.includes('dentist') || searchText.includes('orthodont')) {
    return { type: 'Dental Practice', category: 'HEALTHCARE' };
  }
  if (searchText.includes('veterinary') || searchText.includes('animal') || searchText.includes('vet ')) {
    return { type: 'Veterinary Clinic', category: 'HEALTHCARE' };
  }
  if (searchText.includes('physical therapy') || searchText.includes('physiotherapy') || searchText.includes('rehabilitation')) {
    return { type: 'Physical Therapy', category: 'HEALTHCARE' };
  }
  if (searchText.includes('mental health') || searchText.includes('psychiatr') || searchText.includes('psychol') || searchText.includes('counseling')) {
    return { type: 'Mental Health', category: 'HEALTHCARE' };
  }
  if (searchText.includes('urgent care') || searchText.includes('walk-in')) {
    return { type: 'Urgent Care', category: 'HEALTHCARE' };
  }
  if (searchText.includes('pharmacy') || searchText.includes('drugstore')) {
    return { type: 'Pharmacy', category: 'HEALTHCARE' };
  }
  if (searchText.includes('chiropract')) {
    return { type: 'Chiropractic', category: 'HEALTHCARE' };
  }
  if (searchText.includes('optometr') || searchText.includes('eye doctor') || searchText.includes('vision')) {
    return { type: 'Optometry', category: 'HEALTHCARE' };
  }
  
  // Restaurants & Food Service - Enhanced detection
  const restaurantKeywords = [
    'restaurant', 'dining', 'bistro', 'grill', 'eatery', 'diner', 'steakhouse',
    'coffee', 'cafe', 'espresso', 'coffeehouse',
    'bakery', 'pastry', 'bread', 'donut', 'bagel',
    'pizza', 'pizzeria',
    'bar', 'pub', 'tavern', 'brewery', 'sports bar',
    'catering', 'food service',
    'sandwich', 'deli', 'sub', 'hoagie',
    'burger', 'bbq', 'barbecue', 'wings', 'chicken',
    'taco', 'mexican', 'chinese', 'indian', 'thai', 'sushi', 'japanese',
    'food truck', 'ice cream', 'frozen yogurt',
    'buffet', 'brunch', 'breakfast', 'lunch', 'dinner'
  ];
  
  const hasRestaurantKeyword = restaurantKeywords.some(keyword => searchText.includes(keyword));
  
  if (hasRestaurantKeyword) {
    // More specific restaurant categorization
    if (searchText.includes('coffee') || searchText.includes('cafe') || searchText.includes('espresso')) {
      return { type: 'Coffee Shop', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    if (searchText.includes('bakery') || searchText.includes('pastry') || searchText.includes('bread') || searchText.includes('donut')) {
      return { type: 'Bakery', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    if (searchText.includes('pizza')) {
      return { type: 'Pizza Restaurant', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    if (searchText.includes('bar') || searchText.includes('pub') || searchText.includes('tavern') || searchText.includes('brewery')) {
      return { type: 'Bar & Grill', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    if (searchText.includes('catering')) {
      return { type: 'Catering', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    if (searchText.includes('fast') || searchText.includes('quick') || searchText.includes('burger') || searchText.includes('drive')) {
      return { type: 'Fast Food', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    if (searchText.includes('fine') || searchText.includes('upscale') || searchText.includes('steakhouse')) {
      return { type: 'Fine Dining', category: 'RESTAURANT_FOOD_SERVICE' };
    }
    // Default to casual dining for other restaurants
    return { type: 'Casual Dining', category: 'RESTAURANT_FOOD_SERVICE' };
  }
  
  // Beauty & Wellness
  if (searchText.includes('hair salon') || searchText.includes('beauty salon') || searchText.includes('hairstylist')) {
    return { type: 'Hair Salon', category: 'BEAUTY_WELLNESS' };
  }
  if (searchText.includes('nail salon') || searchText.includes('manicure') || searchText.includes('pedicure')) {
    return { type: 'Nail Salon', category: 'BEAUTY_WELLNESS' };
  }
  if (searchText.includes('spa') || searchText.includes('wellness')) {
    return { type: 'Spa & Wellness', category: 'BEAUTY_WELLNESS' };
  }
  if (searchText.includes('massage')) {
    return { type: 'Massage Therapy', category: 'BEAUTY_WELLNESS' };
  }
  if (searchText.includes('barber')) {
    return { type: 'Barbershop', category: 'BEAUTY_WELLNESS' };
  }
  if (searchText.includes('tattoo')) {
    return { type: 'Tattoo Parlor', category: 'BEAUTY_WELLNESS' };
  }
  
  // Automotive Services
  if (searchText.includes('auto repair') || searchText.includes('car repair') || searchText.includes('mechanic') || searchText.includes('garage')) {
    return { type: 'Auto Repair', category: 'AUTOMOTIVE_SERVICES' };
  }
  if (searchText.includes('oil change') || searchText.includes('lube')) {
    return { type: 'Oil Change', category: 'AUTOMOTIVE_SERVICES' };
  }
  if (searchText.includes('tire')) {
    return { type: 'Tire Shop', category: 'AUTOMOTIVE_SERVICES' };
  }
  if (searchText.includes('car wash') || searchText.includes('auto wash')) {
    return { type: 'Car Wash', category: 'AUTOMOTIVE_SERVICES' };
  }
  
  // Fitness & Recreation
  if (searchText.includes('gym') || searchText.includes('fitness') || searchText.includes('health club')) {
    return { type: 'Gym & Fitness', category: 'FITNESS_RECREATION' };
  }
  if (searchText.includes('yoga')) {
    return { type: 'Yoga Studio', category: 'FITNESS_RECREATION' };
  }
  if (searchText.includes('martial arts') || searchText.includes('karate') || searchText.includes('taekwondo')) {
    return { type: 'Martial Arts', category: 'FITNESS_RECREATION' };
  }
  
  // Pet Services
  if (searchText.includes('pet grooming') || searchText.includes('dog grooming')) {
    return { type: 'Pet Grooming', category: 'PET_SERVICES' };
  }
  if (searchText.includes('pet boarding') || searchText.includes('dog boarding')) {
    return { type: 'Pet Boarding', category: 'PET_SERVICES' };
  }
  if (searchText.includes('pet store') || searchText.includes('pet shop')) {
    return { type: 'Pet Store', category: 'PET_SERVICES' };
  }
  
  // Business Services
  if (searchText.includes('accounting') || searchText.includes('bookkeeping') || searchText.includes('cpa')) {
    return { type: 'Accounting Services', category: 'BUSINESS_SERVICES' };
  }
  if (searchText.includes('lawyer') || searchText.includes('attorney') || searchText.includes('law')) {
    return { type: 'Legal Services', category: 'BUSINESS_SERVICES' };
  }
  if (searchText.includes('real estate') || searchText.includes('realtor')) {
    return { type: 'Real Estate', category: 'BUSINESS_SERVICES' };
  }
  
  // For unrecognized businesses, return null to exclude them
  // This prevents random businesses from being included in industry-specific searches
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

function buildSearchQuery(criteria: SearchCriteria): string {
  const { location, industryTypes, industryCategory } = criteria;
  
  // If no specific industry types, search broadly
  if (industryTypes.length === 0) {
    return `business near ${location}`;
  }
  
  // If many industry types, use generic terms
  if (industryTypes.length > 5) {
    return `business services near ${location}`;
  }
  
  // For restaurant searches, be very specific with multiple restaurant-focused terms
  if (industryCategory === 'RESTAURANT_FOOD_SERVICE') {
    const restaurantTerms: string[] = [];
    for (const industryType of industryTypes.slice(0, 3)) {
      const terms = businessTypeMapping[industryType];
      if (terms && terms.length > 0) {
        // Use all terms for restaurants to be more specific
        restaurantTerms.push(...terms.slice(0, 2)); // Use first 2 terms per type
      }
    }
    
    // Add general restaurant terms to ensure we get restaurants
    restaurantTerms.push('restaurant', 'food', 'dining', 'cafe', 'eatery');
    
    // Remove duplicates and create specific query
    const uniqueTerms = [...new Set(restaurantTerms)];
    return `(${uniqueTerms.slice(0, 8).join(' OR ')}) near ${location}`;
  }
  
  // Use specific terms for other industries  
  const searchTerms: string[] = [];
  for (const industryType of industryTypes.slice(0, 3)) { // Limit to first 3 for query length
    const terms = businessTypeMapping[industryType];
    if (terms && terms.length > 0) {
      searchTerms.push(terms[0]); // Use primary term
    }
  }
  
  const queryTerms = searchTerms.length > 0 ? searchTerms.join(' OR ') : 'business';
  return `${queryTerms} near ${location}`;
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
  let usingLiveData = false;
  let apifyClient: ApifyClient | null = null;
  let message = '';

  // Try to get user-specific API client first
  if (userEmail) {
    const { client, hasValidKey } = await getUserApifyClient(userEmail);
    if (hasValidKey && client) {
      apifyClient = client;
      usingLiveData = true;
      message = 'Using your personal Apify API key for live data';
    } else {
      message = 'No valid API key configured - using sample data';
    }
  }

  // Fallback to global client if available
  if (!apifyClient && globalApifyClient) {
    apifyClient = globalApifyClient;
    usingLiveData = true;
    message = 'Using system Apify API key for live data';
  }

  // If no API client available, return mock data
  if (!apifyClient) {
    console.log('No Apify client available, using mock data');
    const mockBusinesses = getMockBusinesses(criteria);
    return {
      businesses: mockBusinesses,
      totalResults: mockBusinesses.length,
      searchCriteria: criteria,
      dataSource: 'mock',
      message: message || 'No API key configured - using sample data for demonstration',
    };
  }

  try {
    console.log('Starting Apify search with criteria:', criteria);
    console.log('Using live data:', usingLiveData);
    
    const searchQuery = buildSearchQuery(criteria);
    console.log('Search query:', searchQuery);
    
    // Run the Google Maps scraper
    const input = {
      searchStringsArray: [searchQuery],
      maxCrawledPlacesPerSearch: 20, // Limit results
      language: 'en',
      country: 'us',
      includeHistogram: false,
      includeOpeningHours: false,
      includeImages: false,
      exportPlaceUrls: false,
      additionalInfo: false,
      maxReviews: 0, // Don't scrape reviews to speed up
      maxImages: 0,
      deeperCityScrape: false,
    };

    console.log('Running Apify actor with input:', input);
    
    // Using a popular Google Maps scraper actor
    const run = await apifyClient.actor('compass/crawler-google-places').call(input, {
      timeout: 300, // 5 minutes timeout
    });

    console.log('Apify run completed:', run);

    if (!run?.defaultDatasetId) {
      throw new Error('No dataset returned from Apify');
    }

    // Get the results
    const dataset = await apifyClient.dataset(run.defaultDatasetId);
    const { items } = await dataset.listItems();
    
    console.log(`Retrieved ${items.length} items from Apify`);

    if (!items || items.length === 0) {
      return {
        businesses: [],
        totalResults: 0,
        searchCriteria: criteria,
        dataSource: usingLiveData ? 'live' : 'mock',
        message: 'No businesses found in this area',
      };
    }

    // Transform Apify results to our format with improved filtering
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

        const businessClassification = categorizeBusinessType(
          item.categories || [item.categoryName], 
          item.title
        );
        
        // If business classification returns null, exclude this business
        if (!businessClassification) {
          console.log(`Excluding business: ${item.title} - doesn't match industry criteria`);
          return null;
        }

        // Additional filter: if searching for specific industry category, ensure it matches
        if (criteria.industryCategory && criteria.industryCategory !== 'all') {
          if (businessClassification.category !== criteria.industryCategory) {
            console.log(`Excluding business: ${item.title} - category mismatch (${businessClassification.category} vs ${criteria.industryCategory})`);
            return null;
          }
        }
        
        const qualification = calculateQualificationScore(apifyBusiness, businessClassification.type);
        
        return {
          id: `apify-${item.placeId || index}-${Date.now()}`,
          name: apifyBusiness.title,
          address: apifyBusiness.address,
          phone: apifyBusiness.phone,
          businessType: businessClassification.type,
          industryCategory: businessClassification.category,
          estimatedRevenue: estimateRevenue(apifyBusiness.reviewsCount, apifyBusiness.rating),
          yearsInBusiness: estimateYearsInBusiness(apifyBusiness.reviewsCount),
          employeeCount: estimateEmployees(apifyBusiness.reviewsCount),
          website: apifyBusiness.website,
          qualificationIndicators: qualification.indicators,
          qualificationScore: qualification.score,
          isQualified: qualification.isQualified,
        };
      })
      .filter((business): business is Business => business !== null); // Remove null businesses

    console.log(`Transformed ${businesses.length} businesses`);

    return {
      businesses,
      totalResults: businesses.length,
      searchCriteria: criteria,
      dataSource: 'live',
      message: message || `Found ${businesses.length} ${criteria.industryCategory ? criteria.industryCategory.toLowerCase().replace('_', ' ') : ''} businesses using live data`,
    };

  } catch (error) {
    console.error('Error in Apify search:', error);
    
    // Fallback to mock data in case of error
    const mockBusinesses = getMockBusinesses(criteria);
    
    return {
      businesses: mockBusinesses,
      totalResults: mockBusinesses.length,
      searchCriteria: criteria,
      dataSource: 'mock',
      message: `Live data failed - using sample data (Error: ${error instanceof Error ? error.message : 'Unknown error'})`,
    };
  }
}

// Fallback mock data in case Apify fails
function getMockBusinesses(criteria: SearchCriteria): Business[] {
  const mockBusinesses = [
    // Healthcare
    {
      id: 'fallback-1',
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
      id: 'fallback-2',
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
    // Restaurant & Food Service
    {
      id: 'fallback-3',
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
    // Beauty & Wellness
    {
      id: 'fallback-4',
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
    // Automotive Services
    {
      id: 'fallback-5',
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
    // Fitness & Recreation
    {
      id: 'fallback-6',
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
    }
  ];

  // Filter by industry category if specified
  if (criteria.industryCategory && criteria.industryCategory !== 'all') {
    const filteredByCategory = mockBusinesses.filter(business => 
      business.industryCategory === criteria.industryCategory
    );
    
    // Further filter by specific industry types if provided
    if (criteria.industryTypes && criteria.industryTypes.length > 0) {
      return filteredByCategory.filter(business => {
        const businessInfo = displayNameToType[business.businessType];
        return businessInfo && criteria.industryTypes.includes(businessInfo.type);
      });
    }
    
    return filteredByCategory;
  }

  // Filter by industry types if specified but no category
  if (criteria.industryTypes && criteria.industryTypes.length > 0) {
    return mockBusinesses.filter(business => {
      const businessInfo = displayNameToType[business.businessType];
      return businessInfo && criteria.industryTypes.includes(businessInfo.type);
    });
  }

  return mockBusinesses;
}

export default {
  searchBusinesses,
};
