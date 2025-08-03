import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/utils/database';
import { generateToken } from '@/utils/jwt';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
    const validatedData = loginSchema.parse(req.body) as LoginRequest;
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
    }

    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before signing in'
      } as ApiResponse);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const responseData: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    };

    res.json({
      success: true,
      data: responseData,
      message: 'Login successful'
    } as ApiResponse<AuthResponse>);

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
    const validatedData = registerSchema.parse(req.body) as RegisterRequest;
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      } as ApiResponse);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    const emailVerificationToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        emailVerificationToken,
        role: 'PARENT_RELATIVE'
      }
    });

    // Note: In production, send verification email here
    console.log(`Verification token for ${user.email}: ${emailVerificationToken}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        id: user.id,
        email: user.email
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

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token'
      } as ApiResponse);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};