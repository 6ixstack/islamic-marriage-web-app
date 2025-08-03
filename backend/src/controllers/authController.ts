import express, { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase';
import { ApiResponse } from '../types';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    if (!data.user) {
      return res.status(401).json({
        success: false,
        error: 'Login failed'
      } as ApiResponse);
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, emailVerified, createdAt, updatedAt')
      .eq('email', data.user.email)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        user: userProfile,
        session: data.session
      },
      message: 'Login successful'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create account'
      } as ApiResponse);
    }

    // Create user profile in our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: validatedData.email,
        role: 'PARENT_RELATIVE',
        emailVerified: false
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Still return success since the auth user was created
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        id: data.user.id,
        email: data.user.email
      }
    } as ApiResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation error'
      } as ApiResponse);
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      } as ApiResponse);
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      } as ApiResponse);
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, emailVerified, createdAt, updatedAt')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: userProfile
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      } as ApiResponse);
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { error } = await supabase.auth.admin.signOut(token);
    
    if (error) {
      console.error('Logout error:', error);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};