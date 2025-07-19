
'use client';

import { useState, useEffect } from 'react';

import { BarChart3, TrendingUp, DollarSign, Users, Target, Calendar, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  totalProspects: number;
  qualifiedProspects: number;
  conversionRate: number;
  avgQualificationScore: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  approvalRate: number;
  totalRequestedAmount: number;
  avgLoanAmount: number;
  pipelineValue: number;
  monthlyStats: Array<{
    month: string;
    prospects: number;
    qualified: number;
    submissions: number;
    approved: number;
    revenue: number;
  }>;
  topPerformers: Array<{
    name: string;
    prospects: number;
    conversions: number;
    revenue: number;
  }>;
  businessTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnalyticsPage() {

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last_30_days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockAnalytics: AnalyticsData = {
    totalProspects: 247,
    qualifiedProspects: 156,
    conversionRate: 63.2,
    avgQualificationScore: 72.4,
    totalSubmissions: 89,
    approvedSubmissions: 56,
    approvalRate: 62.9,
    totalRequestedAmount: 12450000,
    avgLoanAmount: 139888,
    pipelineValue: 8750000,
    monthlyStats: [
      { month: 'Jan', prospects: 45, qualified: 28, submissions: 15, approved: 9, revenue: 1250000 },
      { month: 'Feb', prospects: 52, qualified: 31, submissions: 18, approved: 12, revenue: 1680000 },
      { month: 'Mar', prospects: 48, qualified: 29, submissions: 16, approved: 11, revenue: 1540000 },
      { month: 'Apr', prospects: 41, qualified: 26, submissions: 14, approved: 8, revenue: 1120000 },
      { month: 'May', prospects: 61, qualified: 42, submissions: 26, approved: 16, revenue: 2240000 },
    ],
    topPerformers: [
      { name: 'Sarah Johnson', prospects: 34, conversions: 22, revenue: 3080000 },
      { name: 'Mike Rodriguez', prospects: 28, conversions: 18, revenue: 2520000 },
      { name: 'Lisa Chen', prospects: 31, conversions: 16, revenue: 2240000 },
      { name: 'David Smith', prospects: 25, conversions: 15, revenue: 2100000 },
    ],
    businessTypeBreakdown: [
      { type: 'Dental Practices', count: 89, percentage: 36.0 },
      { type: 'Medical Practices', count: 67, percentage: 27.1 },
      { type: 'Veterinary Clinics', count: 43, percentage: 17.4 },
      { type: 'Physical Therapy', count: 28, percentage: 11.3 },
      { type: 'Urgent Care', count: 20, percentage: 8.1 },
    ]
  };

  const displayAnalytics = analytics || mockAnalytics;

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCC Lending Analytics</h1>
          <p className="text-gray-600">Performance metrics and ROI analysis for CCC's lending operations</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{displayAnalytics.totalProspects.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Prospects</p>
                <p className="text-xs text-green-600">+12% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{displayAnalytics.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Qualification Rate</p>
                <p className="text-xs text-green-600">+3.2% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{displayAnalytics.approvalRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-xs text-red-600">-1.8% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">${(displayAnalytics.pipelineValue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-xs text-green-600">+18% vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="business-types">Business Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trends</CardTitle>
                <CardDescription>Prospect acquisition and conversion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayAnalytics.monthlyStats.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg w-12 text-center">
                          <span className="text-sm font-medium text-blue-700">{month.month}</span>
                        </div>
                        <div>
                          <p className="font-medium">{month.prospects} prospects</p>
                          <p className="text-sm text-gray-600">
                            {month.qualified} qualified ({((month.qualified / month.prospects) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{month.approved} approved</p>
                        <p className="text-sm text-gray-600">${(month.revenue / 1000000).toFixed(1)}M revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Critical metrics for lending operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Average Qualification Score</span>
                      <span className="text-sm font-bold">{displayAnalytics.avgQualificationScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${displayAnalytics.avgQualificationScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Submission Rate</span>
                      <span className="text-sm font-bold">
                        {((displayAnalytics.totalSubmissions / displayAnalytics.qualifiedProspects) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(displayAnalytics.totalSubmissions / displayAnalytics.qualifiedProspects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Approval Rate</span>
                      <span className="text-sm font-bold">{displayAnalytics.approvalRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${displayAnalytics.approvalRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Loan Amount</span>
                      <span className="text-lg font-bold text-green-600">
                        ${displayAnalytics.avgLoanAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Loan Officers</CardTitle>
              <CardDescription>Individual performance metrics for the team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayAnalytics.topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{performer.name}</p>
                        <p className="text-sm text-gray-600">
                          {performer.prospects} prospects • {performer.conversions} conversions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${(performer.revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-gray-600">
                        {((performer.conversions / performer.prospects) * 100).toFixed(1)}% conversion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Value Breakdown</CardTitle>
                <CardDescription>Current pipeline status and value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prospects in Pipeline</span>
                    <span className="font-bold">{displayAnalytics.totalProspects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Qualified Prospects</span>
                    <span className="font-bold text-green-600">{displayAnalytics.qualifiedProspects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Submitted Applications</span>
                    <span className="font-bold text-blue-600">{displayAnalytics.totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Approved Loans</span>
                    <span className="font-bold text-purple-600">{displayAnalytics.approvedSubmissions}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Pipeline Value</span>
                      <span className="text-xl font-bold text-green-600">
                        ${(displayAnalytics.pipelineValue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Financial performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Requested Amount</span>
                    <span className="font-bold">${(displayAnalytics.totalRequestedAmount / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Loan Size</span>
                    <span className="font-bold text-blue-600">${displayAnalytics.avgLoanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Growth Rate</span>
                    <span className="font-bold text-green-600">+12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ROI per Prospect</span>
                    <span className="font-bold text-purple-600">$35,420</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Projected Annual Revenue</span>
                      <span className="text-xl font-bold text-green-600">$32.4M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Type Performance</CardTitle>
              <CardDescription>Breakdown by healthcare business categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayAnalytics.businessTypeBreakdown.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg w-12 text-center">
                        <span className="text-sm font-medium text-blue-700">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{type.type}</p>
                        <p className="text-sm text-gray-600">{type.count} prospects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{type.percentage.toFixed(1)}%</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
