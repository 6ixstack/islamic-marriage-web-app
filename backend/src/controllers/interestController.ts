import express, { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase';
import { ApiResponse } from '../types';

const expressInterestSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  notes: z.string().optional(),
});

export const expressInterest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    const validatedData = expressInterestSchema.parse(req.body);

    // Check if profile exists and is approved
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, submittedById, status')
      .eq('id', validatedData.profileId)
      .eq('status', 'APPROVED')
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found or not approved'
      } as ApiResponse);
    }

    // Check if user is trying to express interest in their own profile
    if (profile.submittedById === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot express interest in your own profile'
      } as ApiResponse);
    }

    // Check if interest already exists
    const { data: existingInterest } = await supabase
      .from('interests')
      .select('id')
      .eq('interestedUserId', userId)
      .eq('targetProfileId', validatedData.profileId)
      .eq('isActive', true)
      .single();

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        error: 'Interest already expressed for this profile'
      } as ApiResponse);
    }

    // Create interest record
    const { data: interest, error } = await supabase
      .from('interests')
      .insert({
        interestedUserId: userId,
        targetProfileId: validatedData.profileId,
        notes: validatedData.notes,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Interest creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to express interest'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: interest,
      message: 'Interest expressed successfully'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Express interest error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const withdrawInterest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    const { id } = req.params;

    // Check if interest exists and belongs to user
    const { data: interest, error: fetchError } = await supabase
      .from('interests')
      .select('interestedUserId')
      .eq('id', id)
      .single();

    if (fetchError || !interest) {
      return res.status(404).json({
        success: false,
        error: 'Interest not found'
      } as ApiResponse);
    }

    if (interest.interestedUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to withdraw this interest'
      } as ApiResponse);
    }

    // Mark interest as inactive instead of deleting
    const { error } = await supabase
      .from('interests')
      .update({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Interest withdrawal error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to withdraw interest'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Interest withdrawn successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Withdraw interest error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getMyInterests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    // Get interests expressed by the user
    const { data: interests, error } = await supabase
      .from('interests')
      .select(`
        *,
        profiles!interests_targetProfileId_fkey (
          id, name, age, profession, currentResidence, gender, educationDegree, educationSubject
        )
      `)
      .eq('interestedUserId', userId)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Get interests error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch interests'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: interests
    } as ApiResponse);

  } catch (error) {
    console.error('Get my interests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getInterestsInMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    // First get the user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('submittedById', userId)
      .eq('status', 'APPROVED')
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({
        success: false,
        error: 'No approved profile found'
      } as ApiResponse);
    }

    // Get interests in the user's profile
    const { data: interests, error } = await supabase
      .from('interests')
      .select(`
        *,
        users!interests_interestedUserId_fkey (
          id, email
        )
      `)
      .eq('targetProfileId', userProfile.id)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Get profile interests error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile interests'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: interests
    } as ApiResponse);

  } catch (error) {
    console.error('Get interests in my profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getMutualInterests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      } as ApiResponse);
    }

    // Get user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('submittedById', userId)
      .eq('status', 'APPROVED')
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({
        success: false,
        error: 'No approved profile found'
      } as ApiResponse);
    }

    // Complex query to find mutual interests
    // This finds cases where:
    // 1. User A expressed interest in User B's profile
    // 2. User B expressed interest in User A's profile
    const { data: mutualInterests, error } = await supabase
      .from('interests')
      .select(`
        *,
        profiles!interests_targetProfileId_fkey (
          id, name, profession, currentResidence, gender
        )
      `)
      .eq('interestedUserId', userId)
      .eq('isActive', true);

    if (error) {
      console.error('Get mutual interests error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch mutual interests'
      } as ApiResponse);
    }

    // Filter for actual mutual interests
    const mutualMatches = [];
    
    if (mutualInterests) {
      for (const interest of mutualInterests) {
        // Check if the target profile owner has also expressed interest in our profile
        const { data: reverseInterest } = await supabase
          .from('interests')
          .select('id')
          .eq('targetProfileId', userProfile.id)
          .eq('isActive', true)
          .single();

        if (reverseInterest) {
          mutualMatches.push(interest);
        }
      }
    }

    res.json({
      success: true,
      data: mutualMatches
    } as ApiResponse);

  } catch (error) {
    console.error('Get mutual interests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};