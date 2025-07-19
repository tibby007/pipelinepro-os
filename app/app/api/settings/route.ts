
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }

    // Mock settings data since we don't have a settings table
    const settings = {
      general: {
        companyName: 'Commercial Capital Connect',
        companyEmail: 'contact@commercialcapitalconnect.com',
        companyPhone: '+1 (555) 123-4567',
        companyAddress: '123 Business Blvd, Suite 100, Atlanta, GA 30309',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY'
      },
      lending: {
        minMonthlyRevenue: 17000,
        minBusinessAge: 6,
        minCreditScore: 600,
        maxLoanAmount: 5000000,
        defaultLoanTerm: 60,
        interestRate: 8.5
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        prospectAlerts: true,
        submissionAlerts: true,
        weeklyReports: true,
        monthlyReports: true
      },
      security: {
        sessionTimeout: 30,
        requireTwoFactor: false,
        passwordExpiry: 90,
        allowGuestAccess: false
      }
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }

    const body = await request.json();
    const { section, data } = body;

    // In a real implementation, you would save settings to the database
    console.log(`Updating ${section} settings:`, data);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
