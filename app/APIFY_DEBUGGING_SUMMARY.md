# Apify Integration Debugging Summary

## Current Status
The Apify search feature is not returning live data despite multiple fixes. The system falls back to sample data instead of showing real Google Maps results.

## What We Fixed
1. **Actor ID Format**: Changed from `compass/crawler-google-places` to `compass~crawler-google-places` (tilde format)
2. **Removed Invalid Property**: Removed `waitForFinish` from actor.call() options (was causing runtime errors)
3. **Optimized Timeouts**: Adjusted to 25s actor, 30s API route, 35s frontend
4. **Reduced Search Complexity**: Limited to 1 result per search

## Confirmed Working
- ✅ Apify API token is valid (stored in .env file)
- ✅ Actor exists and is accessible when tested directly
- ✅ Test script successfully retrieved data in ~20 seconds
- ✅ No more 504 timeout errors

## Potential Issues to Investigate

### 1. API Token Usage
- The system uses both global token (in .env) and user-specific tokens
- Check if the token is being passed correctly to the ApifyClient
- Current implementation in `/lib/apify-service.ts` lines 45-47 and 981-989

### 2. Actor Response Parsing
- The actor returns data in `run.defaultDatasetId` which needs separate fetching
- Check if dataset fetching is working correctly (lines 690-725)
- May need to wait for actor to fully complete before fetching dataset

### 3. Netlify Environment
- Local testing showed actor works, but Netlify deployment may have different behavior
- Check if Netlify environment variables are set correctly
- Verify network permissions for external API calls

### 4. Error Handling
- Errors might be silently caught and triggering mock data fallback
- Check console logs in Netlify Functions for actual error messages
- Lines 1108-1121 handle errors but might mask the real issue

### 5. Actor Input Format
The current input format might not match what the actor expects:
```javascript
{
  searchStringsArray: [`restaurants in ${location}`],
  maxCrawledPlacesPerSearch: 1,
  language: 'en',
  country: 'us',
}
```

## Test Script That Worked
A direct test of the Apify actor succeeded with this approach:
- Used fetch with proper Bearer token authentication
- Polled for actor completion status
- Retrieved results from the dataset after completion

## Recommended Next Steps
1. Add extensive logging to track exact failure point
2. Test with Apify's official Node.js client example code
3. Verify the actor input format matches Apify's documentation
4. Check if the issue is specific to Netlify's serverless environment
5. Consider using Apify webhooks for async processing instead of waiting

## Files to Review
- `/lib/apify-service.ts` - Main Apify integration (lines 520-830)
- `/app/api/prospects/search/route.ts` - API endpoint
- `/app/dashboard/research/page.tsx` - Frontend search page
- `.env` - Environment variables (ensure APIFY_API_TOKEN is set in Netlify)

## Original Working Actors from DeepAgent
- Google Maps: `compass/crawler-google-places` (now `compass~crawler-google-places`)
- Apollo.io: `code_crafter/apollo-io-scraper`

The integration was working in the original DeepAgent implementation, so comparing the implementations might reveal the issue.