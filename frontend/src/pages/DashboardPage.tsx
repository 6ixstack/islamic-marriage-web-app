import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to your Dashboard, {user?.email}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Profile</h3>
              <p className="text-gray-600 mb-4">Create a biodata profile for marriage consideration.</p>
              <Link
                to="/profile/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Profile
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Browse Profiles</h3>
              <p className="text-gray-600 mb-4">View and search through available marriage profiles.</p>
              <Link
                to="/profiles"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Profiles
              </Link>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Dashboard</h3>
                <p className="text-gray-600 mb-4">Manage profiles, users, and platform settings.</p>
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Admin Panel
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Complete your profile with accurate biodata information</li>
              <li>• Browse through available marriage prospects</li>
              <li>• Express interest in profiles that match your preferences</li>
              <li>• Wait for mutual interest and admin approval for contact information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;