
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const businessType = searchParams.get('businessType') || '';
    const state = searchParams.get('state') || '';
    const minRevenue = searchParams.get('minRevenue');
    const maxRevenue = searchParams.get('maxRevenue');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (businessType && businessType !== 'all') {
      where.businessType = businessType;
    }

    if (state && state !== 'all') {
      where.state = state;
    }

    if (minRevenue || maxRevenue) {
      where.monthlyRevenue = {};
      if (minRevenue) where.monthlyRevenue.gte = parseInt(minRevenue);
      if (maxRevenue) where.monthlyRevenue.lte = parseInt(maxRevenue);
    }

    // Get prospects with relationships
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              outreachActivities: true,
              qualifications: true,
              documents: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.prospect.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        prospects,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      businessType,
      monthlyRevenue,
      yearsInBusiness,
      employeeCount,
      website,
      notes,
      tags,
      source,
    } = body;

    // Validate required fields
    if (!businessName || !businessType) {
      return NextResponse.json(
        { error: 'Business name and type are required' },
        { status: 400 }
      );
    }

    // Calculate qualification score
    let qualificationScore = 0;
    let isQualified = false;

    // Monthly revenue (30 points max)
    if (monthlyRevenue >= 17000) {
      qualificationScore += 30;
    } else if (monthlyRevenue >= 10000) {
      qualificationScore += 20;
    } else if (monthlyRevenue >= 5000) {
      qualificationScore += 10;
    }

    // Years in business (25 points max)
    if (yearsInBusiness >= 2) {
      qualificationScore += 25;
    } else if (yearsInBusiness >= 1) {
      qualificationScore += 15;
    } else if (yearsInBusiness >= 0.5) {
      qualificationScore += 10;
    }

    // Business type (20 points max)
    const highValueTypes = ['MEDICAL_OFFICE', 'DENTAL_PRACTICE', 'SPECIALTY_CLINIC'];
    const mediumValueTypes = ['VETERINARY_CLINIC', 'URGENT_CARE', 'PHYSICAL_THERAPY'];
    
    if (highValueTypes.includes(businessType)) {
      qualificationScore += 20;
    } else if (mediumValueTypes.includes(businessType)) {
      qualificationScore += 15;
    } else {
      qualificationScore += 10;
    }

    // Employee count (15 points max)
    if (employeeCount >= 10) {
      qualificationScore += 15;
    } else if (employeeCount >= 5) {
      qualificationScore += 10;
    } else if (employeeCount >= 2) {
      qualificationScore += 5;
    }

    // Location (US requirement - 10 points max)
    if (state) {
      qualificationScore += 10;
    }

    // Determine if qualified (70+ points)
    isQualified = qualificationScore >= 70;

    const prospect = await prisma.prospect.create({
      data: {
        businessName,
        contactName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        businessType,
        monthlyRevenue: monthlyRevenue ? parseInt(monthlyRevenue) : null,
        yearsInBusiness: yearsInBusiness ? parseFloat(yearsInBusiness) : null,
        employeeCount: employeeCount ? parseInt(employeeCount) : null,
        website,
        qualificationScore,
        isQualified,
        notes,
        tags: tags || [],
        source,
        assignedToId: session.user.id,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        prospectId: prospect.id,
        userId: session.user.id,
        eventType: 'prospect_added',
        eventData: {
          source: source || 'manual_entry',
          qualificationScore,
          isQualified,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: prospect,
      message: 'Prospect created successfully',
    });
  } catch (error) {
    console.error('Error creating prospect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
