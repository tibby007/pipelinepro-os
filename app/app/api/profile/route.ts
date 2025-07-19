
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getCurrentUserEmail } from '@/lib/user-service';

const prisma = new PrismaClient();

// Profile validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const userEmail = await getCurrentUserEmail();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        company: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        website: true,
        profileSetupComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the profile data
    const validationResult = profileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email,
      jobTitle,
      company,
      phone,
      address,
      city,
      state,
      zipCode,
      website,
    } = validationResult.data;

    // Create the full name from first and last name
    const fullName = `${firstName} ${lastName}`.trim();

    // Check if email is changing and if it already exists (for another user)
    const userEmail = await getCurrentUserEmail();
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If email is changing, check if it's already taken
    if (email !== userEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json({
          error: 'Email already exists',
        }, { status: 400 });
      }
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        name: fullName,
        email,
        firstName,
        lastName,
        jobTitle,
        company,
        phone,
        address,
        city,
        state,
        zipCode,
        website: website || null,
        profileSetupComplete: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        company: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        website: true,
        profileSetupComplete: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
