import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  ProfileFormData, 
  Gender, 
  MaritalStatus, 
  Complexion, 
  ImmigrationStatus, 
  ReligiousPracticeLevel 
} from '../types';
import { apiService } from '../services/api';

const profileSchema = z.object({
  // Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  height: z.string().min(1, 'Height is required'),
  complexion: z.enum(['VERY_FAIR', 'FAIR', 'WHEATISH', 'BROWN', 'DARK']),
  
  // Education
  educationDegree: z.string().min(1, 'Education degree is required'),
  educationSubject: z.string().min(1, 'Education subject is required'),
  educationYear: z.number().min(1980).max(new Date().getFullYear()),
  educationInstitute: z.string().min(1, 'Education institute is required'),
  
  // Profession
  profession: z.string().min(1, 'Profession is required'),
  company: z.string().optional(),
  
  // Personal
  maritalStatus: z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED']),
  
  // Parents Info
  fatherOccupation: z.string().min(1, 'Father occupation is required'),
  fatherEducation: z.string().optional(),
  motherOccupation: z.string().min(1, 'Mother occupation is required'),
  motherEducation: z.string().optional(),
  parentsLocation: z.string().min(1, 'Parents location is required'),
  
  // Current Status
  currentResidence: z.string().min(1, 'Current residence is required'),
  immigrationStatus: z.enum(['CITIZEN', 'PERMANENT_RESIDENT', 'TEMPORARY_VISA', 'STUDENT_VISA', 'WORK_VISA', 'OTHER']),
  immigrationDetails: z.string().optional(),
  
  // Preferences
  willingToRelocate: z.boolean(),
  willingToLiveWithInLaws: z.boolean(),
  
  // Religious Practice
  religiousPractice: z.enum(['VERY_PRACTICING', 'PRACTICING', 'MODERATE', 'BASIC']),
  praysFiveTimeDaily: z.boolean(),
  attendsMosqueRegularly: z.boolean(),
  halaalEarning: z.boolean(),
  halaalFood: z.boolean(),
  
  // Lifestyle
  drinksAlcohol: z.boolean(),
  smokes: z.boolean(),
  hobbies: z.string().optional(),
  
  // Pets
  hasPets: z.boolean(),
  petDetails: z.string().optional(),
  
  // Spouse Preferences
  spouseAgeRangeMin: z.number().min(18).max(65),
  spouseAgeRangeMax: z.number().min(18).max(65),
  spouseEducation: z.string().optional(),
  spouseCitizenship: z.string().optional(),
  spouseMinHeight: z.string().optional(),
  
  // About sections
  aboutYou: z.string().min(50, 'Please write at least 50 characters about yourself'),
  aboutSpouse: z.string().min(50, 'Please write at least 50 characters about your ideal spouse'),
  
  // Siblings
  siblings: z.array(z.object({
    gender: z.enum(['MALE', 'FEMALE']),
    age: z.number().min(1).max(100),
    maritalStatus: z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED']),
    profession: z.string().optional(),
  })).optional(),
  
  // Consent and terms
  hasParentConsent: z.boolean().refine(val => val === true, 'Parent consent is required'),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
}).refine((data) => data.spouseAgeRangeMin <= data.spouseAgeRangeMax, {
  message: "Minimum age must be less than or equal to maximum age",
  path: ["spouseAgeRangeMax"],
});

const ProfileFormPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { control, handleSubmit, formState: { errors }, watch, setValue, getValues, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      willingToRelocate: false,
      willingToLiveWithInLaws: false,
      praysFiveTimeDaily: false,
      attendsMosqueRegularly: false,
      halaalEarning: true,
      halaalFood: true,
      drinksAlcohol: false,
      smokes: false,
      hasPets: false,
      siblings: [],
      hasParentConsent: false,
      agreedToTerms: false,
    }
  });

  // Reset form when component mounts to ensure clean state
  useEffect(() => {
    setCurrentStep(1);
    reset({
      willingToRelocate: false,
      willingToLiveWithInLaws: false,
      praysFiveTimeDaily: false,
      attendsMosqueRegularly: false,
      halaalEarning: true,
      halaalFood: true,
      drinksAlcohol: false,
      smokes: false,
      hasPets: false,
      siblings: [],
      hasParentConsent: false,
      agreedToTerms: false,
    });
  }, [reset]);

  const hasPets = watch('hasPets');
  const immigrationStatus = watch('immigrationStatus');
  const siblings = watch('siblings') || [];

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await apiService.createProfile(data);
      // Reset form after successful submission
      reset();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile submission error:', error);
      alert(error.response?.data?.error || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup form state when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const totalSteps = 7;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <select
                      {...field}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                    <input
                      {...field}
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="height"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Height *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., 5'6&quot; or 170cm"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="complexion"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complexion *</label>
                    <select
                      {...field}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Complexion</option>
                      <option value="VERY_FAIR">Very Fair</option>
                      <option value="FAIR">Fair</option>
                      <option value="WHEATISH">Wheatish</option>
                      <option value="BROWN">Brown</option>
                      <option value="DARK">Dark</option>
                    </select>
                    {errors.complexion && <p className="mt-1 text-sm text-red-600">{errors.complexion.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="countryOfBirth"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country of Birth *</label>
                    <input
                      {...field}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.countryOfBirth && <p className="mt-1 text-sm text-red-600">{errors.countryOfBirth.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Education & Career</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="educationDegree"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education Degree *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Bachelor's, Master's, PhD"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.educationDegree && <p className="mt-1 text-sm text-red-600">{errors.educationDegree.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="educationSubject"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field of Study *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Computer Science, Medicine"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.educationSubject && <p className="mt-1 text-sm text-red-600">{errors.educationSubject.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="educationYear"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Graduation Year *</label>
                    <input
                      {...field}
                      type="number"
                      min="1980"
                      max={new Date().getFullYear()}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.educationYear && <p className="mt-1 text-sm text-red-600">{errors.educationYear.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="educationInstitute"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="University/College name"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.educationInstitute && <p className="mt-1 text-sm text-red-600">{errors.educationInstitute.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="profession"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profession *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Software Engineer, Doctor"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.profession && <p className="mt-1 text-sm text-red-600">{errors.profession.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company/Organization</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="Current workplace"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Family Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marital Status *</label>
                    <select
                      {...field}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="NEVER_MARRIED">Never Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                    {errors.maritalStatus && <p className="mt-1 text-sm text-red-600">{errors.maritalStatus.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="fatherOccupation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Father's Occupation *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Engineer, Businessman"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.fatherOccupation && <p className="mt-1 text-sm text-red-600">{errors.fatherOccupation.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="fatherEducation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Father's Education</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Bachelor's, Master's"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />

              <Controller
                name="motherOccupation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mother's Occupation *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Teacher, Homemaker"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.motherOccupation && <p className="mt-1 text-sm text-red-600">{errors.motherOccupation.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="motherEducation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mother's Education</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Bachelor's, Master's"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />

              <Controller
                name="parentsLocation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parents' Location *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Dhaka, Bangladesh"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.parentsLocation && <p className="mt-1 text-sm text-red-600">{errors.parentsLocation.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Current Status & Immigration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="currentResidence"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Residence *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Toronto, Canada"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.currentResidence && <p className="mt-1 text-sm text-red-600">{errors.currentResidence.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="immigrationStatus"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Immigration Status *</label>
                    <select
                      {...field}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Immigration Status</option>
                      <option value="CITIZEN">Citizen</option>
                      <option value="PERMANENT_RESIDENT">Permanent Resident</option>
                      <option value="TEMPORARY_VISA">Temporary Visa</option>
                      <option value="STUDENT_VISA">Student Visa</option>
                      <option value="WORK_VISA">Work Visa</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.immigrationStatus && <p className="mt-1 text-sm text-red-600">{errors.immigrationStatus.message}</p>}
                  </div>
                )}
              />

              {immigrationStatus && immigrationStatus !== 'CITIZEN' && (
                <Controller
                  name="immigrationDetails"
                  control={control}
                  render={({ field }) => (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Immigration Details</label>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Please provide additional details about your immigration status, visa type, expiry dates, etc."
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}
                />
              )}

              <Controller
                name="willingToRelocate"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="flex items-center">
                    <input
                      {...field}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Willing to relocate after marriage
                    </label>
                  </div>
                )}
              />

              <Controller
                name="willingToLiveWithInLaws"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="flex items-center">
                    <input
                      {...field}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Willing to live with in-laws
                    </label>
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Religious Practice & Lifestyle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="religiousPractice"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Religious Practice Level *</label>
                    <select
                      {...field}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Practice Level</option>
                      <option value="VERY_PRACTICING">Very Practicing</option>
                      <option value="PRACTICING">Practicing</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="BASIC">Basic</option>
                    </select>
                    {errors.religiousPractice && <p className="mt-1 text-sm text-red-600">{errors.religiousPractice.message}</p>}
                  </div>
                )}
              />

              <div className="space-y-4">
                <Controller
                  name="praysFiveTimeDaily"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Prays five times daily
                      </label>
                    </div>
                  )}
                />

                <Controller
                  name="attendsMosqueRegularly"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Attends mosque regularly
                      </label>
                    </div>
                  )}
                />

                <Controller
                  name="halaalEarning"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Ensures halaal earning
                      </label>
                    </div>
                  )}
                />

                <Controller
                  name="halaalFood"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Consumes only halaal food
                      </label>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Controller
                  name="drinksAlcohol"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Drinks alcohol
                      </label>
                    </div>
                  )}
                />

                <Controller
                  name="smokes"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Smokes
                      </label>
                    </div>
                  )}
                />
              </div>

              <Controller
                name="hobbies"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Hobbies & Interests</label>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="e.g., Reading, traveling, cooking, sports, photography..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Spouse Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="spouseAgeRangeMin"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Age *</label>
                    <input
                      {...field}
                      type="number"
                      min="18"
                      max="65"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.spouseAgeRangeMin && <p className="mt-1 text-sm text-red-600">{errors.spouseAgeRangeMin.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="spouseAgeRangeMax"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maximum Age *</label>
                    <input
                      {...field}
                      type="number"
                      min="18"
                      max="65"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.spouseAgeRangeMax && <p className="mt-1 text-sm text-red-600">{errors.spouseAgeRangeMax.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="spouseEducation"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Education</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Bachelor's or higher"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />

              <Controller
                name="spouseCitizenship"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Citizenship</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Canadian, Any"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />

              <Controller
                name="spouseMinHeight"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Height</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., 5'6&quot; or 170cm"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              />

              <Controller
                name="aboutSpouse"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">About Your Ideal Spouse *</label>
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Describe your ideal spouse, their qualities, values, and what you're looking for in a partner..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.aboutSpouse && <p className="mt-1 text-sm text-red-600">{errors.aboutSpouse.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Final Details</h3>
            
            <div className="space-y-6">
              <Controller
                name="aboutYou"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">About Yourself *</label>
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Tell us about yourself, your personality, values, goals, and what makes you unique..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.aboutYou && <p className="mt-1 text-sm text-red-600">{errors.aboutYou.message}</p>}
                  </div>
                )}
              />

              {/* Siblings Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Siblings Information</label>
                {siblings.map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Controller
                        name={`siblings.${index}.gender`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Gender</label>
                            <select
                              {...field}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                            </select>
                          </div>
                        )}
                      />
                      
                      <Controller
                        name={`siblings.${index}.age`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Age</label>
                            <input
                              {...field}
                              type="number"
                              min="1"
                              max="100"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                          </div>
                        )}
                      />
                      
                      <Controller
                        name={`siblings.${index}.maritalStatus`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Marital Status</label>
                            <select
                              {...field}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                              <option value="">Select</option>
                              <option value="NEVER_MARRIED">Never Married</option>
                              <option value="DIVORCED">Divorced</option>
                              <option value="WIDOWED">Widowed</option>
                            </select>
                          </div>
                        )}
                      />
                      
                      <Controller
                        name={`siblings.${index}.profession`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Profession</label>
                            <input
                              {...field}
                              type="text"
                              placeholder="Optional"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                          </div>
                        )}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const currentSiblings = siblings.filter((_, i) => i !== index);
                        setValue('siblings', currentSiblings);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Sibling
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    const newSiblings = [...siblings, { gender: 'MALE' as Gender, age: 25, maritalStatus: 'NEVER_MARRIED' as MaritalStatus, profession: '' }];
                    setValue('siblings', newSiblings);
                  }}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Add Sibling
                </button>
              </div>

              {/* Pet Details */}
              <div>
                <Controller
                  name="hasPets"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-center mb-4">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm font-medium text-gray-700">
                        I have pets
                      </label>
                    </div>
                  )}
                />

                {hasPets && (
                  <Controller
                    name="petDetails"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pet Details</label>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Please describe your pets (type, breed, age, etc.)"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                  />
                )}
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <Controller
                  name="hasParentConsent"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-start">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        I have this person's parents'/guardians' consent to create this biodata and proceed with marriage discussions *
                      </label>
                    </div>
                  )}
                />
                {errors.hasParentConsent && <p className="mt-1 text-sm text-red-600">{errors.hasParentConsent.message}</p>}

                <Controller
                  name="agreedToTerms"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex items-start">
                      <input
                        {...field}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        I agree to the terms and conditions, privacy policy, and understand that all information provided is truthful *
                      </label>
                    </div>
                  )}
                />
                {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms.message}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Invalid step</p>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Step 1
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow rounded-lg">
          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Create Biodata Profile</h1>
              <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Profile'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormPage;