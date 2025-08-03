import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Profile, Gender, MaritalStatus, ReligiousPracticeLevel, ImmigrationStatus } from '../types';

interface FilterState {
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  maritalStatus?: MaritalStatus;
  education?: string;
  profession?: string;
  currentResidence?: string;
  immigrationStatus?: ImmigrationStatus;
  religiousPractice?: ReligiousPracticeLevel;
}

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, filters]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProfiles();
      setProfiles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }
    
    if (filters.minAge || filters.maxAge) {
      filtered = filtered.filter(p => {
        const age = calculateAge(p.dateOfBirth);
        return (!filters.minAge || age >= filters.minAge) && 
               (!filters.maxAge || age <= filters.maxAge);
      });
    }

    if (filters.maritalStatus) {
      filtered = filtered.filter(p => p.maritalStatus === filters.maritalStatus);
    }

    if (filters.education) {
      filtered = filtered.filter(p => 
        p.educationDegree.toLowerCase().includes(filters.education!.toLowerCase()) ||
        p.educationSubject.toLowerCase().includes(filters.education!.toLowerCase())
      );
    }

    if (filters.profession) {
      filtered = filtered.filter(p => 
        p.profession.toLowerCase().includes(filters.profession!.toLowerCase())
      );
    }

    if (filters.currentResidence) {
      filtered = filtered.filter(p => 
        p.currentResidence.toLowerCase().includes(filters.currentResidence!.toLowerCase())
      );
    }

    if (filters.immigrationStatus) {
      filtered = filtered.filter(p => p.immigrationStatus === filters.immigrationStatus);
    }

    if (filters.religiousPractice) {
      filtered = filtered.filter(p => p.religiousPractice === filters.religiousPractice);
    }

    setFilteredProfiles(filtered);
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

  const handleExpressInterest = async (profileId: string) => {
    try {
      await apiService.expressInterest(profileId);
      alert('Interest expressed successfully! The family will be notified.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to express interest');
    }
  };

  const resetFilters = () => {
    setFilters({});
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Profiles</h1>
            <p className="mt-2 text-sm text-gray-600">
              {filteredProfiles.length} profiles found
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={filters.gender || ''}
                  onChange={(e) => setFilters({...filters, gender: e.target.value as Gender || undefined})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Min Age</label>
                <input
                  type="number"
                  value={filters.minAge || ''}
                  onChange={(e) => setFilters({...filters, minAge: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  min="18"
                  max="65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Age</label>
                <input
                  type="number"
                  value={filters.maxAge || ''}
                  onChange={(e) => setFilters({...filters, maxAge: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  min="18"
                  max="65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  value={filters.maritalStatus || ''}
                  onChange={(e) => setFilters({...filters, maritalStatus: e.target.value as MaritalStatus || undefined})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <input
                  type="text"
                  value={filters.education || ''}
                  onChange={(e) => setFilters({...filters, education: e.target.value || undefined})}
                  placeholder="e.g., Computer Science, Medicine"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Profession</label>
                <input
                  type="text"
                  value={filters.profession || ''}
                  onChange={(e) => setFilters({...filters, profession: e.target.value || undefined})}
                  placeholder="e.g., Software Engineer"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Residence</label>
                <input
                  type="text"
                  value={filters.currentResidence || ''}
                  onChange={(e) => setFilters({...filters, currentResidence: e.target.value || undefined})}
                  placeholder="e.g., Toronto, London"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Religious Practice</label>
                <select
                  value={filters.religiousPractice || ''}
                  onChange={(e) => setFilters({...filters, religiousPractice: e.target.value as ReligiousPracticeLevel || undefined})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="VERY_PRACTICING">Very Practicing</option>
                  <option value="PRACTICING">Practicing</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="BASIC">Basic</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No profiles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {profiles.length === 0 
                ? 'No approved profiles available yet.'
                : 'Try adjusting your filters to see more results.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Profile #{profile.id.slice(-6)}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.gender === 'MALE' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {profile.gender === 'MALE' ? 'Brother' : 'Sister'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Age:</span> {calculateAge(profile.dateOfBirth)} years</p>
                    <p><span className="font-medium">Height:</span> {profile.height}</p>
                    <p><span className="font-medium">Education:</span> {profile.educationDegree} in {profile.educationSubject}</p>
                    <p><span className="font-medium">Profession:</span> {profile.profession}</p>
                    <p><span className="font-medium">Location:</span> {profile.currentResidence}</p>
                    <p><span className="font-medium">Status:</span> {profile.maritalStatus.replace('_', ' ')}</p>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => setSelectedProfile(profile)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleExpressInterest(profile.id)}
                      className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Express Interest
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Detail Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Profile Details</h3>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Name:</span> {selectedProfile.name}</p>
                      <p><span className="font-medium">Age:</span> {calculateAge(selectedProfile.dateOfBirth)} years</p>
                      <p><span className="font-medium">Height:</span> {selectedProfile.height}</p>
                      <p><span className="font-medium">Complexion:</span> {selectedProfile.complexion.replace('_', ' ')}</p>
                      <p><span className="font-medium">Born in:</span> {selectedProfile.countryOfBirth}</p>
                      <p><span className="font-medium">Current Residence:</span> {selectedProfile.currentResidence}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Education:</span> {selectedProfile.educationDegree} in {selectedProfile.educationSubject}</p>
                      <p><span className="font-medium">Institution:</span> {selectedProfile.educationInstitute}</p>
                      <p><span className="font-medium">Profession:</span> {selectedProfile.profession}</p>
                      {selectedProfile.company && (
                        <p><span className="font-medium">Company:</span> {selectedProfile.company}</p>
                      )}
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
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setSelectedProfile(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleExpressInterest(selectedProfile.id)}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Express Interest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilesPage;