
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock submission data since we don't have a submissions table in the schema
    const mockSubmissions = [
      {
        id: '1',
        prospectId: '1',
        prospectName: 'Dr. Sarah Johnson',
        businessName: 'Downtown Dental Practice',
        lendingPartner: 'partner_a',
        requestedAmount: 250000,
        status: 'approved',
        submittedAt: '2025-01-10T08:30:00Z',
        submittedBy: 'mike.rodriguez@ccc.com',
        lastUpdate: '2025-01-18T14:20:00Z',
        expectedDecision: '2025-01-25T00:00:00Z',
        notes: 'Strong financials, excellent credit history',
        documents: 8,
        qualificationScore: 85
      },
      {
        id: '2',
        prospectId: '2',
        prospectName: 'Dr. Michael Chen',
        businessName: 'Westside Medical Group',
        lendingPartner: 'partner_b',
        requestedAmount: 180000,
        status: 'under_review',
        submittedAt: '2025-01-15T11:15:00Z',
        submittedBy: 'lisa.chen@ccc.com',
        lastUpdate: '2025-01-17T10:45:00Z',
        expectedDecision: '2025-01-30T00:00:00Z',
        notes: 'Pending additional financial documentation',
        documents: 6,
        qualificationScore: 78
      },
      {
        id: '3',
        prospectId: '3',
        prospectName: 'Dr. Emily Rodriguez',
        businessName: 'Riverside Veterinary Clinic',
        lendingPartner: 'partner_e',
        requestedAmount: 320000,
        status: 'submitted',
        submittedAt: '2025-01-18T13:00:00Z',
        submittedBy: 'david.smith@ccc.com',
        lastUpdate: '2025-01-18T13:00:00Z',
        expectedDecision: '2025-02-01T00:00:00Z',
        notes: 'Equipment financing for clinic expansion',
        documents: 9,
        qualificationScore: 82
      },
      {
        id: '4',
        prospectId: '4',
        prospectName: 'Dr. James Wilson',
        businessName: 'Northside Physical Therapy',
        lendingPartner: 'partner_c',
        requestedAmount: 95000,
        status: 'rejected',
        submittedAt: '2025-01-08T09:20:00Z',
        submittedBy: 'sarah.johnson@ccc.com',
        lastUpdate: '2025-01-16T16:30:00Z',
        expectedDecision: '',
        notes: 'Insufficient revenue history, recommend reapplication in 6 months',
        documents: 5,
        qualificationScore: 52
      },
      {
        id: '5',
        prospectId: '5',
        prospectName: 'Dr. Amanda Foster',
        businessName: 'Central Urgent Care',
        lendingPartner: 'partner_d',
        requestedAmount: 420000,
        status: 'pending_info',
        submittedAt: '2025-01-12T15:45:00Z',
        submittedBy: 'mike.rodriguez@ccc.com',
        lastUpdate: '2025-01-19T09:10:00Z',
        expectedDecision: '2025-02-05T00:00:00Z',
        notes: 'Requested updated tax returns and equipment appraisal',
        documents: 7,
        qualificationScore: 74
      }
    ];

    return NextResponse.json({ submissions: mockSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
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
    
    // Mock submission creation
    const submission = {
      id: Date.now().toString(),
      ...body,
      submittedBy: session.user?.email || 'system',
      submittedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      status: 'submitted'
    };

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
