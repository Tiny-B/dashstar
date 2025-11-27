import 'dotenv/config';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '2h';

function signToken(user) {
	return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function isStrongPassword(pwd) {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
}

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
	return next();
};

router.post(
	'/register',
	[
		body('username').trim().notEmpty(),
		body('name').trim().notEmpty(),
		body('email').isEmail(),
		body('password').custom(val => isStrongPassword(val)),
	],
	validate,
	async (req, res) => {
		const { username, name, email, password } = req.body;
	try {
		const existing = await User.findOne({ where: { email } });
		if (existing) return res.status(409).json({ message: 'Email already in use' });

		const password_hash = await bcrypt.hash(password, 10);
		const user = await User.create({ username, name, email, password_hash, role: 'user' });
		const token = signToken(user);
		return res.status(201).json({ token, expiresIn: JWT_EXPIRES_IN, user: { id: user.id, username, email } });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Registration failed' });
	}
	}
);

router.post(
	'/login',
	[body('email').isEmail(), body('password').notEmpty()],
	validate,
	async (req, res) => {
		const { email, password } = req.body;
	try {
		const user = await User.findOne({ where: { email } });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken(user);
		return res.json({ token, expiresIn: JWT_EXPIRES_IN, user: { id: user.id, username: user.username, email } });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Login failed' });
	}
	}
);

router.post('/change-password', authenticate, async (req, res) => {
	const { currentPassword, newPassword } = req.body;
	if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
	if (!isStrongPassword(newPassword)) {
		return res.status(400).json({ message: 'Password must be at least 8 characters with upper, lower, and number' });
	}
	try {
		const user = await User.findByPk(req.user.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		const valid = await bcrypt.compare(currentPassword, user.password_hash);
		if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
		const password_hash = await bcrypt.hash(newPassword, 10);
		await user.update({ password_hash });
		return res.json({ message: 'Password updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Password change failed' });
	}
});

export default router;
