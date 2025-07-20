
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileCompletionCheckerProps {
  children: React.ReactNode;
  showSetupPrompt?: boolean;
}

interface ProfileData {
  profileSetupComplete: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function ProfileCompletionChecker({ 
  children, 
  showSetupPrompt = true 
}: ProfileCompletionCheckerProps) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProfileData(result.data);
          
          // Show setup prompt if profile is not complete and we're allowed to show it
          if (!result.data.profileSetupComplete && showSetupPrompt) {
            setShowPrompt(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    router.push('/profile-setup');
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show setup prompt if profile is incomplete
  if (showPrompt && !profileData?.profileSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Profile Setup Required</CardTitle>
            <CardDescription>
              Complete your profile to personalize your PipelinePro OS experience and get the most out of the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="font-medium mb-1">What you'll set up:</div>
              <ul className="space-y-1">
                <li>• Personal information (name, contact details)</li>
                <li>• Business information (company, job title)</li>
                <li>• Address and contact preferences</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={handleCompleteProfile} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Complete Profile Setup
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismissPrompt}
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children normally
  return <>{children}</>;
}
