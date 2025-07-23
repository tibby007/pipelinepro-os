'use client';

import Link from 'next/link';

export default function HomePage() {
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
                href="/dashboard"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
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
            <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI-Powered Outreach Generation</li>
              <li>• Real-Time AI Conversations</li>
              <li>• Automated Pre-Qualification</li>
              <li>• Intelligent Document Requests</li>
              <li>• Multi-Industry Support</li>
            </ul>
          </div>

          <div className="text-xs text-gray-500">
            <p>✅ Database: Connected</p>
            <p>✅ AI: OpenRouter Enabled</p>
            <p>✅ Deployment: Netlify</p>
          </div>
        </div>
      </div>
    </div>
  );
}