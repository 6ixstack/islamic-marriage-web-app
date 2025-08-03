"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminActions = exports.updateUserRole = exports.getAllUsers = exports.getStats = exports.rejectProfile = exports.approveProfile = exports.getPendingProfiles = void 0;
const zod_1 = require("zod");
const supabase_1 = require("../utils/supabase");
const approveProfileSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
const rejectProfileSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Rejection reason is required'),
    notes: zod_1.z.string().optional(),
});
const getPendingProfiles = async (req, res) => {
    try {
        const { data: profiles, error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            data: profiles
        });
    }
    catch (error) {
        console.error('Get pending profiles error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getPendingProfiles = getPendingProfiles;
const approveProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({
                success: false,
                error: 'Admin authentication required'
            });
        }
        const validatedData = approveProfileSchema.parse(req.body);
        // Check if profile exists and is pending
        const { data: profile, error: fetchError } = await supabase_1.supabase
            .from('profiles')
            .select('id, status, submittedById')
            .eq('id', id)
            .single();
        if (fetchError || !profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        if (profile.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: 'Profile is not pending approval'
            });
        }
        // Update profile status
        const { data: updatedProfile, error: updateError } = await supabase_1.supabase
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
            });
        }
        // Log admin action
        const { error: logError } = await supabase_1.supabase
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
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Approve profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.approveProfile = approveProfile;
const rejectProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({
                success: false,
                error: 'Admin authentication required'
            });
        }
        const validatedData = rejectProfileSchema.parse(req.body);
        // Check if profile exists and is pending
        const { data: profile, error: fetchError } = await supabase_1.supabase
            .from('profiles')
            .select('id, status, submittedById')
            .eq('id', id)
            .single();
        if (fetchError || !profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }
        if (profile.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: 'Profile is not pending approval'
            });
        }
        // Update profile status
        const { data: updatedProfile, error: updateError } = await supabase_1.supabase
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
            });
        }
        // Log admin action
        const { error: logError } = await supabase_1.supabase
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
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Validation error'
            });
        }
        console.error('Reject profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.rejectProfile = rejectProfile;
const getStats = async (req, res) => {
    try {
        // Get all counts in parallel
        const [{ count: totalUsers }, { count: totalProfiles }, { count: pendingProfiles }, { count: approvedProfiles }, { count: rejectedProfiles }, { count: activeInterests }] = await Promise.all([
            supabase_1.supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
            supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
            supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
            supabase_1.supabase.from('interests').select('*', { count: 'exact', head: true }).eq('isActive', true)
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
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getStats = getStats;
const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase_1.supabase
            .from('users')
            .select('id, email, role, emailVerified, createdAt, updatedAt')
            .order('createdAt', { ascending: false });
        if (error) {
            console.error('Get users error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch users'
            });
        }
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({
                success: false,
                error: 'Admin authentication required'
            });
        }
        if (!['ADMIN', 'PARENT_RELATIVE'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role'
            });
        }
        // Update user role
        const { data: updatedUser, error } = await supabase_1.supabase
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
            });
        }
        // Log admin action
        const { error: logError } = await supabase_1.supabase
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
        });
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.updateUserRole = updateUserRole;
const getAdminActions = async (req, res) => {
    try {
        const { data: actions, error } = await supabase_1.supabase
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
            });
        }
        res.json({
            success: true,
            data: actions
        });
    }
    catch (error) {
        console.error('Get admin actions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getAdminActions = getAdminActions;
