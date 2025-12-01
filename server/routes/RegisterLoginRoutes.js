import express from 'express';
import { Router } from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
	User,
	Workspace,
	UserWorkspace,
	Team,
	TeamMember,
	Task,
} from '../models/indexModel.js';
import { uniqueWorkspaceCode } from '../scripts/util.js';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const BCRYPT_COST = parseInt(process.env.BCRYPT_COST, 10) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '6h';
const ACCESS_TTL = parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 21600;
const IS_PROD = process.env.NODE_ENV === 'production';

const cookieOptions = {
	httpOnly: true,
	secure: IS_PROD,
	sameSite: IS_PROD ? 'none' : 'lax',
	path: '/',
};

router.use(express.json());

function signToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	return next();
};

router.get('/me', (req, res) => {
	const token = req.cookies?.token;
	if (!token) {
		return res.status(401).json({ error: { message: 'Not authenticated' } });
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		User.findByPk(payload.id, {
			attributes: [
				'id',
				'username',
				'email',
				'role',
				'level',
				'xp',
				'numTasksCompleted',
				'theme',
				'avatar_url',
			],
		})
			.then(user => {
				if (!user) throw new Error('User not found');
				return res.json({ data: { user } });
			})
			.catch(err => {
				console.error('User lookup failed', err);
				return res.status(500).json({ error: { message: 'Server error' } });
			});
	} catch (err) {
		console.error('Token verification failed', err);
		return res.status(401).json({ error: { message: 'Invalid token' } });
	}
});

router.post('/logout', (req, res) => {
	res.clearCookie('token', cookieOptions);
	return res.json({ data: { message: 'Logged out' } });
});

// =========================== Register ============================
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
			where: { [Op.or]: [{ email }, { username }] },
		});
		if (duplicate) {
			const conflictField = duplicate.email === email ? 'email' : 'username';
			return res.status(409).json({
				error: { message: `A user with that ${conflictField} already exists` },
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

			const defaultWorkspace = await Workspace.create(
				{
					code: uniqueWorkspaceCode(25),
					admin_user_id: newUser.id,
				},
				{ transaction }
			);

			await UserWorkspace.create(
				{
					user_id: newUser.id,
					workspace_id: defaultWorkspace.id,
					role: 'admin',
				},
				{ transaction }
			);

			const defaultTeam = await Team.create(
				{
					workspace_id: defaultWorkspace.id,
					name: 'personal',
					admin_user_id: newUser.id,
				},
				{ transaction }
			);

			await TeamMember.create(
				{
					team_id: defaultTeam.id,
					user_id: newUser.id,
				},
				{ transaction }
			);

			await Task.create(
				{
					team_id: defaultTeam.id,
					created_by_user_id: newUser.id,
					task_name: 'Getting started',
					task_desc: 'This is a sample task to get you going.',
					status: 'open',
					task_xp: 10,
				},
				{ transaction }
			);

			await transaction.commit();

			const token = signToken({
				id: newUser.id,
				username: newUser.username,
				email: newUser.email,
				role: newUser.role,
				level: newUser.level,
				xp: newUser.xp,
				numTasks: newUser.numTasksCompleted,
				theme: newUser.theme,
				avatar_url: newUser.avatar_url,
			});

			res.cookie('token', token, {
				...cookieOptions,
				maxAge: ACCESS_TTL * 1000,
			});

			return res.status(201).json({
				data: {
					message: 'New user created!',
					expire: ACCESS_TTL,
					user: {
						id: newUser.id,
						username: newUser.username,
						email: newUser.email,
						role: newUser.role,
						level: newUser.level,
						xp: newUser.xp,
						numTasks: newUser.numTasksCompleted,
						theme: newUser.theme,
						avatar_url: newUser.avatar_url,
					},
				},
			});
		} catch (error) {
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

//=============================== Login =====================================
router.post(
	'/login',
	[
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
	],
	async (req, res) => {
		const { email, password } = req.body;

		try {
			const user = await User.findOne({ where: { email } });
			if (!user) {
				return res
					.status(401)
					.json({ error: { message: 'No user with that email address' } });
			}

			const passwordMatch = await bcrypt.compare(password, user.password_hash);
			if (!passwordMatch) {
				return res
					.status(401)
					.json({ error: { message: 'Incorrect password' } });
			}

			const token = signToken({
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
				level: user.level,
				xp: user.xp,
				numTasks: user.numTasksCompleted,
				theme: user.theme,
				avatar_url: user.avatar_url,
			});

			res.clearCookie('token');

			res.cookie('token', token, {
				...cookieOptions,
				maxAge: ACCESS_TTL * 1000,
			});

			return res.status(200).json({
				data: {
					message: 'Login successful',
					expiresIn: ACCESS_TTL,
					user: {
						id: user.id,
						username: user.username,
						email: user.email,
						role: user.role,
						level: user.level,
						xp: user.xp,
						numTasks: user.numTasksCompleted,
						theme: user.theme,
						avatar_url: user.avatar_url,
					},
				},
			});
		} catch (error) {
			console.error('Login error:', error);
			if (error.parent) {
				console.error('MySQL error code:', error.parent.errno);
				console.error('MySQL message   :', error.parent.sqlMessage);
			}

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
