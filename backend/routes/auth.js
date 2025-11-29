import express from 'express';
import { Router } from 'express';
import { Op } from 'sequelize';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { query, body, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const BCRYPT_COST = parseInt(process.env.BCRYPT_COST) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '2h';

router.use(cors());
router.use(express.json());

function signToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

router.post(
	'/register',
	[
		body('username')
			.trim()
			.notEmpty()
			.withMessage('Username is required')
			.isAlphanumeric()
			.withMessage('Username may only contain letters & numbers')
			.isLength({ max: 50 })
			.withMessage('Username may be at most 50 characters'),

		body('email')
			.trim()
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Must be a valid email address')
			.isLength({ max: 150 })
			.withMessage('Email may be at most 150 characters'),

		body('password')
			.notEmpty()
			.withMessage('Password is required')
			.isLength({ min: 8 })
			.withMessage('Password must be at least 8 characters'),

		body('role')
			.isIn(['user', 'admin'])
			.withMessage('Role must be either user or admin'),

		body('avatar_url')
			.optional({ checkFalsy: true })
			.isURL()
			.withMessage('Avatar URL must be a valid URL'),
		validate,
	],
	async (req, res) => {
		const { username, email, password, role, avatar_url } = req.body;

		const duplicate = await User.findOne({
			where: {
				[Op.or]: [{ email }, { username }],
			},
		});

		if (duplicate) {
			// Let the client know exactly what is duplicated
			const conflictField = duplicate.email === email ? 'email' : 'username';
			return res.status(409).json({
				error: {
					message: `A user with that ${conflictField} already exists`,
				},
			});
		}

		const hashedPass = await bcrypt.hash(password, BCRYPT_COST);

		const transaction = await User.sequelize.transaction();
		try {
			const newUser = await User.create(
				{
					username,
					email,
					password_hash: hashedPass,
					role,
					avatar_url: avatar_url || null,
				},
				{ transaction }
			);
			await transaction.commit();

			const token = signToken({
				id: newUser.id,
				email: newUser.email,
				role: newUser.role,
			});

			res.status(201).json({
				success: {
					message: 'New user created!',
					token,
					expire: JWT_EXPIRES_IN,
					user: {
						id: newUser.id,
						username: newUser.username,
						email: newUser.email,
					},
				},
			}); // don't send the user details back for security
		} catch (error) {
			// Log the raw MySQL error (if any)
			await transaction.rollback();
			console.error('Register error:', error);
			if (error.parent) {
				console.error('MySQL error code:', error.parent.errno);
				console.error('MySQL message   :', error.parent.sqlMessage);
			}

			if (error.name === 'SequelizeUniqueConstraintError') {
				return res
					.status(409)
					.json({ error: { message: 'Email or username already taken' } });
			}

			// Handle a "data too long" scenario
			if (error.parent && error.parent.errno === 1406) {
				return res.status(400).json({
					error: {
						message: 'One of the fields is too long for the database column.',
					},
				});
			}

			return res
				.status(500)
				.json({ error: { message: 'Internal server error' } });
		}
	}
);

export default router;
