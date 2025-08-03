import express, { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase';
import { ApiResponse } from '../types';

const approveProfileSchema = z.object({
  notes: z.string().optional(),
});

const rejectProfileSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  notes: z.string().optional(),
});

export const getPendingProfiles = async (req: Request, res: Response) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        users!profiles_submittedById_fkey (
          id, email, createdAt
        )
      `)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('Get pending profiles error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch pending profiles'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: profiles
    } as ApiResponse);

  } catch (error) {
    console.error('Get pending profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const approveProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      } as ApiResponse);
    }

    const validatedData = approveProfileSchema.parse(req.body);

    // Check if profile exists and is pending
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, status, submittedById')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      } as ApiResponse);
    }

    if (profile.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Profile is not pending approval'
      } as ApiResponse);
    }

    // Update profile status
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'APPROVED',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile approval error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to approve profile'
      } as ApiResponse);
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        action: 'APPROVE_PROFILE',
        notes: validatedData.notes,
        adminId: adminId,
        profileId: id,
        createdAt: new Date().toISOString()
      });

    if (logError) {
      console.error('Admin action logging error:', logError);
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile approved successfully'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Approve profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const rejectProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      } as ApiResponse);
    }

    const validatedData = rejectProfileSchema.parse(req.body);

    // Check if profile exists and is pending
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, status, submittedById')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      } as ApiResponse);
    }

    if (profile.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Profile is not pending approval'
      } as ApiResponse);
    }

    // Update profile status
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'REJECTED',
        rejectionReason: validatedData.reason,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile rejection error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to reject profile'
      } as ApiResponse);
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        action: 'REJECT_PROFILE',
        reason: validatedData.reason,
        notes: validatedData.notes,
        adminId: adminId,
        profileId: id,
        createdAt: new Date().toISOString()
      });

    if (logError) {
      console.error('Admin action logging error:', logError);
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile rejected successfully'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Reject profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    // Get all counts in parallel
    const [
      { count: totalUsers },
      { count: totalProfiles },
      { count: pendingProfiles },
      { count: approvedProfiles },
      { count: rejectedProfiles },
      { count: activeInterests }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
      supabase.from('interests').select('*', { count: 'exact', head: true }).eq('isActive', true)
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalProfiles: totalProfiles || 0,
      pendingProfiles: pendingProfiles || 0,
      approvedProfiles: approvedProfiles || 0,
      rejectedProfiles: rejectedProfiles || 0,
      activeInterests: activeInterests || 0,
    };

    res.json({
      success: true,
      data: stats
    } as ApiResponse);

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, emailVerified, createdAt, updatedAt')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: users
    } as ApiResponse);

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = (req as any).user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      } as ApiResponse);
    }

    if (!['ADMIN', 'PARENT_RELATIVE'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      } as ApiResponse);
    }

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        role: role,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update user role error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      } as ApiResponse);
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        action: 'UPDATE_USER_ROLE',
        notes: `Changed role to ${role}`,
        adminId: adminId,
        createdAt: new Date().toISOString()
      });

    if (logError) {
      console.error('Admin action logging error:', logError);
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getAdminActions = async (req: Request, res: Response) => {
  try {
    const { data: actions, error } = await supabase
      .from('admin_actions')
      .select(`
        *,
        users!admin_actions_adminId_fkey (
          id, email
        ),
        profiles!admin_actions_profileId_fkey (
          id, name
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Get admin actions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch admin actions'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: actions
    } as ApiResponse);

  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};