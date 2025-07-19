
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Mock healthcare business search results
const mockHealthcareBusinesses = [
  {
    id: 'mock-1',
    name: 'Family Health Clinic',
    address: '456 Healthcare Ave, Atlanta, GA 30309',
    phone: '(404) 555-0123',
    businessType: 'Medical Office',
    estimatedRevenue: '$25K-50K monthly',
    yearsInBusiness: '3 years',
    employeeCount: '8-12 employees',
    website: 'https://familyhealthatlanta.com',
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
    id: 'mock-2',
    name: 'Sunshine Dental Group',
    address: '789 Smile Street, Atlanta, GA 30308',
    phone: '(404) 555-0456',
    businessType: 'Dental Practice',
    estimatedRevenue: '$30K-60K monthly',
    yearsInBusiness: '5 years',
    employeeCount: '10-15 employees',
    website: 'https://sunshinedentalga.com',
    qualificationIndicators: {
      revenueQualified: true,
      experienceQualified: true,
      locationQualified: true,
      businessTypeQualified: true,
    },
    qualificationScore: 92,
    isQualified: true,
  },
  {
    id: 'mock-3',
    name: 'Metro Animal Hospital',
    address: '321 Pet Care Dr, Atlanta, GA 30307',
    phone: '(404) 555-0789',
    businessType: 'Veterinary Clinic',
    estimatedRevenue: '$20K-35K monthly',
    yearsInBusiness: '2 years',
    employeeCount: '6-10 employees',
    website: 'https://metroanimalhospital.com',
    qualificationIndicators: {
      revenueQualified: true,
      experienceQualified: true,
      locationQualified: true,
      businessTypeQualified: true,
    },
    qualificationScore: 78,
    isQualified: true,
  },
  {
    id: 'mock-4',
    name: 'Wellness Physical Therapy',
    address: '654 Recovery Rd, Atlanta, GA 30306',
    phone: '(404) 555-0321',
    businessType: 'Physical Therapy',
    estimatedRevenue: '$15K-25K monthly',
    yearsInBusiness: '1 year',
    employeeCount: '4-8 employees',
    website: 'https://wellnesspt.com',
    qualificationIndicators: {
      revenueQualified: false,
      experienceQualified: true,
      locationQualified: true,
      businessTypeQualified: true,
    },
    qualificationScore: 62,
    isQualified: false,
  },
  {
    id: 'mock-5',
    name: 'City Urgent Care',
    address: '987 Emergency Blvd, Atlanta, GA 30305',
    phone: '(404) 555-0654',
    businessType: 'Urgent Care',
    estimatedRevenue: '$40K-80K monthly',
    yearsInBusiness: '4 years',
    employeeCount: '15-25 employees',
    website: 'https://cityurgentcare.com',
    qualificationIndicators: {
      revenueQualified: true,
      experienceQualified: true,
      locationQualified: true,
      businessTypeQualified: true,
    },
    qualificationScore: 95,
    isQualified: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || '';
    const businessType = searchParams.get('businessType') || '';
    const radius = searchParams.get('radius') || '25';

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filter results based on search criteria
    let results = mockHealthcareBusinesses;

    if (businessType && businessType !== 'all') {
      results = results.filter(business => 
        business.businessType.toLowerCase().includes(businessType.toLowerCase())
      );
    }

    if (location) {
      // In a real implementation, this would use Google Maps API or similar
      results = results.filter(business => 
        business.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Add some randomization to make it feel more realistic
    results = results.map(business => ({
      ...business,
      id: `${business.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    return NextResponse.json({
      success: true,
      data: {
        businesses: results,
        searchCriteria: {
          location,
          businessType,
          radius: parseInt(radius),
        },
        totalResults: results.length,
      },
    });
  } catch (error) {
    console.error('Error searching healthcare businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
