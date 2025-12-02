import { Router } from 'express';
import {
	Task,
	TeamMember,
	Team,
	Workspace,
	User,
	TaskCollaborator,
	UserWorkspace,
	Achievement,
	UserAchievement,
} from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const ALLOWED_STATUS = ['open', 'inprogress', 'complete', 'archived'];
const ALLOWED_DIFFICULTY = ['easy', 'medium', 'hard', 'insane'];
const XP_BY_DIFFICULTY = {
	easy: 10,
	medium: 25,
	hard: 50,
	insane: 100,
};

function xpRequiredForLevel(level) {
	return 100 + (level - 1) * 50;
}

const ACHIEVEMENTS = [
	{
		code: 'task_1',
		name: 'Getting Started',
		description: 'Complete your first task.',
		check: user => user.numTasksCompleted >= 1,
	},
	{
		code: 'task_10',
		name: 'Task Streak',
		description: 'Complete 10 tasks.',
		check: user => user.numTasksCompleted >= 10,
	},
	{
		code: 'task_25',
		name: 'Quarter Century',
		description: 'Complete 25 tasks.',
		check: user => user.numTasksCompleted >= 25,
	},
	{
		code: 'level_10',
		name: 'Level 10',
		description: 'Reach level 10.',
		check: user => user.level >= 10,
	},
	{
		code: 'level_20',
		name: 'Level 20',
		description: 'Reach level 20.',
		check: user => user.level >= 20,
	},
	{
		code: 'level_30',
		name: 'Level 30',
		description: 'Reach level 30.',
		check: user => user.level >= 30,
	},
];

async function awardAchievements(user) {
	const awarded = [];
	for (const def of ACHIEVEMENTS) {
		if (!def.check(user)) continue;
		const [ach] = await Achievement.findOrCreate({
			where: { code: def.code },
			defaults: {
				code: def.code,
				name: def.name,
				description: def.description,
			},
		});
		const [userAch, created] = await UserAchievement.findOrCreate({
			where: { user_id: user.id, achievement_id: ach.id },
			defaults: { user_id: user.id, achievement_id: ach.id },
		});
		if (created) {
			awarded.push({
				code: ach.code,
				name: ach.name,
				description: ach.description,
			});
		}
	}
	return awarded;
}

async function applyXpAndCompletion(userId, xpAmount) {
	const user = await User.findByPk(userId);
	if (!user) return null;
	let xp = user.xp + xpAmount;
	let level = user.level;
	let threshold = xpRequiredForLevel(level);
	while (xp >= threshold) {
		xp -= threshold;
		level += 1;
		threshold = xpRequiredForLevel(level);
	}
	await user.update({
		xp,
		level,
		numTasksCompleted: user.numTasksCompleted + 1,
	});
	const achievements = await awardAchievements({
		...user.toJSON(),
		xp,
		level,
		numTasksCompleted: user.numTasksCompleted + 1,
	});
	return {
		user: {
			id: user.id,
			username: user.username,
			xp,
			level,
			numTasksCompleted: user.numTasksCompleted + 1,
			email: user.email,
			role: user.role,
			full_name: user.full_name,
			phone: user.phone,
			country: user.country,
			city: user.city,
			timezone: user.timezone,
			theme: user.theme,
			avatar_url: user.avatar_url,
		},
		achievements,
	};
}

async function ensureTeamMember(userId, teamId) {
	const membership = await TeamMember.findOne({
		where: { user_id: userId, team_id: teamId },
	});
	return membership;
}

async function ensureTeamAdmin(userId, teamId) {
	const team = await Team.findByPk(teamId);
	if (!team) return false;
	if (team.admin_user_id === userId) return true;
	const wsAdmin = await UserWorkspace.findOne({
		where: { user_id: userId, workspace_id: team.workspace_id, role: 'admin' },
	});
	return !!wsAdmin;
}

function isTaskAdmin(userId, task, teamAdmin) {
	if (!task) return false;
	if (task.created_by_user_id === userId) return true;
	if (teamAdmin) return true;
	return false;
}

router.get('/tasks/my', authenticate, async (req, res) => {
	try {
		const memberships = await TeamMember.findAll({
			where: { user_id: req.user.id },
			attributes: ['team_id'],
			include: [{ model: Team, attributes: ['workspace_id'] }],
		});
		const teamIds = memberships.map(m => m.team_id);
		if (teamIds.length === 0) return res.json([]);

		const where = { team_id: teamIds };
		if (req.query.status && ALLOWED_STATUS.includes(req.query.status)) {
			where.status = req.query.status;
		}

		const tasks = await Task.findAll({ where, order: [['createdAt', 'ASC']] });
		return res.json(tasks);
	} catch (err) {
		console.error('Fetch tasks failed', err);
		return res.status(500).json({ message: 'Fetch tasks failed' });
	}
});

router.get('/teams/my', authenticate, async (req, res) => {
	try {
		const memberships = await TeamMember.findAll({
			where: { user_id: req.user.id },
			include: [{ model: Team, attributes: ['id', 'name', 'workspace_id'] }],
		});
		const teams = memberships
			.map(m => m.Team)
			.filter(Boolean)
			.map(t => ({ id: t.id, name: t.name, workspace_id: t.workspace_id }));
		return res.json(teams);
	} catch (err) {
		console.error('Fetch user teams failed', err);
		return res.status(500).json({ message: 'Fetch teams failed' });
	}
});

router.get('/tasks/:taskId/collaborators', authenticate, async (req, res) => {
	const { taskId } = req.params;
	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task not found' });
		const membership = await ensureTeamMember(req.user.id, task.team_id);
		if (!membership)
			return res.status(403).json({ message: 'Not authorized for this task' });
		const teamAdmin = await ensureTeamAdmin(req.user.id, task.team_id);
		if (!isTaskAdmin(req.user.id, task, teamAdmin)) {
			return res
				.status(403)
				.json({ message: 'Only admins or task creator can change status.' });
		}

		const collaborators = await TaskCollaborator.findAll({
			where: { task_id: taskId },
			include: [{ model: User, as: 'collaborator', attributes: ['id', 'username', 'email', 'avatar_url'] }],
			order: [['createdAt', 'ASC']],
		});
		return res.json(
			collaborators.map(c => ({
				task_id: c.task_id,
				user_id: c.user_id,
				status: c.status,
				role: c.role,
				invited_by_user_id: c.invited_by_user_id,
				user: c.collaborator,
			}))
		);
	} catch (err) {
		console.error('Fetch collaborators failed', err);
		return res.status(500).json({ message: 'Failed to load collaborators' });
	}
});

router.post('/tasks/:taskId/collaborators', authenticate, async (req, res) => {
	const { taskId } = req.params;
	const { user_id, role = 'participant', status = 'invited' } = req.body;
	if (!user_id) return res.status(400).json({ message: 'user_id required' });
	if (!['participant', 'admin'].includes(role))
		return res.status(400).json({ message: 'Invalid role' });
	if (!['invited', 'accepted', 'declined'].includes(status))
		return res.status(400).json({ message: 'Invalid status' });

	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task not found' });
		const isMember = await ensureTeamMember(req.user.id, task.team_id);
		if (!isMember) return res.status(403).json({ message: 'Not authorized for this task' });
		const isAdmin = await ensureTeamAdmin(req.user.id, task.team_id) || task.created_by_user_id === req.user.id;
		if (!isAdmin) return res.status(403).json({ message: 'Admin or creator required' });

		const targetMember = await ensureTeamMember(user_id, task.team_id);
		if (!targetMember) return res.status(400).json({ message: 'User is not in this team' });

		const [collab] = await TaskCollaborator.findOrCreate({
			where: { task_id: taskId, user_id },
			defaults: {
				task_id: taskId,
				user_id,
				role,
				status,
				invited_by_user_id: req.user.id,
			},
		});

		if (collab.role !== role || collab.status !== status) {
			await collab.update({ role, status });
		}

		return res.status(201).json(collab);
	} catch (err) {
		console.error('Add collaborator failed', err);
		return res.status(500).json({ message: 'Failed to add collaborator' });
	}
});

router.patch('/tasks/:taskId/collaborators/:userId', authenticate, async (req, res) => {
	const { taskId, userId } = req.params;
	const { status } = req.body;
	if (!['invited', 'accepted', 'declined'].includes(status))
		return res.status(400).json({ message: 'Invalid status' });
	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task not found' });
		const membership = await ensureTeamMember(req.user.id, task.team_id);
		if (!membership)
			return res.status(403).json({ message: 'Not authorized for this task' });

		const collab = await TaskCollaborator.findOne({
			where: { task_id: taskId, user_id: userId },
		});
		if (!collab) return res.status(404).json({ message: 'Collaborator not found' });

		const isAdmin = await ensureTeamAdmin(req.user.id, task.team_id) || task.created_by_user_id === req.user.id;
		if (!isAdmin && Number(userId) !== req.user.id) {
			return res.status(403).json({ message: 'Only admins or the collaborator can update status' });
		}

		await collab.update({ status });
		return res.json(collab);
	} catch (err) {
		console.error('Update collaborator failed', err);
		return res.status(500).json({ message: 'Failed to update collaborator' });
	}
});

router.delete('/tasks/:taskId/collaborators/:userId', authenticate, async (req, res) => {
	const { taskId, userId } = req.params;
	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task not found' });
		const membership = await ensureTeamMember(req.user.id, task.team_id);
		if (!membership)
			return res.status(403).json({ message: 'Not authorized for this task' });

		const isAdmin = await ensureTeamAdmin(req.user.id, task.team_id) || task.created_by_user_id === req.user.id;
		if (!isAdmin && Number(userId) !== req.user.id) {
			return res.status(403).json({ message: 'Only admins or the collaborator can remove' });
		}

		await TaskCollaborator.destroy({ where: { task_id: taskId, user_id: userId } });
		return res.json({ message: 'Removed' });
	} catch (err) {
		console.error('Remove collaborator failed', err);
		return res.status(500).json({ message: 'Failed to remove collaborator' });
	}
});

router.post('/tasks', authenticate, async (req, res) => {
	const {
		team_id,
		task_name,
		task_desc = null,
		status = 'open',
		difficulty = 'easy',
	} = req.body;

	if (!team_id || !task_name) {
		return res
			.status(400)
			.json({ message: 'team_id and task_name are required' });
	}
	if (!ALLOWED_STATUS.includes(status)) {
		return res.status(400).json({ message: 'Invalid status' });
	}
	if (!ALLOWED_DIFFICULTY.includes(difficulty)) {
		return res.status(400).json({ message: 'Invalid difficulty' });
	}

	try {
		const team = await Team.findByPk(team_id);
		if (!team) return res.status(404).json({ message: 'Team not found' });

		const isMember = await ensureTeamMember(req.user.id, team_id);
		const isAdmin = await ensureTeamAdmin(req.user.id, team_id);
		if (!isMember || !isAdmin)
			return res.status(403).json({ message: 'Only team/workspace admins can create tasks' });

		const task = await Task.create({
			team_id,
			task_name,
			task_desc,
			status,
			difficulty,
			task_xp: XP_BY_DIFFICULTY[difficulty],
			created_by_user_id: req.user.id,
		});

		return res.status(201).json(task);
	} catch (err) {
		console.error('Create task failed', err);
		return res.status(500).json({ message: 'Create task failed' });
	}
});

router.patch('/tasks/:taskId/status', authenticate, async (req, res) => {
	const { taskId } = req.params;
	const { status } = req.body;
	if (!ALLOWED_STATUS.includes(status)) {
		return res.status(400).json({ message: 'Please choose a valid status.' });
	}

	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task could not be found.' });

		const membership = await ensureTeamMember(req.user.id, task.team_id);
		if (!membership)
			return res
				.status(403)
				.json({ message: 'You are not allowed to update this task.' });

		const prevStatus = task.status;
		const updateData = { status };
		if (status === 'inprogress') {
			updateData.assigned_to_user_id = req.user.id;
			updateData.assigned_to_username = req.user.username;
			updateData.completed_by_user_id = null;
			updateData.completed_by_username = null;
		}
		if (status === 'complete') {
			if (!task.assigned_to_user_id) {
				updateData.assigned_to_user_id = req.user.id;
				updateData.assigned_to_username = req.user.username;
			}
			updateData.completed_by_user_id = req.user.id;
			updateData.completed_by_username = req.user.username;
		}

		await task.update(updateData);
		await task.reload();

		await TaskCollaborator.findOrCreate({
			where: { task_id: task.id, user_id: req.user.id },
			defaults: {
				task_id: task.id,
				user_id: req.user.id,
				status: 'accepted',
				role: 'participant',
				invited_by_user_id: req.user.id,
			},
		});

		let updatedUser = null;
		let achievements = [];
		if (prevStatus !== 'complete' && status === 'complete') {
			const result = await applyXpAndCompletion(
				req.user.id,
				task.task_xp || XP_BY_DIFFICULTY[task.difficulty] || 0
			);
			updatedUser = result?.user || null;
			achievements = result?.achievements || [];
		}

		return res.json({ task, user: updatedUser, achievements });
	} catch (err) {
		console.error('Update task status failed', err);
		return res.status(500).json({ message: 'We could not update the task right now.' });
	}
});

router.patch('/tasks/:taskId', authenticate, async (req, res) => {
	const { taskId } = req.params;
	const allowedFields = ['task_name', 'task_desc', 'difficulty', 'date_due'];
	const updates = {};
	allowedFields.forEach(f => {
		if (req.body[f] !== undefined) updates[f] = req.body[f];
	});
	if (Object.keys(updates).length === 0)
		return res.status(400).json({ message: 'No updates provided' });

	if (updates.difficulty && !ALLOWED_DIFFICULTY.includes(updates.difficulty)) {
		return res.status(400).json({ message: 'Invalid difficulty' });
	}

	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task not found' });
		const membership = await ensureTeamMember(req.user.id, task.team_id);
		if (!membership)
			return res.status(403).json({ message: 'Not authorized for this task' });

		const isAdmin = await ensureTeamAdmin(req.user.id, task.team_id) || task.created_by_user_id === req.user.id;
		if (!isAdmin) return res.status(403).json({ message: 'Admin or creator required' });

		if (updates.difficulty) {
			updates.task_xp = XP_BY_DIFFICULTY[updates.difficulty];
		}

		await task.update(updates);
		await task.reload();
		return res.json(task);
	} catch (err) {
		console.error('Edit task failed', err);
		return res.status(500).json({ message: 'Failed to edit task' });
	}
});

router.delete('/tasks/:taskId', authenticate, async (req, res) => {
	const { taskId } = req.params;
	try {
		const task = await Task.findByPk(taskId);
		if (!task) return res.status(404).json({ message: 'Task not found' });

		const membership = await ensureTeamMember(req.user.id, task.team_id);
		if (!membership)
			return res
				.status(403)
				.json({ message: 'Not authorized for this team' });

		const teamAdmin = await ensureTeamAdmin(req.user.id, task.team_id);
		if (!isTaskAdmin(req.user.id, task, teamAdmin)) {
			return res.status(403).json({ message: 'Only admins or task creator can delete' });
		}

		await task.destroy();
		return res.json({ message: 'Task deleted' });
	} catch (err) {
		console.error('Delete task failed', err);
		return res.status(500).json({ message: 'Delete task failed' });
	}
});

export default router;
