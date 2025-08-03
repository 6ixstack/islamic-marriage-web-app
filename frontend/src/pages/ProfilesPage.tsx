import React from 'react';

const ProfilesPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Profiles</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Feature Coming Soon
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The profile browsing system is currently under development. This will include:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Search and filter profiles by various criteria</li>
                    <li>View detailed biodata information</li>
                    <li>Express interest in profiles</li>
                    <li>Track mutual interests</li>
                    <li>Request contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Profile Gallery</h3>
            <p className="mt-1 text-sm text-gray-500">
              Browse and search through marriage profiles here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilesPage;