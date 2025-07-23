
import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses, SearchCriteria } from '@/lib/apify-service';
import { getCurrentUserEmail } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🌐 API ROUTE: Starting business search request');
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || '';
    const industryCategory = searchParams.get('industryCategory') || '';
    const industryTypesParam = searchParams.get('industryTypes') || '';
    const radius = parseInt(searchParams.get('radius') || '25');

    console.log('📝 API ROUTE: Search parameters:', { location, industryCategory, industryTypesParam, radius });

    // Validate required parameters
    if (!location?.trim()) {
      console.log('❌ API ROUTE: Location validation failed');
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Parse industry types from comma-separated string
    let industryTypes: string[] = [];
    if (industryTypesParam) {
      industryTypes = industryTypesParam.split(',').map(type => type.trim()).filter(Boolean);
    }

    // Prepare search criteria
    const searchCriteria: SearchCriteria = {
      location: location.trim(),
      industryTypes,
      industryCategory: industryCategory !== 'all' ? industryCategory : undefined,
      radius,
    };

    console.log('🔍 API ROUTE: Starting multi-industry business search with criteria:', searchCriteria);
    
    // Get current user email dynamically
    const userEmail = await getCurrentUserEmail();
    console.log('👤 API ROUTE: Using user email:', userEmail);

    console.log('⚡ API ROUTE: Calling searchBusinesses function...');
    // Use Apify to search for real businesses with user-specific API key
    const searchResults = await searchBusinesses(searchCriteria, userEmail);
    console.log('✅ API ROUTE: searchBusinesses completed, dataSource:', searchResults.dataSource);

    console.log(`API: Found ${searchResults.businesses.length} businesses using ${searchResults.dataSource} data`);

    return NextResponse.json({
      success: true,
      data: {
        businesses: searchResults.businesses,
        searchCriteria: searchResults.searchCriteria,
        totalResults: searchResults.totalResults,
        dataSource: searchResults.dataSource, // 'live' or 'mock'
        message: searchResults.message,
        source: searchResults.dataSource === 'live' ? 'apify' : 'mock', // Legacy field for compatibility
      },
    });

  } catch (error) {
    console.error('Error searching businesses:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to search businesses',
        details: errorMessage,
        fallback: true 
      },
      { status: 500 }
    );
  }
}
