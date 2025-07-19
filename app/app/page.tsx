
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
    description: 'CCC loan officers find qualified healthcare businesses with location-based search and lending criteria indicators.',
  },
  {
    icon: Database,
    title: 'Prospect Database',
    description: 'CCC internal database with lending status tracking, filtering, export functionality, and bulk operations.',
  },
  {
    icon: MessageSquare,
    title: 'Outreach Tracking',
    description: 'Track loan officer activities: emails, calls, LinkedIn outreach, and follow-up scheduling.',
  },
  {
    icon: CheckSquare,
    title: 'Lending Qualification',
    description: 'CCC qualification workflow with auto-scoring and comprehensive lending assessment management.',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Secure loan application document collection with tracking and automated reminder system.',
  },
  {
    icon: Send,
    title: 'Partner Submissions',
    description: 'Package loan applications and submit to CCC lending partners with status tracking.',
  },
  {
    icon: BarChart3,
    title: 'CCC Analytics',
    description: 'Loan officer performance, conversion rates, pipeline metrics, and lending ROI analysis.',
  },
];

const qualificationCriteria = [
  {
    icon: DollarSign,
    title: 'Minimum $17,000 Monthly Revenue',
    description: 'CCC lending requirement for healthcare business financial strength',
  },
  {
    icon: Building2,
    title: '6+ Months in Business',
    description: 'CCC requirement for established healthcare practice stability',
  },
  {
    icon: MapPin,
    title: 'US-Based Location',
    description: 'CCC lending geographic focus within the United States',
  },
  {
    icon: Users,
    title: 'Owners and Managers',
    description: 'CCC requirement for direct access to healthcare business decision-makers',
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
            CCC Lending Operations Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Internal operational system for Commercial Capital Connect's healthcare lending team. 
            Manage prospect pipeline, track lending opportunities, and streamline our business development workflow.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/auth/signin">
                Access Internal System
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signup">Request Access</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Qualification Criteria */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              CCC Lending Target Criteria
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our internal system helps loan officers identify healthcare prospects that meet CCC's lending requirements
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
              CCC Operational Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From prospect research to loan submission, our internal system supports every stage of CCC's healthcare lending operations
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
            CCC Loan Officers & Business Development Team
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Access our internal operational dashboard to efficiently manage healthcare lending prospects and streamline the loan origination process.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signin">
              Access Internal System
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
              © 2024 Commercial Capital Connect. Internal lending operations system.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
