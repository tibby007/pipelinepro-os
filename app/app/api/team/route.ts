
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Fetch all users with their activities
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform user data to team member format
    const teamMembers = users.map((user: any) => ({
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      department: getDepartmentByRole(user.role),
      status: 'active', // Default to active since we don't have status field
      joinedAt: user.createdAt.toISOString(),
      lastActive: user.updatedAt.toISOString(),
      avatar: '',
      phone: '+1 (555) 000-0000', // Mock phone number
      performance: {
        prospectsGenerated: user.role === 'ADMIN' ? 34 : Math.floor(Math.random() * 30),
        conversions: user.role === 'ADMIN' ? 22 : Math.floor(Math.random() * 20),
        revenue: user.role === 'ADMIN' ? 3080000 : Math.floor(Math.random() * 2000000),
        conversionRate: user.role === 'ADMIN' ? 64.7 : Math.floor(Math.random() * 80)
      }
    }));

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

function getDepartmentByRole(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Leadership';
    case 'LOAN_OFFICER':
      return 'Lending';
    case 'BUSINESS_DEVELOPMENT':
      return 'Sales';
    case 'UNDERWRITER':
      return 'Risk Management';
    case 'ANALYST':
      return 'Analytics';
    default:
      return 'General';
  }
}

export async function POST(request: NextRequest) {
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
    
    // Mock team member creation
    const teamMember = {
      id: Date.now().toString(),
      ...body,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active'
    };

    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
