"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireParentOrAdmin = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const supabase_1 = require("../utils/supabase");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }
    try {
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase_1.supabase
            .from('users')
            .select('id, email, role')
            .eq('id', user.id)
            .single();
        if (profileError || !userProfile) {
            return res.status(403).json({ success: false, error: 'User profile not found' });
        }
        req.user = {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['ADMIN']);
exports.requireParentOrAdmin = (0, exports.requireRole)(['ADMIN', 'PARENT_RELATIVE']);
