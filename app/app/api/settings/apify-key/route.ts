
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Default user email for single-user system
const DEFAULT_USER_EMAIL = 'john@doe.com';

// Encryption key for API keys (in production, use proper key management)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-replace-in-production-32chars';

function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEFAULT_USER_EMAIL },
      select: {
        apifyKeyStatus: true,
        apifyKeyLastTested: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: user.apifyKeyStatus,
      lastTested: user.apifyKeyLastTested,
      hasKey: user.apifyKeyStatus !== 'NOT_CONFIGURED',
    });

  } catch (error) {
    console.error('Error fetching API key status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Validate API key format (Apify API keys typically start with 'apify_api_')
    if (!apiKey.startsWith('apify_api_')) {
      return NextResponse.json({ 
        error: 'Invalid API key format. Apify API keys should start with "apify_api_"' 
      }, { status: 400 });
    }

    // Test the API key
    const testResult = await testApifyKey(apiKey);
    
    // Encrypt and store the API key
    const encryptedKey = encrypt(apiKey);
    
    await prisma.user.update({
      where: { email: DEFAULT_USER_EMAIL },
      data: {
        apifyApiKey: encryptedKey,
        apifyKeyStatus: testResult.isValid ? 'VALID' : 'INVALID',
        apifyKeyLastTested: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      status: testResult.isValid ? 'VALID' : 'INVALID',
      message: testResult.message,
    });

  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await prisma.user.update({
      where: { email: DEFAULT_USER_EMAIL },
      data: {
        apifyApiKey: null,
        apifyKeyStatus: 'NOT_CONFIGURED',
        apifyKeyLastTested: null,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error removing API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function testApifyKey(apiKey: string): Promise<{ isValid: boolean; message: string }> {
  try {
    const client = new ApifyClient({ token: apiKey });
    
    // Test the key by trying to get user info
    const userInfo = await client.user().get();
    
    if (userInfo?.id) {
      return {
        isValid: true,
        message: `API key is valid. Connected to account: ${userInfo.username || userInfo.email || 'Unknown'}`,
      };
    } else {
      return {
        isValid: false,
        message: 'API key test failed - no user information returned',
      };
    }
  } catch (error: any) {
    console.error('API key test error:', error);
    
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      return {
        isValid: false,
        message: 'Invalid API key - authentication failed',
      };
    }
    
    return {
      isValid: false,
      message: `API key test failed: ${error?.message || 'Unknown error'}`,
    };
  }
}
