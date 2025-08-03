"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.verifyEmail = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const supabase_1 = require("@/utils/supabase");
const jwt_1 = require("@/utils/jwt");
const uuid_1 = require("uuid");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', validatedData.email)
            .single();
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        if (!user.emailVerified) {
            return res.status(401).json({
                success: false,
                error: 'Please verify your email before signing in'
            });
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        const responseData = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt)
            },
            token
        };
        res.json({
            success: true,
            data: responseData,
            message: 'Login successful'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        // Check if user already exists
        const { data: existingUser } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('email', validatedData.email)
            .single();
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 12);
        const emailVerificationToken = (0, uuid_1.v4)();
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .insert({
            email: validatedData.email,
            password: hashedPassword,
            emailVerificationToken,
            role: 'PARENT_RELATIVE'
        })
            .select()
            .single();
        if (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create account'
            });
        }
        // Note: In production, send verification email here
        console.log(`Verification token for ${user.email}: ${emailVerificationToken}`);
        res.status(201).json({
            success: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            data: {
                id: user.id,
                email: user.email
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.register = register;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const { data: user } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('emailVerificationToken', token)
            .single();
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification token'
            });
        }
        const { error } = await supabase_1.supabase
            .from('users')
            .update({
            emailVerified: true,
            emailVerificationToken: null
        })
            .eq('id', user.id);
        if (error) {
            console.error('Email verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify email'
            });
        }
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.verifyEmail = verifyEmail;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .select('id, email, role, emailVerified, createdAt, updatedAt')
            .eq('id', req.user.userId)
            .single();
        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            data: {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt)
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getProfile = getProfile;
