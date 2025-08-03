import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Profile } from '../types';

interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  pendingProfiles: number;
  approvedProfiles: number;
  rejectedProfiles: number;
  activeInterests: number;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, profilesData] = await Promise.all([
        apiService.getStats(),
        apiService.getPendingProfiles()
      ]);
      
      setStats(statsData);
      setPendingProfiles(profilesData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProfile = async (profileId: string, notes?: string) => {
    try {
      setActionLoading(profileId);
      await apiService.approveProfile(profileId, notes);
      
      // Remove from pending list and update stats
      setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
      if (stats) {
        setStats({
          ...stats,
          pendingProfiles: stats.pendingProfiles - 1,
          approvedProfiles: stats.approvedProfiles + 1
        });
      }
      
      setSelectedProfile(null);
      alert('Profile approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve profile');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProfile = async (profileId: string, reason: string, notes?: string) => {
    try {
      setActionLoading(profileId);
      await apiService.rejectProfile(profileId, reason, notes);
      
      // Remove from pending list and update stats
      setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
      if (stats) {
        setStats({
          ...stats,
          pendingProfiles: stats.pendingProfiles - 1,
          rejectedProfiles: stats.rejectedProfiles + 1
        });
      }
      
      setSelectedProfile(null);
      alert('Profile rejected successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject profile');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateAge = (dateOfBirth: string | Date): number => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage profiles, users, and platform operations
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Profiles ({pendingProfiles.length})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingProfiles}</p>
              <p className="text-sm text-gray-500">Profiles awaiting review</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Registered users</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Profiles</h3>
              <p className="text-3xl font-bold text-green-600">{stats.approvedProfiles}</p>
              <p className="text-sm text-gray-500">Approved profiles</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Total Profiles</h3>
              <p className="text-3xl font-bold text-gray-600">{stats.totalProfiles}</p>
              <p className="text-sm text-gray-500">All profiles submitted</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rejected Profiles</h3>
              <p className="text-3xl font-bold text-red-600">{stats.rejectedProfiles}</p>
              <p className="text-sm text-gray-500">Profiles rejected</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Interests</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.activeInterests}</p>
              <p className="text-sm text-gray-500">Current interest expressions</p>
            </div>
          </div>
        )}

        {/* Pending Profiles Tab */}
        {activeTab === 'pending' && (
          <div>
            {pendingProfiles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending profiles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All profiles have been reviewed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProfiles.map((profile) => (
                  <div key={profile.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {profile.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Age:</span> {calculateAge(profile.dateOfBirth)} years</p>
                        <p><span className="font-medium">Gender:</span> {profile.gender}</p>
                        <p><span className="font-medium">Education:</span> {profile.educationDegree}</p>
                        <p><span className="font-medium">Profession:</span> {profile.profession}</p>
                        <p><span className="font-medium">Location:</span> {profile.currentResidence}</p>
                        <p><span className="font-medium">Submitted:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleApproveProfile(profile.id)}
                          disabled={actionLoading === profile.id}
                          className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === profile.id ? 'Processing...' : 'Quick Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Review Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Review Profile: {selectedProfile.name}</h3>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Name:</span> {selectedProfile.name}</p>
                      <p><span className="font-medium">Age:</span> {calculateAge(selectedProfile.dateOfBirth)} years</p>
                      <p><span className="font-medium">Gender:</span> {selectedProfile.gender}</p>
                      <p><span className="font-medium">Height:</span> {selectedProfile.height}</p>
                      <p><span className="font-medium">Marital Status:</span> {selectedProfile.maritalStatus.replace('_', ' ')}</p>
                      <p><span className="font-medium">Current Residence:</span> {selectedProfile.currentResidence}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Education:</span> {selectedProfile.educationDegree} in {selectedProfile.educationSubject}</p>
                      <p><span className="font-medium">Institution:</span> {selectedProfile.educationInstitute}</p>
                      <p><span className="font-medium">Profession:</span> {selectedProfile.profession}</p>
                      <p><span className="font-medium">Religious Practice:</span> {selectedProfile.religiousPractice.replace('_', ' ')}</p>
                      <p><span className="font-medium">Immigration Status:</span> {selectedProfile.immigrationStatus.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">About:</p>
                    <p className="text-sm text-gray-600">{selectedProfile.aboutYou}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Looking for:</p>
                    <p className="text-sm text-gray-600">{selectedProfile.aboutSpouse}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a rejection reason:');
                      if (reason) {
                        handleRejectProfile(selectedProfile.id, reason);
                      }
                    }}
                    disabled={actionLoading === selectedProfile.id}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveProfile(selectedProfile.id)}
                    disabled={actionLoading === selectedProfile.id}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedProfile.id ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;