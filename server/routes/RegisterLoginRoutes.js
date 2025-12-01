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
import { query, body, param, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const BCRYPT_COST = parseInt(process.env.BCRYPT_COST) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '6h';
const ACCESS_TTL = parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 21600;

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
				res.json({ data: { user } });
			})
			.catch(e => {
				console.error('User lookup failed →', e);
				res.status(500).json({ error: { message: 'Server error' } });
			});
	} catch (e) {
		console.error('Token verification failed →', e);
		res.status(401).json({ error: { message: 'Invalid token' } });
	}
});

router.post('/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		path: '/',
	});
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
					role, // might remove this as its redundant
					avatar_url: avatar_url || null,
				},
				{ transaction }
			);

			// create Workspace entry by default with randomized unique code and assign the users id as the admin_user_id
			const defaultWorkspace = await Workspace.create({
				code: uniqueWorkspaceCode(25),
				admin_user_id: newUser.id,
			});

			// add created Workspace to a UserWorkspace entry with the created Workspace id as the workspace_id, add the users id as user_id
			const defaultUserWorkspace = await UserWorkspace.create({
				user_id: newUser.id,
				workspace_id: defaultWorkspace.id,
				role: 'admin',
			});

			// Create default team entry on Teams called *personal* with the created Workspace id as the workspace_id and the admin_user id as the users id
			const defaultTeam = await Team.create({
				workspace_id: defaultUserWorkspace.id,
				name: 'personal',
				admin_user_id: newUser.id,
			});

			// Create a TeamMembers entry with the personal teams id as the team_id and the users id as user_id
			const defaultTeamMembers = await TeamMember.create({
				team_id: defaultTeam.id,
				user_id: newUser.id,
			});

			const sampleTask = await Task.create({});

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
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: ACCESS_TTL * 1000,
				path: '/',
			});

			res.status(201).json({
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
			}); // don't send the user pass back for security
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
			if (!user)
				return res
					.status(401)
					.json({ error: { message: 'No user with that email address' } });

			const password_match = await bcrypt.compare(password, user.password_hash);
			if (!password_match)
				return res
					.status(401)
					.json({ error: { message: 'Incorrect password' } });

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
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: ACCESS_TTL * 1000,
				path: '/',
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

			// if (error.name === 'SequelizeUniqueConstraintError') {
			// 	return res
			// 		.status(409)
			// 		.json({ error: { message: 'Email or username already taken' } });
			// }

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
