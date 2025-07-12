"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const router = (0, express_1.Router)();
// Register user
router.post('/register', [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('location').optional().trim(),
    (0, express_validator_1.body)('availability').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, location, availability } = req.body;
        const db = (0, init_1.getDb)();
        // Check if user already exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userId = (0, uuid_1.v4)();
        // Create user
        await db.run('INSERT INTO users (id, name, email, password, location, availability) VALUES (?, ?, ?, ?, ?, ?)', [userId, name, email, hashedPassword, location, availability]);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId, email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                name,
                email,
                location,
                availability
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Login user
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const db = (0, init_1.getDb)();
        // Find user
        const user = await db.get('SELECT id, name, email, password, location, availability, is_admin, is_banned FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (user.is_banned) {
            return res.status(403).json({ message: 'Account is banned' });
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                location: user.location,
                availability: user.availability,
                isAdmin: Boolean(user.is_admin)
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const db = (0, init_1.getDb)();
        const user = await db.get('SELECT id, name, email, location, availability, is_admin, is_banned FROM users WHERE id = ?', [decoded.userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.is_banned) {
            return res.status(403).json({ message: 'Account is banned' });
        }
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                location: user.location,
                availability: user.availability,
                isAdmin: Boolean(user.is_admin)
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map