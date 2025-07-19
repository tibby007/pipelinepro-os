
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Search,
  Database,
  MessageSquare,
  CheckSquare,
  FileText,
  Send,
  BarChart3,
  ArrowRight,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Prospect Research',
    description: 'Find and qualify healthcare businesses with location-based search and qualification indicators.',
  },
  {
    icon: Database,
    title: 'Prospect Management',
    description: 'Complete database with status tracking, filtering, export functionality, and bulk actions.',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Channel Outreach',
    description: 'Email templates, LinkedIn tracking, phone logs, and automated follow-up scheduling.',
  },
  {
    icon: CheckSquare,
    title: 'Qualification System',
    description: 'Chat-style qualifier with auto-scoring and comprehensive qualification status management.',
  },
  {
    icon: FileText,
    title: 'Document Collection',
    description: 'Secure file upload system with document tracking and automated reminder system.',
  },
  {
    icon: Send,
    title: 'Submission Center',
    description: 'Package applications and auto-email to Stella@arffinancial.com with status tracking.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Conversion rates, performance metrics, time-in-stage tracking, and ROI calculations.',
  },
];

const qualificationCriteria = [
  {
    icon: DollarSign,
    title: 'Minimum $17,000 Monthly Revenue',
    description: 'Target businesses with strong financial performance',
  },
  {
    icon: Building2,
    title: '6+ Months in Business',
    description: 'Established healthcare practices with proven stability',
  },
  {
    icon: MapPin,
    title: 'US-Based Location',
    description: 'Focus on businesses located within the United States',
  },
  {
    icon: Users,
    title: 'Owners and Managers',
    description: 'Direct access to decision-makers in healthcare businesses',
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CCC Healthcare Pipeline</h1>
                <p className="text-sm text-gray-500">Commercial Capital Connect</p>
              </div>
            </div>
            <div className="space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Healthcare Prospect Pipeline
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive web application for managing healthcare business prospects. 
            Research, qualify, and convert prospects with our complete pipeline management system.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Qualification Criteria */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Target Qualification Criteria
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our system is specifically designed to target healthcare businesses that meet these essential criteria
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {qualificationCriteria.map((criterion, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <criterion.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{criterion.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{criterion.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Pipeline Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From prospect research to final submission, manage every stage of your healthcare business pipeline
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Prospect Pipeline?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join healthcare professionals who are already using our platform to manage and convert prospects efficiently.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CCC Healthcare Pipeline</h3>
                <p className="text-sm text-gray-500">Commercial Capital Connect</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Commercial Capital Connect. Healthcare prospect management system.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
