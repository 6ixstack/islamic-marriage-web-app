"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfile = exports.updateProfile = exports.getUserProfile = exports.getProfile = exports.getProfiles = exports.createProfile = void 0;
const zod_1 = require("zod");
const supabase_1 = require("../utils/supabase");
const profileSchema = zod_1.z.object({
    // Basic Info
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    gender: zod_1.z.enum(['MALE', 'FEMALE']),
    dateOfBirth: zod_1.z.string().min(1, 'Date of birth is required'),
    countryOfBirth: zod_1.z.string().min(1, 'Country of birth is required'),
    height: zod_1.z.string().min(1, 'Height is required'),
    complexion: zod_1.z.enum(['VERY_FAIR', 'FAIR', 'WHEATISH', 'BROWN', 'DARK']),
    // Education
    educationDegree: zod_1.z.string().min(1, 'Education degree is required'),
    educationSubject: zod_1.z.string().min(1, 'Education subject is required'),
    educationYear: zod_1.z.number().min(1980).max(new Date().getFullYear()),
    educationInstitute: zod_1.z.string().min(1, 'Education institute is required'),
    // Profession
    profession: zod_1.z.string().min(1, 'Profession is required'),
    company: zod_1.z.string().optional(),
    // Personal
    maritalStatus: zod_1.z.enum(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED']),
    // Parents Info
    fatherOccupation: zod_1.z.string().min(1, 'Father occupation is required'),
    fatherEducation: zod_1.z.string().optional(),
    motherOccupation: zod_1.z.string().min(1, 'Mother occupation is required'),
    motherEducation: zod_1.z.string().optional(),
    parentsLocation: zod_1.z.string().min(1, 'Parents location is required'),
    // Current Status
    currentResidence: zod_1.z.string().min(1, 'Current residence is required'),
    immigrationStatus: zod_1.z.enum(['CITIZEN', 'PERMANENT_RESIDENT', 'TEMPORARY_VISA', 'STUDENT_VISA', 'WORK_VISA', 'OTHER']),
    immigrationDetails: zod_1.z.string().optional(),
    // Preferences
    willingToRelocate: zod_1.z.boolean(),
    willingToLiveWithInLaws: zod_1.z.boolean(),
    // Religious Practice
    religiousPractice: zod_1.z.enum(['VERY_PRACTICING', 'PRACTICING', 'MODERATE', 'BASIC']),
    praysFiveTimeDaily: zod_1.z.boolean(),
    attendsMosqueRegularly: zod_1.z.boolean(),
    halaalEarning: zod_1.z.boolean(),
    halaalFood: zod_1.z.boolean(),
    // Lifestyle
    drinksAlcohol: zod_1.z.boolean(),
    smokes: zod_1.z.boolean(),
    hobbies: zod_1.z.string().optional(),
    // Pets
    hasPets: zod_1.z.boolean(),
    petDetails: zod_1.z.string().optional(),
    // Spouse Preferences
    spouseAgeRangeMin: zod_1.z.number().min(18).max(65),
    spouseAgeRangeMax: zod_1.z.number().min(18).max(65),
    spouseEducation: zod_1.z.string().optional(),
    spouseCitizenship: zod_1.z.string().optional(),
    spouseMinHeight: zod_1.z.string().optional(),
    // About sections
    aboutYou: zod_1.z.string().min(50, 'Please write at least 50 characters about yourself'),
    aboutSpouse: zod_1.z.string().min(50, 'Please write at least 50 characters about your ideal spouse'),
    // Consent and terms
    hasParentConsent: zod_1.z.boolean().refine(val => val === true, 'Parent consent is required'),
    agreedToTerms: zod_1.z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
});
const createProfile = async (req, res) => {
    try {
        const validatedData = profileSchema.parse(req.body);
        // Get user from auth middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        // Check if user already has a profile
        const { data: existingProfile } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('submittedById', userId)
            .single();
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                error: 'User already has a profile'
            });
        }
        // Create profile
        const { data: profile, error } = await supabase_1.supabase
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
            console.error('Profile creation error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create profile'
            });
        }
        res.status(201).json({
            success: true,
            data: profile,
            message: 'Profile created successfully and submitted for review'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Create profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.createProfile = createProfile;
const getProfiles = async (req, res) => {
    try {
        const { data: profiles, error } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('status', 'APPROVED')
            .order('createdAt', { ascending: false });
        if (error) {
            console.error('Get profiles error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch profiles'
            });
        }
        res.json({
            success: true,
            data: profiles
        });
    }
    catch (error) {
        console.error('Get profiles error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getProfiles = getProfiles;
const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: profile, error } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .eq('status', 'APPROVED')
            .single();
        if (error || !profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        res.json({
            success: true,
            data: profile
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
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        const { data: profile, error } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('submittedById', userId)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Get user profile error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch profile'
            });
        }
        res.json({
            success: true,
            data: profile || null
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getUserProfile = getUserProfile;
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        const validatedData = profileSchema.parse(req.body);
        // Check if profile belongs to user
        const { data: existingProfile, error: fetchError } = await supabase_1.supabase
            .from('profiles')
            .select('submittedById')
            .eq('id', id)
            .single();
        if (fetchError || !existingProfile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        if (existingProfile.submittedById !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this profile'
            });
        }
        // Update profile
        const { data: profile, error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            data: profile,
            message: 'Profile updated successfully and resubmitted for review'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.updateProfile = updateProfile;
const deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        // Check if profile belongs to user
        const { data: existingProfile, error: fetchError } = await supabase_1.supabase
            .from('profiles')
            .select('submittedById')
            .eq('id', id)
            .single();
        if (fetchError || !existingProfile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        if (existingProfile.submittedById !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this profile'
            });
        }
        // Delete profile (or mark as withdrawn)
        const { error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            message: 'Profile withdrawn successfully'
        });
    }
    catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.deleteProfile = deleteProfile;
