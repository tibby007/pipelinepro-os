'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (session) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading PipelinePro OS...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              PipelinePro OS
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              AI-Powered Business Funding Pipeline
            </p>
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Test Accounts
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Admin:</strong> john@doe.com / johndoe123
              </div>
              <div>
                <strong>Manager:</strong> manager@ccc.com / manager123
              </div>
              <div>
                <strong>User:</strong> user@ccc.com / user123
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">AI Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>🤖 AI-Powered Outreach Generation</li>
              <li>💬 Real-Time AI Conversations</li>
              <li>📊 Automated Pre-Qualification</li>
              <li>📄 Intelligent Document Requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}