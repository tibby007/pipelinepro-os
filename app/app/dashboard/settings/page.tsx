
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Save, Shield, Bell, Database, Mail, Users, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SystemSettings {
  general: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    timezone: string;
    dateFormat: string;
  };
  lending: {
    minMonthlyRevenue: number;
    minBusinessAge: number;
    minCreditScore: number;
    maxLoanAmount: number;
    defaultLoanTerm: number;
    interestRate: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    prospectAlerts: boolean;
    submissionAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    passwordExpiry: number;
    allowGuestAccess: boolean;
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock settings for demonstration
  const mockSettings: SystemSettings = {
    general: {
      companyName: 'Commercial Capital Connect',
      companyEmail: 'contact@commercialcapitalconnect.com',
      companyPhone: '+1 (555) 123-4567',
      companyAddress: '123 Business Blvd, Suite 100, Atlanta, GA 30309',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY'
    },
    lending: {
      minMonthlyRevenue: 17000,
      minBusinessAge: 6,
      minCreditScore: 600,
      maxLoanAmount: 5000000,
      defaultLoanTerm: 60,
      interestRate: 8.5
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      prospectAlerts: true,
      submissionAlerts: true,
      weeklyReports: true,
      monthlyReports: true
    },
    security: {
      sessionTimeout: 30,
      requireTwoFactor: false,
      passwordExpiry: 90,
      allowGuestAccess: false
    }
  };

  const displaySettings = settings || mockSettings;

  const handleSave = async (section: keyof SystemSettings) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          data: displaySettings[section]
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    if (!displaySettings) return;
    
    const updatedSettings = {
      ...displaySettings,
      [section]: {
        ...displaySettings[section],
        [field]: value
      }
    };
    setSettings(updatedSettings);
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC System Settings</h1>
          <p className="text-gray-600">Configure system preferences and operational parameters</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Admin Access Required</span>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="lending">Lending Criteria</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={displaySettings?.general?.companyName || ''}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={displaySettings?.general?.companyEmail || ''}
                    onChange={(e) => updateSetting('general', 'companyEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={displaySettings?.general?.companyPhone || ''}
                    onChange={(e) => updateSetting('general', 'companyPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={displaySettings?.general?.timezone || ''} 
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={displaySettings?.general?.companyAddress || ''}
                  onChange={(e) => updateSetting('general', 'companyAddress', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('general')}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Lending Qualification Criteria</span>
              </CardTitle>
              <CardDescription>Set minimum requirements for prospect qualification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minMonthlyRevenue">Minimum Monthly Revenue ($)</Label>
                  <Input
                    id="minMonthlyRevenue"
                    type="number"
                    value={displaySettings?.lending?.minMonthlyRevenue || 0}
                    onChange={(e) => updateSetting('lending', 'minMonthlyRevenue', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBusinessAge">Minimum Business Age (months)</Label>
                  <Input
                    id="minBusinessAge"
                    type="number"
                    value={displaySettings?.lending?.minBusinessAge || 0}
                    onChange={(e) => updateSetting('lending', 'minBusinessAge', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minCreditScore">Minimum Credit Score</Label>
                  <Input
                    id="minCreditScore"
                    type="number"
                    value={displaySettings?.lending?.minCreditScore || 0}
                    onChange={(e) => updateSetting('lending', 'minCreditScore', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoanAmount">Maximum Loan Amount ($)</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={displaySettings?.lending?.maxLoanAmount || 0}
                    onChange={(e) => updateSetting('lending', 'maxLoanAmount', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLoanTerm">Default Loan Term (months)</Label>
                  <Input
                    id="defaultLoanTerm"
                    type="number"
                    value={displaySettings?.lending?.defaultLoanTerm || 0}
                    onChange={(e) => updateSetting('lending', 'defaultLoanTerm', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={displaySettings?.lending?.interestRate || 0}
                    onChange={(e) => updateSetting('lending', 'interestRate', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Impact Notice</h4>
                    <p className="text-sm text-blue-700">
                      Changes to lending criteria will affect future prospect qualification scoring. 
                      Existing prospects will be re-evaluated based on new criteria.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('lending')}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Lending Criteria'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure notification settings for the team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={displaySettings?.notifications?.emailNotifications || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications" className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={displaySettings?.notifications?.smsNotifications || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prospectAlerts" className="text-base">Prospect Alerts</Label>
                    <p className="text-sm text-gray-600">Notifications for new prospects and updates</p>
                  </div>
                  <Switch
                    id="prospectAlerts"
                    checked={displaySettings?.notifications?.prospectAlerts || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'prospectAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="submissionAlerts" className="text-base">Submission Alerts</Label>
                    <p className="text-sm text-gray-600">Notifications for loan submissions and decisions</p>
                  </div>
                  <Switch
                    id="submissionAlerts"
                    checked={displaySettings?.notifications?.submissionAlerts || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'submissionAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports" className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Automatic weekly performance reports</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={displaySettings?.notifications?.weeklyReports || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthlyReports" className="text-base">Monthly Reports</Label>
                    <p className="text-sm text-gray-600">Automatic monthly analytics reports</p>
                  </div>
                  <Switch
                    id="monthlyReports"
                    checked={displaySettings?.notifications?.monthlyReports || false}
                    onCheckedChange={(checked) => updateSetting('notifications', 'monthlyReports', checked)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('notifications')}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={displaySettings?.security?.sessionTimeout || 0}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={displaySettings?.security?.passwordExpiry || 0}
                    onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireTwoFactor" className="text-base">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Force all users to enable 2FA</p>
                  </div>
                  <Switch
                    id="requireTwoFactor"
                    checked={displaySettings?.security?.requireTwoFactor || false}
                    onCheckedChange={(checked) => updateSetting('security', 'requireTwoFactor', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowGuestAccess" className="text-base">Allow Guest Access</Label>
                    <p className="text-sm text-gray-600">Enable read-only access for guests</p>
                  </div>
                  <Switch
                    id="allowGuestAccess"
                    checked={displaySettings?.security?.allowGuestAccess || false}
                    onCheckedChange={(checked) => updateSetting('security', 'allowGuestAccess', checked)}
                  />
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Security Warning</h4>
                    <p className="text-sm text-red-700">
                      Changes to security settings will affect all users immediately. 
                      Ensure team members are notified of policy changes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('security')}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
