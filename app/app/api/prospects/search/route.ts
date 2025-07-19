
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchHealthcareBusinesses, SearchCriteria } from '@/lib/apify-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || '';
    const businessType = searchParams.get('businessType') || 'all';
    const radius = parseInt(searchParams.get('radius') || '25');

    // Validate required parameters
    if (!location?.trim()) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Prepare search criteria
    const searchCriteria: SearchCriteria = {
      location: location.trim(),
      businessType,
      radius,
    };

    console.log('API: Starting healthcare business search with criteria:', searchCriteria);

    // Use Apify to search for real healthcare businesses
    const searchResults = await searchHealthcareBusinesses(searchCriteria);

    console.log(`API: Found ${searchResults.businesses.length} businesses`);

    return NextResponse.json({
      success: true,
      data: {
        businesses: searchResults.businesses,
        searchCriteria: searchResults.searchCriteria,
        totalResults: searchResults.totalResults,
        source: 'apify', // Indicate this is real data from Apify
      },
    });

  } catch (error) {
    console.error('Error searching healthcare businesses:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to search healthcare businesses',
        details: errorMessage,
        fallback: true 
      },
      { status: 500 }
    );
  }
}
