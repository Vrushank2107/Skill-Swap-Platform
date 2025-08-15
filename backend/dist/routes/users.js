"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Get user profile
router.get('/profile/:userId?', async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.user?.id;
        const db = (0, init_1.getDb)();
        const user = await db.get(`
      SELECT id, name, location, photo, availability, is_public, created_at
      FROM users 
      WHERE id = ? AND is_banned = 0
    `, [targetUserId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if profile is private and user is not the owner
        if (!user.is_public && targetUserId !== req.user?.id) {
            return res.status(403).json({ message: 'Profile is private' });
        }
        // Get user's skills
        const skills = await db.all(`
      SELECT id, skill_name, type, description, approved
      FROM skills 
      WHERE user_id = ? AND approved = 1
      ORDER BY type, skill_name
    `, [targetUserId]);
        const offeredSkills = skills.filter(skill => skill.type === 'offered');
        const wantedSkills = skills.filter(skill => skill.type === 'wanted');
        res.json({
            user: {
                ...user,
                offeredSkills,
                wantedSkills
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update user profile
router.put('/profile', [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('location').optional().trim(),
    (0, express_validator_1.body)('availability').optional().trim(),
    (0, express_validator_1.body)('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, location, availability, isPublic } = req.body;
        const userId = req.user?.id;
        const db = (0, init_1.getDb)();
        const updates = [];
        const values = [];
        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (location !== undefined) {
            updates.push('location = ?');
            values.push(location);
        }
        if (availability !== undefined) {
            updates.push('availability = ?');
            values.push(availability);
        }
        if (isPublic !== undefined) {
            updates.push('is_public = ?');
            values.push(isPublic ? 1 : 0);
        }
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        values.push(userId);
        await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Upload profile photo
router.post('/profile/photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const userId = req.user?.id;
        const photoPath = `/uploads/${req.file.filename}`;
        const db = (0, init_1.getDb)();
        await db.run('UPDATE users SET photo = ? WHERE id = ?', [photoPath, userId]);
        res.json({
            message: 'Profile photo uploaded successfully',
            photo: photoPath
        });
    }
    catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Advanced user search
router.get('/search', async (req, res) => {
    try {
        const { skill, location, skillType, page = 1, limit = 20 } = req.query;
        const db = (0, init_1.getDb)();
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let query = `
      SELECT DISTINCT u.id, u.name, u.location, u.photo, u.availability,
             GROUP_CONCAT(CASE WHEN s.type = 'offered' THEN s.skill_name END) as offered_skills,
             GROUP_CONCAT(CASE WHEN s.type = 'wanted' THEN s.skill_name END) as wanted_skills
      FROM users u
      INNER JOIN skills s ON u.id = s.user_id
      WHERE u.is_public = 1 AND u.is_banned = 0 AND s.approved = 1
    `;
        const values = [];
        
        if (skill) {
            query += ' AND s.skill_name LIKE ?';
            values.push(`%${skill}%`);
        }
        
        if (skillType && ['offered', 'wanted'].includes(skillType)) {
            query += ' AND s.type = ?';
            values.push(skillType);
        }
        
        if (location) {
            query += ' AND u.location LIKE ?';
            values.push(`%${location}%`);
        }
        
        query += ' GROUP BY u.id, u.name, u.location, u.photo, u.availability';
        query += ' ORDER BY u.name';
        query += ' LIMIT ? OFFSET ?';
        
        values.push(parseInt(limit), offset);
        
        const users = await db.all(query, values);
        
        // Get total count for pagination
        let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      INNER JOIN skills s ON u.id = s.user_id
      WHERE u.is_public = 1 AND u.is_banned = 0 AND s.approved = 1
    `;
        const countValues = [];
        
        if (skill) {
            countQuery += ' AND s.skill_name LIKE ?';
            countValues.push(`%${skill}%`);
        }
        
        if (skillType && ['offered', 'wanted'].includes(skillType)) {
            countQuery += ' AND s.type = ?';
            countValues.push(skillType);
        }
        
        if (location) {
            countQuery += ' AND u.location LIKE ?';
            countValues.push(`%${location}%`);
        }
        
        const countResult = await db.get(countQuery, countValues);
        const total = countResult.total;
        
        // Process skills for each user
        const processedUsers = users.map(user => ({
            ...user,
            offeredSkills: user.offered_skills ? user.offered_skills.split(',') : [],
            wantedSkills: user.wanted_skills ? user.wanted_skills.split(',') : []
        }));
        
        res.json({ 
            users: processedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get user's swap history
router.get('/swaps', async (req, res) => {
    try {
        const userId = req.user?.id;
        const db = (0, init_1.getDb)();
        const swaps = await db.all(`
      SELECT 
        s.id, s.status, s.created_at, s.updated_at,
        u1.name as requester_name,
        u2.name as responder_name,
        skill1.skill_name as offered_skill,
        skill2.skill_name as wanted_skill
      FROM swaps s
      INNER JOIN users u1 ON s.requester_id = u1.id
      INNER JOIN users u2 ON s.responder_id = u2.id
      INNER JOIN skills skill1 ON s.offered_skill_id = skill1.id
      INNER JOIN skills skill2 ON s.wanted_skill_id = skill2.id
      WHERE s.requester_id = ? OR s.responder_id = ?
      ORDER BY s.created_at DESC
    `, [userId, userId]);
        res.json({ swaps });
    }
    catch (error) {
        console.error('Get swaps error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map