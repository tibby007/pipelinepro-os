
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

    // Mock document data since we don't have a documents table in the schema
    const mockDocuments = [
      {
        id: '1',
        name: 'Financial Statement Q4 2024.pdf',
        type: 'financial_statement',
        size: 2457600,
        prospectId: '1',
        prospectName: 'Dr. Sarah Johnson',
        businessName: 'Downtown Dental Practice',
        status: 'approved',
        uploadedBy: 'mike.rodriguez@ccc.com',
        uploadedAt: '2025-01-15T10:30:00Z',
        url: '/documents/financial-statement-q4-2024.pdf',
        description: 'Quarterly financial statement showing practice revenue and expenses'
      },
      {
        id: '2',
        name: 'Bank Statement December 2024.pdf',
        type: 'bank_statement',
        size: 1834567,
        prospectId: '1',
        prospectName: 'Dr. Sarah Johnson',
        businessName: 'Downtown Dental Practice',
        status: 'pending',
        uploadedBy: 'lisa.chen@ccc.com',
        uploadedAt: '2025-01-18T14:20:00Z',
        url: '/documents/bank-statement-dec-2024.pdf',
        description: 'December 2024 business bank statement'
      },
      {
        id: '3',
        name: 'Equipment Invoice - X-Ray Machine.pdf',
        type: 'equipment_invoice',
        size: 892345,
        prospectId: '2',
        prospectName: 'Dr. Michael Chen',
        businessName: 'Westside Medical Group',
        status: 'under_review',
        uploadedBy: 'david.smith@ccc.com',
        uploadedAt: '2025-01-17T09:15:00Z',
        url: '/documents/equipment-invoice-xray.pdf',
        description: 'Invoice for new digital X-ray equipment purchase'
      },
      {
        id: '4',
        name: 'Business License 2024.pdf',
        type: 'business_license',
        size: 567890,
        prospectId: '3',
        prospectName: 'Dr. Emily Rodriguez',
        businessName: 'Riverside Veterinary Clinic',
        status: 'approved',
        uploadedBy: 'sarah.johnson@ccc.com',
        uploadedAt: '2025-01-16T11:45:00Z',
        url: '/documents/business-license-2024.pdf',
        description: 'Current business license and permits'
      },
      {
        id: '5',
        name: 'Tax Return 2023.pdf',
        type: 'tax_return',
        size: 3456789,
        prospectId: '2',
        prospectName: 'Dr. Michael Chen',
        businessName: 'Westside Medical Group',
        status: 'rejected',
        uploadedBy: 'mike.rodriguez@ccc.com',
        uploadedAt: '2025-01-14T16:30:00Z',
        url: '/documents/tax-return-2023.pdf',
        description: '2023 business tax return - incomplete information'
      }
    ];

    return NextResponse.json({ documents: mockDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
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
    
    // Mock document creation
    const document = {
      id: Date.now().toString(),
      ...body,
      uploadedBy: session.user?.email || 'system',
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    };

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
