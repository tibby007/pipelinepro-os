
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

    const activities = await prisma.outreachActivity.findMany({
      include: {
        prospect: {
          select: {
            businessName: true,
            contactName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to include prospect info
    const transformedActivities = activities?.map(activity => ({
      id: activity?.id,
      type: activity?.type,
      prospectId: activity?.prospectId,
      prospectName: activity?.prospect?.contactName || 'Unknown',
      businessName: activity?.prospect?.businessName || 'Unknown Business',
      subject: activity?.subject,
      content: activity?.content,
      status: activity?.status,
      scheduledAt: activity?.scheduledAt?.toISOString(),
      completedAt: activity?.completedAt?.toISOString(),
      createdBy: activity?.userId,
      createdAt: activity?.createdAt?.toISOString()
    })) || [];

    return NextResponse.json({ activities: transformedActivities });
  } catch (error) {
    console.error('Error fetching outreach activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outreach activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const activity = await prisma.outreachActivity.create({
      data: {
        ...body,
        createdBy: session.user?.email || 'system'
      }
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Error creating outreach activity:', error);
    return NextResponse.json(
      { error: 'Failed to create outreach activity' },
      { status: 500 }
    );
  }
}
