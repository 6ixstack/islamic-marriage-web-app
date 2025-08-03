import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Admin Features Coming Soon
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    The admin dashboard is currently under development. This will include:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Review and approve/reject pending profiles</li>
                    <li>Manage user accounts and roles</li>
                    <li>Monitor platform activity and analytics</li>
                    <li>Configure platform settings</li>
                    <li>Handle reported content and disputes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h3>
              <p className="text-2xl font-bold text-orange-600">0</p>
              <p className="text-sm text-gray-500">Profiles awaiting review</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Registered users</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Profiles</h3>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500">Approved profiles</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Admin Control Panel</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage platform operations and user content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;