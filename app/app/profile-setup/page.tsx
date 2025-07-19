
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSetupForm from '@/components/profile/profile-setup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, CheckCircle } from 'lucide-react';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const result = await response.json();
        setProfileComplete(result.data?.profileSetupComplete || false);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
    // Redirect to dashboard after successful setup
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileComplete === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Profile Setup Complete!</CardTitle>
            <CardDescription>
              Your profile has been successfully configured. Redirecting to the dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to CCC Healthcare Pipeline
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Let's set up your profile to personalize your experience and make the most of your healthcare lending operations.
            </p>
          </div>
        </div>

        {/* Profile Setup Form */}
        <ProfileSetupForm
          onSuccess={handleProfileComplete}
          isInitialSetup={true}
        />
      </div>
    </div>
  );
}
