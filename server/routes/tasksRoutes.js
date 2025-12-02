import { Router } from 'express';
import { Task, TeamMember, Team, Workspace, User } from '../models/index.js';
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
	return {
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
	};
}

async function ensureTeamMember(userId, teamId) {
	const membership = await TeamMember.findOne({
		where: { user_id: userId, team_id: teamId },
	});
	return membership;
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
		if (!isMember)
			return res
				.status(403)
				.json({ message: 'Not authorized for this team' });

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

		let updatedUser = null;
		if (prevStatus !== 'complete' && status === 'complete') {
			updatedUser = await applyXpAndCompletion(
				req.user.id,
				task.task_xp || XP_BY_DIFFICULTY[task.difficulty] || 0
			);
		}

		return res.json({ task, user: updatedUser });
	} catch (err) {
		console.error('Update task status failed', err);
		return res.status(500).json({ message: 'We could not update the task right now.' });
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

		await task.destroy();
		return res.json({ message: 'Task deleted' });
	} catch (err) {
		console.error('Delete task failed', err);
		return res.status(500).json({ message: 'Delete task failed' });
	}
});

export default router;
