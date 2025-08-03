import React from 'react';

const ProfileFormPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Biodata Profile</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Feature Coming Soon
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The profile creation form is currently under development. This will include:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Personal information (name, age, profession, etc.)</li>
                    <li>Family background and values</li>
                    <li>Education and career details</li>
                    <li>Religious practice and preferences</li>
                    <li>Partner preferences and requirements</li>
                    <li>Contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Profile Form</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your detailed biodata profile here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormPage;