"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.register = exports.login = void 0;
const zod_1 = require("zod");
const supabase_1 = require("../utils/supabase");
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
        const { data, error } = await supabase_1.supabase.auth.signInWithPassword({
            email: validatedData.email,
            password: validatedData.password,
        });
        if (error) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }
        if (!data.user) {
            return res.status(401).json({
                success: false,
                error: 'Login failed'
            });
        }
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase_1.supabase
            .from('users')
            .select('id, email, role, emailVerified, createdAt, updatedAt')
            .eq('email', data.user.email)
            .single();
        if (profileError || !userProfile) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        res.json({
            success: true,
            data: {
                user: userProfile,
                token: data.session.access_token,
                session: data.session
            },
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
        // Create user in Supabase Auth
        const { data, error } = await supabase_1.supabase.auth.signUp({
            email: validatedData.email,
            password: validatedData.password,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        if (!data.user) {
            return res.status(400).json({
                success: false,
                error: 'Failed to create account'
            });
        }
        // Create user profile in our users table
        const { error: profileError } = await supabase_1.supabase
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
const getProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase_1.supabase
            .from('users')
            .select('id, email, role, emailVerified, createdAt, updatedAt')
            .eq('id', user.id)
            .single();
        if (profileError || !userProfile) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        res.json({
            success: true,
            data: userProfile
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
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        const { error } = await supabase_1.supabase.auth.admin.signOut(token);
        if (error) {
            console.error('Logout error:', error);
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.logout = logout;
