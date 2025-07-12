"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply admin middleware to all routes
router.use(auth_1.requireAdmin);
// Get platform statistics
router.get('/stats', async (req, res) => {
    try {
        const db = (0, init_1.getDb)();
        const [totalUsers, totalSkills, totalSwaps, pendingSwaps, bannedUsers, pendingSkills] = await Promise.all([
            db.get('SELECT COUNT(*) as count FROM users WHERE is_banned = 0'),
            db.get('SELECT COUNT(*) as count FROM skills WHERE approved = 1'),
            db.get('SELECT COUNT(*) as count FROM swaps'),
            db.get('SELECT COUNT(*) as count FROM swaps WHERE status = "pending"'),
            db.get('SELECT COUNT(*) as count FROM users WHERE is_banned = 1'),
            db.get('SELECT COUNT(*) as count FROM skills WHERE approved = 0')
        ]);
        res.json({
            stats: {
                totalUsers: totalUsers.count,
                totalSkills: totalSkills.count,
                totalSwaps: totalSwaps.count,
                pendingSwaps: pendingSwaps.count,
                bannedUsers: bannedUsers.count,
                pendingSkills: pendingSkills.count
            }
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get all users (admin view)
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const db = (0, init_1.getDb)();
        let query = `
      SELECT id, name, email, location, is_admin, is_banned, is_public, created_at,
             (SELECT COUNT(*) FROM skills WHERE user_id = users.id) as skill_count,
             (SELECT COUNT(*) FROM swaps WHERE requester_id = users.id OR responder_id = users.id) as swap_count
      FROM users
    `;
        const values = [];
        if (search) {
            query += ' WHERE name LIKE ? OR email LIKE ?';
            values.push(`%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        values.push(Number(limit), offset);
        const users = await db.all(query, values);
        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM users';
        if (search) {
            countQuery += ' WHERE name LIKE ? OR email LIKE ?';
        }
        const totalCount = await db.get(countQuery, search ? [`%${search}%`, `%${search}%`] : []);
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Ban/unban user
router.put('/users/:userId/ban', [
    (0, express_validator_1.body)('banned').isBoolean().withMessage('Banned must be a boolean'),
    (0, express_validator_1.body)('reason').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { userId } = req.params;
        const { banned, reason } = req.body;
        const adminId = req.user?.id;
        const db = (0, init_1.getDb)();
        // Check if user exists
        const user = await db.get('SELECT id, name FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Prevent admin from banning themselves
        if (userId === adminId) {
            return res.status(400).json({ message: 'Cannot ban yourself' });
        }
        await db.run('UPDATE users SET is_banned = ? WHERE id = ?', [banned ? 1 : 0, userId]);
        // Log admin action
        await db.run('INSERT INTO admin_actions (id, admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), adminId, banned ? 'ban_user' : 'unban_user', userId, reason || '']);
        res.json({
            message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
            user: { id: userId, name: user.name, banned }
        });
    }
    catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Make user admin
router.put('/users/:userId/admin', [
    (0, express_validator_1.body)('isAdmin').isBoolean().withMessage('isAdmin must be a boolean')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { userId } = req.params;
        const { isAdmin } = req.body;
        const adminId = req.user?.id;
        const db = (0, init_1.getDb)();
        // Check if user exists
        const user = await db.get('SELECT id, name FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await db.run('UPDATE users SET is_admin = ? WHERE id = ?', [isAdmin ? 1 : 0, userId]);
        // Log admin action
        await db.run('INSERT INTO admin_actions (id, admin_id, action_type, target_user_id, details) VALUES (?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), adminId, isAdmin ? 'make_admin' : 'remove_admin', userId, '']);
        res.json({
            message: `User ${isAdmin ? 'made admin' : 'removed from admin'} successfully`,
            user: { id: userId, name: user.name, isAdmin }
        });
    }
    catch (error) {
        console.error('Make admin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get all swaps (admin view)
router.get('/swaps', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const db = (0, init_1.getDb)();
        let query = `
      SELECT 
        s.id, s.status, s.created_at, s.updated_at,
        u1.name as requester_name, u1.id as requester_id,
        u2.name as responder_name, u2.id as responder_id,
        skill1.skill_name as offered_skill,
        skill2.skill_name as wanted_skill
      FROM swaps s
      INNER JOIN users u1 ON s.requester_id = u1.id
      INNER JOIN users u2 ON s.responder_id = u2.id
      INNER JOIN skills skill1 ON s.offered_skill_id = skill1.id
      INNER JOIN skills skill2 ON s.wanted_skill_id = skill2.id
    `;
        const values = [];
        if (status) {
            query += ' WHERE s.status = ?';
            values.push(status);
        }
        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        values.push(Number(limit), offset);
        const swaps = await db.all(query, values);
        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM swaps';
        if (status) {
            countQuery += ' WHERE status = ?';
        }
        const totalCount = await db.get(countQuery, status ? [status] : []);
        res.json({
            swaps,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get swaps error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get admin action logs
router.get('/actions', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const db = (0, init_1.getDb)();
        const actions = await db.all(`
      SELECT 
        aa.id, aa.action_type, aa.details, aa.created_at,
        admin.name as admin_name,
        target.name as target_user_name
      FROM admin_actions aa
      INNER JOIN users admin ON aa.admin_id = admin.id
      LEFT JOIN users target ON aa.target_user_id = target.id
      ORDER BY aa.created_at DESC
      LIMIT ? OFFSET ?
    `, [Number(limit), offset]);
        const totalCount = await db.get('SELECT COUNT(*) as count FROM admin_actions');
        res.json({
            actions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get actions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Generate platform report
router.get('/report', async (req, res) => {
    try {
        const db = (0, init_1.getDb)();
        const [userStats, skillStats, swapStats, topSkills, recentSwaps] = await Promise.all([
            // User statistics
            db.get(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_admin = 1 THEN 1 END) as admin_users,
          COUNT(CASE WHEN is_banned = 1 THEN 1 END) as banned_users,
          COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as new_users_30d
        FROM users
      `),
            // Skill statistics
            db.get(`
        SELECT 
          COUNT(*) as total_skills,
          COUNT(CASE WHEN approved = 0 THEN 1 END) as pending_skills,
          COUNT(CASE WHEN type = 'offered' THEN 1 END) as offered_skills,
          COUNT(CASE WHEN type = 'wanted' THEN 1 END) as wanted_skills
        FROM skills
      `),
            // Swap statistics
            db.get(`
        SELECT 
          COUNT(*) as total_swaps,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_swaps,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_swaps,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_swaps,
          COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as new_swaps_30d
        FROM swaps
      `),
            // Top skills
            db.all(`
        SELECT skill_name, COUNT(*) as count
        FROM skills
        WHERE approved = 1
        GROUP BY skill_name
        ORDER BY count DESC
        LIMIT 10
      `),
            // Recent swaps
            db.all(`
        SELECT 
          s.created_at,
          u1.name as requester,
          u2.name as responder,
          skill1.skill_name as offered,
          skill2.skill_name as wanted,
          s.status
        FROM swaps s
        INNER JOIN users u1 ON s.requester_id = u1.id
        INNER JOIN users u2 ON s.responder_id = u2.id
        INNER JOIN skills skill1 ON s.offered_skill_id = skill1.id
        INNER JOIN skills skill2 ON s.wanted_skill_id = skill2.id
        ORDER BY s.created_at DESC
        LIMIT 20
      `)
        ]);
        res.json({
            report: {
                userStats,
                skillStats,
                swapStats,
                topSkills,
                recentSwaps,
                generatedAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map