
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Shield,
  Database,
  Settings as SettingsIcon,
  User
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ProfileSetupForm from '@/components/profile/profile-setup-form';

interface ApiKeyStatus {
  status: 'NOT_CONFIGURED' | 'VALID' | 'INVALID' | 'EXPIRED' | 'TESTING';
  lastTested: string | null;
  hasKey: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    status: 'NOT_CONFIGURED',
    lastTested: null,
    hasKey: false,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApiKeyStatus();
  }, []);

  const fetchApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/settings/apify-key');
      if (response.ok) {
        const data = await response.json();
        setApiKeyStatus(data);
      }
    } catch (error) {
      console.error('Error fetching API key status:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your Apify API key',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings/apify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'API key saved and tested successfully',
        });
        setApiKey('');
        fetchApiKeyStatus();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save API key',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestApiKey = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/settings/apify-key/test', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.isValid ? 'Success' : 'Error',
          description: data.message,
          variant: data.isValid ? 'default' : 'destructive',
        });
        fetchApiKeyStatus();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to test API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test API key connection',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/apify-key', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'API key removed successfully',
        });
        setApiKey('');
        fetchApiKeyStatus();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove API key',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid
          </Badge>
        );
      case 'INVALID':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Invalid
          </Badge>
        );
      case 'TESTING':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Testing
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Configured
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your CCC Pipeline system settings and integrations
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Management
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            API Configuration
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileSetupForm onSuccess={() => {
            toast({
              title: 'Success',
              description: 'Profile updated successfully!',
            });
          }} />
        </TabsContent>

        {/* API Configuration Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Apify API Integration</CardTitle>
                  <CardDescription>
                    Configure your personal Apify API key to access live healthcare business data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Current Status</div>
                  <div className="text-sm text-gray-600">
                    {apiKeyStatus.lastTested 
                      ? `Last tested: ${new Date(apiKeyStatus.lastTested).toLocaleString()}`
                      : 'Never tested'
                    }
                  </div>
                </div>
                {getStatusBadge(apiKeyStatus.status)}
              </div>

              {/* Instructions */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">How to get your Apify API key:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>
                        Go to{' '}
                        <a 
                          href="https://console.apify.com/account/integrations" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          Apify Console → Integrations
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </li>
                      <li>Click "Create new token" and give it a name</li>
                      <li>Copy the generated API key (starts with "apify_api_")</li>
                      <li>Paste it below and click "Save & Test"</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              {/* API Key Input */}
              <div className="space-y-3">
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  Apify API Key
                </Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="apify_api_..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button 
                    onClick={handleSaveApiKey} 
                    disabled={!apiKey.trim() || saving}
                    className="shrink-0"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Save & Test
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              {apiKeyStatus.hasKey && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleTestApiKey}
                    disabled={testing || apiKeyStatus.status === 'TESTING'}
                    size="sm"
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemoveApiKey}
                    disabled={loading}
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Remove Key
                  </Button>
                </div>
              )}

              {/* Data Source Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-blue-900 mb-1">Data Source Impact</div>
                    <div className="text-blue-700 space-y-1">
                      <p>
                        <strong>With API key:</strong> Research dashboard will scrape live healthcare businesses from Google Maps
                      </p>
                      <p>
                        <strong>Without API key:</strong> Research dashboard will use sample/mock data for demonstration
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <div className="flex items-center space-x-1 mb-1">
                  <Shield className="h-3 w-3" />
                  <span className="font-medium">Security Notice</span>
                </div>
                Your API key is encrypted and stored securely. It's only used for authenticated requests to Apify's service and is never shared with third parties.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
