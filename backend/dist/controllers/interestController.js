"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMutualInterests = exports.getInterestsInMyProfile = exports.getMyInterests = exports.withdrawInterest = exports.expressInterest = void 0;
const zod_1 = require("zod");
const supabase_1 = require("../utils/supabase");
const expressInterestSchema = zod_1.z.object({
    profileId: zod_1.z.string().uuid('Invalid profile ID'),
    notes: zod_1.z.string().optional(),
});
const expressInterest = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        const validatedData = expressInterestSchema.parse(req.body);
        // Check if profile exists and is approved
        const { data: profile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('id, submittedById, status')
            .eq('id', validatedData.profileId)
            .eq('status', 'APPROVED')
            .single();
        if (profileError || !profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found or not approved'
            });
        }
        // Check if user is trying to express interest in their own profile
        if (profile.submittedById === userId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot express interest in your own profile'
            });
        }
        // Check if interest already exists
        const { data: existingInterest } = await supabase_1.supabase
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
            });
        }
        // Create interest record
        const { data: interest, error } = await supabase_1.supabase
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
            });
        }
        res.status(201).json({
            success: true,
            data: interest,
            message: 'Interest expressed successfully'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Express interest error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.expressInterest = expressInterest;
const withdrawInterest = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        const { id } = req.params;
        // Check if interest exists and belongs to user
        const { data: interest, error: fetchError } = await supabase_1.supabase
            .from('interests')
            .select('interestedUserId')
            .eq('id', id)
            .single();
        if (fetchError || !interest) {
            return res.status(404).json({
                success: false,
                error: 'Interest not found'
            });
        }
        if (interest.interestedUserId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to withdraw this interest'
            });
        }
        // Mark interest as inactive instead of deleting
        const { error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            message: 'Interest withdrawn successfully'
        });
    }
    catch (error) {
        console.error('Withdraw interest error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.withdrawInterest = withdrawInterest;
const getMyInterests = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        // Get interests expressed by the user
        const { data: interests, error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            data: interests
        });
    }
    catch (error) {
        console.error('Get my interests error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getMyInterests = getMyInterests;
const getInterestsInMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        // First get the user's profile
        const { data: userProfile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('submittedById', userId)
            .eq('status', 'APPROVED')
            .single();
        if (profileError || !userProfile) {
            return res.status(404).json({
                success: false,
                error: 'No approved profile found'
            });
        }
        // Get interests in the user's profile
        const { data: interests, error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            data: interests
        });
    }
    catch (error) {
        console.error('Get interests in my profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getInterestsInMyProfile = getInterestsInMyProfile;
const getMutualInterests = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        // Get user's profile
        const { data: userProfile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('submittedById', userId)
            .eq('status', 'APPROVED')
            .single();
        if (profileError || !userProfile) {
            return res.status(404).json({
                success: false,
                error: 'No approved profile found'
            });
        }
        // Complex query to find mutual interests
        // This finds cases where:
        // 1. User A expressed interest in User B's profile
        // 2. User B expressed interest in User A's profile
        const { data: mutualInterests, error } = await supabase_1.supabase
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
            });
        }
        // Filter for actual mutual interests
        const mutualMatches = [];
        if (mutualInterests) {
            for (const interest of mutualInterests) {
                // Check if the target profile owner has also expressed interest in our profile
                const { data: reverseInterest } = await supabase_1.supabase
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
        });
    }
    catch (error) {
        console.error('Get mutual interests error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getMutualInterests = getMutualInterests;
