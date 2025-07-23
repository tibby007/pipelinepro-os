
import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses, SearchCriteria } from '@/lib/apify-service';
import { getCurrentUserEmail } from '@/lib/user-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds max duration for Netlify functions

export async function GET(req: NextRequest) {
  // Declare variables outside try block so they're accessible in catch
  let location = '';
  let industryCategory = '';
  let industryTypesParam = '';
  let radius = 25;
  
  try {
    console.log('🌐 API ROUTE: Starting business search request');
    const { searchParams } = new URL(req.url);
    location = searchParams.get('location') || '';
    industryCategory = searchParams.get('industryCategory') || '';
    industryTypesParam = searchParams.get('industryTypes') || '';
    radius = parseInt(searchParams.get('radius') || '25');

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
    console.error('❌ API ROUTE ERROR:', error);
    
    // Return a more specific error message with proper JSON structure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // For timeout errors, return mock data instead of failing
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      console.log('⏰ API TIMEOUT: Returning mock data as fallback');
      
      return NextResponse.json({
        success: true,
        data: {
          businesses: [],
          searchCriteria: {
            location: location || 'Unknown',
            industryCategory: industryCategory || 'Unknown',
            industryTypes: [],
            radius: radius || 25
          },
          totalResults: 0,
          dataSource: 'mock',
          message: 'Search timed out - please try with a smaller search area or different location',
          source: 'mock'
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search businesses',
        details: errorMessage,
        data: {
          businesses: [],
          totalResults: 0,
          dataSource: 'mock',
          message: errorMessage
        }
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
