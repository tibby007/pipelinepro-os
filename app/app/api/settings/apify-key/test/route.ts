
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Default user email for single-user system
const DEFAULT_USER_EMAIL = 'john@doe.com';

// Encryption key for API keys (in production, use proper key management)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-replace-in-production-32chars';

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function POST(request: NextRequest) {
  try {
    // Update status to testing
    await prisma.user.update({
      where: { email: DEFAULT_USER_EMAIL },
      data: {
        apifyKeyStatus: 'TESTING',
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: DEFAULT_USER_EMAIL },
      select: { apifyApiKey: true },
    });

    if (!user?.apifyApiKey) {
      await prisma.user.update({
        where: { email: DEFAULT_USER_EMAIL },
        data: {
          apifyKeyStatus: 'NOT_CONFIGURED',
        },
      });
      return NextResponse.json({ error: 'No API key configured' }, { status: 400 });
    }

    // Decrypt and test the API key
    const apiKey = decrypt(user.apifyApiKey);
    const testResult = await testApifyKey(apiKey);
    
    // Update the status based on test result
    await prisma.user.update({
      where: { email: DEFAULT_USER_EMAIL },
      data: {
        apifyKeyStatus: testResult.isValid ? 'VALID' : 'INVALID',
        apifyKeyLastTested: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      isValid: testResult.isValid,
      message: testResult.message,
      status: testResult.isValid ? 'VALID' : 'INVALID',
    });

  } catch (error) {
    console.error('Error testing API key:', error);
    
    // Reset status on error
    try {
      await prisma.user.update({
        where: { email: DEFAULT_USER_EMAIL },
        data: {
          apifyKeyStatus: 'INVALID',
          apifyKeyLastTested: new Date(),
        },
      });
    } catch (updateError) {
      console.error('Error updating status after test failure:', updateError);
    }
    
    return NextResponse.json({ 
      error: 'Failed to test API key',
      success: false,
      isValid: false,
      message: 'Connection test failed'
    }, { status: 500 });
  }
}

async function testApifyKey(apiKey: string): Promise<{ isValid: boolean; message: string }> {
  try {
    const client = new ApifyClient({ token: apiKey });
    
    // Test with a simple API call to get user info
    const userInfo = await client.user().get();
    
    if (userInfo?.id) {
      return {
        isValid: true,
        message: `✓ Connected to Apify account: ${userInfo.username || userInfo.email || 'Account verified'}`,
      };
    } else {
      return {
        isValid: false,
        message: '✗ API key test failed - no user information returned',
      };
    }
  } catch (error: any) {
    console.error('API key test error:', error);
    
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      return {
        isValid: false,
        message: '✗ Invalid API key - authentication failed',
      };
    }
    
    if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      return {
        isValid: false,
        message: '✗ API key has insufficient permissions',
      };
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      return {
        isValid: false,
        message: '✗ Network error - please check your connection',
      };
    }
    
    return {
      isValid: false,
      message: `✗ Test failed: ${error?.message || 'Unknown error'}`,
    };
  }
}
