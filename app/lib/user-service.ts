
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// For now, we'll use the default user email but this can be made dynamic later
// This will always return the current single user's email
export async function getCurrentUserEmail(): Promise<string> {
  try {
    // Get the first user in the system (since this is a single-user app)
    const user = await prisma.user.findFirst({
      select: { email: true },
      orderBy: { createdAt: 'asc' }, // Get the first created user
    });
    
    return user?.email || 'john@doe.com'; // Fallback to default
  } catch (error) {
    console.error('Error fetching current user email:', error);
    return 'john@doe.com'; // Fallback to default
  }
}

export async function getCurrentUser() {
  try {
    const user = await prisma.user.findFirst({
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
        apifyKeyStatus: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' }, // Get the first created user
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function isProfileSetupComplete(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profileSetupComplete || false;
}

// Update user email safely (for single-user system)
export async function updateUserEmail(oldEmail: string, newEmail: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { email: oldEmail },
      data: { email: newEmail },
    });
    return true;
  } catch (error) {
    console.error('Error updating user email:', error);
    return false;
  }
}
