"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const router = (0, express_1.Router)();
// Get all skills (public endpoint)
router.get('/', async (req, res) => {
    try {
        const { type, skill } = req.query;
        const db = (0, init_1.getDb)();
        let query = `
      SELECT s.id, s.skill_name, s.type, s.description, s.approved, s.created_at,
             u.id as user_id, u.name as user_name, u.location, u.photo
      FROM skills s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.approved = 1 AND u.is_public = 1 AND u.is_banned = 0
    `;
        const values = [];
        if (type) {
            query += ' AND s.type = ?';
            values.push(type);
        }
        if (skill) {
            query += ' AND s.skill_name LIKE ?';
            values.push(`%${skill}%`);
        }
        query += ' ORDER BY s.skill_name';
        const skills = await db.all(query, values);
        res.json({ skills });
    }
    catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get user's skills (authenticated)
router.get('/my-skills', async (req, res) => {
    try {
        const userId = req.user?.id;
        const db = (0, init_1.getDb)();
        const skills = await db.all(`
      SELECT id, skill_name, type, description, approved, created_at
      FROM skills 
      WHERE user_id = ?
      ORDER BY type, skill_name
    `, [userId]);
        const offeredSkills = skills.filter(skill => skill.type === 'offered');
        const wantedSkills = skills.filter(skill => skill.type === 'wanted');
        res.json({
            offeredSkills,
            wantedSkills
        });
    }
    catch (error) {
        console.error('Get my skills error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Add a skill
router.post('/', [
    (0, express_validator_1.body)('skillName').trim().isLength({ min: 2 }).withMessage('Skill name must be at least 2 characters'),
    (0, express_validator_1.body)('type').isIn(['offered', 'wanted']).withMessage('Type must be either "offered" or "wanted"'),
    (0, express_validator_1.body)('description').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { skillName, type, description } = req.body;
        const userId = req.user?.id;
        const skillId = (0, uuid_1.v4)();
        const db = (0, init_1.getDb)();
        // Check if user already has this skill
        const existingSkill = await db.get('SELECT id FROM skills WHERE user_id = ? AND skill_name = ? AND type = ?', [userId, skillName, type]);
        if (existingSkill) {
            return res.status(400).json({ message: 'You already have this skill listed' });
        }
        await db.run('INSERT INTO skills (id, user_id, skill_name, type, description) VALUES (?, ?, ?, ?, ?)', [skillId, userId, skillName, type, description]);
        res.status(201).json({
            message: 'Skill added successfully',
            skill: {
                id: skillId,
                skillName,
                type,
                description
            }
        });
    }
    catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update a skill
router.put('/:skillId', [
    (0, express_validator_1.body)('skillName').optional().trim().isLength({ min: 2 }).withMessage('Skill name must be at least 2 characters'),
    (0, express_validator_1.body)('description').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { skillId } = req.params;
        const { skillName, description } = req.body;
        const userId = req.user?.id;
        const db = (0, init_1.getDb)();
        // Check if skill belongs to user
        const skill = await db.get('SELECT id FROM skills WHERE id = ? AND user_id = ?', [skillId, userId]);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        const updates = [];
        const values = [];
        if (skillName !== undefined) {
            updates.push('skill_name = ?');
            values.push(skillName);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        values.push(skillId, userId);
        await db.run(`UPDATE skills SET ${updates.join(', ')}, approved = 0 WHERE id = ? AND user_id = ?`, values);
        res.json({ message: 'Skill updated successfully' });
    }
    catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete a skill
router.delete('/:skillId', async (req, res) => {
    try {
        const { skillId } = req.params;
        const userId = req.user?.id;
        const db = (0, init_1.getDb)();
        // Check if skill belongs to user
        const skill = await db.get('SELECT id FROM skills WHERE id = ? AND user_id = ?', [skillId, userId]);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        await db.run('DELETE FROM skills WHERE id = ? AND user_id = ?', [skillId, userId]);
        res.json({ message: 'Skill deleted successfully' });
    }
    catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Admin: Get pending skills for approval
router.get('/admin/pending', async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const db = (0, init_1.getDb)();
        const skills = await db.all(`
      SELECT s.id, s.skill_name, s.type, s.description, s.created_at,
             u.id as user_id, u.name as user_name, u.email
      FROM skills s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.approved = 0
      ORDER BY s.created_at DESC
    `);
        res.json({ skills });
    }
    catch (error) {
        console.error('Get pending skills error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Admin: Approve/reject skill
router.put('/admin/:skillId/approve', [
    (0, express_validator_1.body)('approved').isBoolean().withMessage('Approved must be a boolean')
], async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { skillId } = req.params;
        const { approved } = req.body;
        const db = (0, init_1.getDb)();
        await db.run('UPDATE skills SET approved = ? WHERE id = ?', [approved ? 1 : 0, skillId]);
        res.json({ message: `Skill ${approved ? 'approved' : 'rejected'} successfully` });
    }
    catch (error) {
        console.error('Approve skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=skills.js.map