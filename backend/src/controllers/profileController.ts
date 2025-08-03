import express, { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase';
import { ApiResponse } from '../types';

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
  educationDegreeOther: z.string().optional(),
  educationSubject: z.string().min(1, 'Education subject is required'),
  educationYear: z.number().min(1980).max(new Date().getFullYear()),
  educationInstitute: z.string().min(1, 'Education institute is required'),
  
  // Profession
  profession: z.string().min(1, 'Profession is required'),
  professionOther: z.string().optional(),
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
  citizenship: z.string().min(1, 'Citizenship is required'),
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
  
  // Consent and terms
  hasParentConsent: z.boolean().refine(val => val === true, 'Parent consent is required'),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
});

export const createProfile = async (req: Request, res: Response) => {
  try {
    const validatedData = profileSchema.parse(req.body);
    
    // Get user from auth middleware
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('submittedById', userId)
      .single();

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'User already has a profile'
      } as ApiResponse);
    }

    // Create profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        ...validatedData,
        submittedById: userId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      console.error('Data being inserted:', {
        ...validatedData,
        submittedById: userId,
        status: 'PENDING'
      });
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}`,
        details: error.details
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Profile created successfully and submitted for review'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'APPROVED')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Get profiles error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profiles'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: profiles
    } as ApiResponse);

  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('status', 'APPROVED')
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: profile
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('submittedById', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Get user profile error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: profile || null
    } as ApiResponse);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    const validatedData = profileSchema.parse(req.body);

    // Check if profile belongs to user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('submittedById')
      .eq('id', id)
      .single();

    if (fetchError || !existingProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      } as ApiResponse);
    }

    if (existingProfile.submittedById !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      } as ApiResponse);
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        status: 'PENDING' // Reset to pending when updated
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully and resubmitted for review'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    // Check if profile belongs to user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('submittedById')
      .eq('id', id)
      .single();

    if (fetchError || !existingProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      } as ApiResponse);
    }

    if (existingProfile.submittedById !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this profile'
      } as ApiResponse);
    }

    // Delete profile (or mark as withdrawn)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status: 'WITHDRAWN',
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Profile deletion error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to withdraw profile'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Profile withdrawn successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};