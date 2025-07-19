
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

export interface ApifyHealthcareBusiness {
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
  businessType: string;
  radius: number;
}

export interface HealthcareBusiness {
  id: string;
  name: string;
  address: string;
  phone?: string;
  businessType: string;
  estimatedRevenue: string;
  yearsInBusiness: string;
  employeeCount: string;
  website?: string;
  qualificationIndicators: {
    revenueQualified: boolean;
    experienceQualified: boolean;
    locationQualified: boolean;
    businessTypeQualified: boolean;
  };
  qualificationScore: number;
  isQualified: boolean;
}

// Map search business types to Google Maps search terms
const businessTypeMapping: Record<string, string[]> = {
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
  'all': ['healthcare', 'medical', 'dental', 'veterinary', 'clinic', 'hospital']
};

// Map display names back to our enum values
const displayNameToType: Record<string, string> = {
  'Medical Office': 'MEDICAL_OFFICE',
  'Dental Practice': 'DENTAL_PRACTICE',
  'Veterinary Clinic': 'VETERINARY_CLINIC',
  'Physical Therapy': 'PHYSICAL_THERAPY',
  'Mental Health': 'MENTAL_HEALTH',
  'Urgent Care': 'URGENT_CARE',
  'Medical Imaging': 'MEDICAL_IMAGING',
  'Laboratory': 'LABORATORY',
  'Pharmacy': 'PHARMACY',
  'Specialty Clinic': 'SPECIALTY_CLINIC',
};

function categorizeBusinessType(categories: string[] = [], title: string = ''): string {
  const searchText = `${categories.join(' ')} ${title}`.toLowerCase();
  
  if (searchText.includes('dental') || searchText.includes('dentist') || searchText.includes('orthodont')) {
    return 'Dental Practice';
  }
  if (searchText.includes('veterinary') || searchText.includes('animal') || searchText.includes('vet ')) {
    return 'Veterinary Clinic';
  }
  if (searchText.includes('physical therapy') || searchText.includes('physiotherapy') || searchText.includes('rehabilitation')) {
    return 'Physical Therapy';
  }
  if (searchText.includes('mental health') || searchText.includes('psychiatr') || searchText.includes('psychol') || searchText.includes('counseling')) {
    return 'Mental Health';
  }
  if (searchText.includes('urgent care') || searchText.includes('walk-in')) {
    return 'Urgent Care';
  }
  if (searchText.includes('imaging') || searchText.includes('radiology') || searchText.includes('mri') || searchText.includes('x-ray')) {
    return 'Medical Imaging';
  }
  if (searchText.includes('laboratory') || searchText.includes('lab ') || searchText.includes('diagnostic')) {
    return 'Laboratory';
  }
  if (searchText.includes('pharmacy') || searchText.includes('drugstore')) {
    return 'Pharmacy';
  }
  if (searchText.includes('specialist') || searchText.includes('specialty')) {
    return 'Specialty Clinic';
  }
  
  return 'Medical Office'; // Default fallback
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

function calculateQualificationScore(business: ApifyHealthcareBusiness, businessType: string): {
  indicators: {
    revenueQualified: boolean;
    experienceQualified: boolean;
    locationQualified: boolean;
    businessTypeQualified: boolean;
  };
  score: number;
  isQualified: boolean;
} {
  const indicators = {
    revenueQualified: (business.reviewsCount || 0) > 10, // Proxy for revenue
    experienceQualified: (business.reviewsCount || 0) > 5, // Proxy for 6+ months
    locationQualified: business.address ? business.address.includes('USA') || 
                       business.address.includes('US') || 
                       /,\s*[A-Z]{2}\s+\d{5}/.test(business.address) : true, // US format check
    businessTypeQualified: true, // We're only searching healthcare businesses
  };
  
  const score = Object.values(indicators).filter(Boolean).length * 25;
  const isQualified = score >= 75;
  
  return { indicators, score, isQualified };
}

function buildSearchQuery(criteria: SearchCriteria): string {
  const { location, businessType } = criteria;
  
  const searchTerms = businessTypeMapping[businessType] || businessTypeMapping['all'];
  const primaryTerm = searchTerms[0];
  
  return `${primaryTerm} near ${location}`;
}

export async function searchHealthcareBusinesses(
  criteria: SearchCriteria, 
  userEmail?: string
): Promise<{
  businesses: HealthcareBusiness[];
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

    // Transform Apify results to our format
    const businesses: HealthcareBusiness[] = items
      .filter((item: any) => item && item.title && item.address)
      .map((item: any, index: number): HealthcareBusiness => {
        const apifyBusiness: ApifyHealthcareBusiness = {
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

        const businessType = categorizeBusinessType(
          item.categories || [item.categoryName], 
          item.title
        );
        
        const qualification = calculateQualificationScore(apifyBusiness, businessType);
        
        return {
          id: `apify-${item.placeId || index}-${Date.now()}`,
          name: apifyBusiness.title,
          address: apifyBusiness.address,
          phone: apifyBusiness.phone,
          businessType,
          estimatedRevenue: estimateRevenue(apifyBusiness.reviewsCount, apifyBusiness.rating),
          yearsInBusiness: estimateYearsInBusiness(apifyBusiness.reviewsCount),
          employeeCount: estimateEmployees(apifyBusiness.reviewsCount),
          website: apifyBusiness.website,
          qualificationIndicators: qualification.indicators,
          qualificationScore: qualification.score,
          isQualified: qualification.isQualified,
        };
      });

    console.log(`Transformed ${businesses.length} businesses`);

    return {
      businesses,
      totalResults: businesses.length,
      searchCriteria: criteria,
      dataSource: 'live',
      message: message || `Found ${businesses.length} healthcare businesses using live data`,
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
function getMockBusinesses(criteria: SearchCriteria): HealthcareBusiness[] {
  const mockBusinesses = [
    {
      id: 'fallback-1',
      name: 'Family Health Clinic',
      address: `456 Healthcare Ave, ${criteria.location}`,
      phone: '(555) 555-0123',
      businessType: 'Medical Office',
      estimatedRevenue: '$25K-50K monthly',
      yearsInBusiness: '3 years',
      employeeCount: '8-12 employees',
      website: 'https://familyhealthclinic.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        businessTypeQualified: true,
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
      estimatedRevenue: '$30K-60K monthly',
      yearsInBusiness: '5 years',
      employeeCount: '10-15 employees',
      website: 'https://sunshinedentalgroup.com',
      qualificationIndicators: {
        revenueQualified: true,
        experienceQualified: true,
        locationQualified: true,
        businessTypeQualified: true,
      },
      qualificationScore: 92,
      isQualified: true,
    }
  ];

  // Filter by business type if specified
  if (criteria.businessType !== 'all') {
    return mockBusinesses.filter(business => 
      displayNameToType[business.businessType] === criteria.businessType
    );
  }

  return mockBusinesses;
}

export default {
  searchHealthcareBusinesses,
};
