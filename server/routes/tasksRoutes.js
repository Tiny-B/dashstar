import { Router } from 'express';
import {
	Task,
	TaskAssignment,
	User,
	WorkspaceUser,
	Team,
} from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';
import {
	requireWorkspaceRole,
	requireWorkspaceMember,
} from '../middleware/workspaceAuth.js';

const router = Router();

router.post(
	'/admin/tasks',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const {
			title,
			description,
			xp_reward,
			due_date,
			status = 'open',
			team_id,
		} = req.body;
		if (!title) return res.status(400).json({ message: 'Title required' });
		if (!team_id) return res.status(400).json({ message: 'team_id required' });
		try {
			const team = await Team.findOne({
				where: { id: team_id, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!team) return res.status(404).json({ message: 'Team not found' });
			const task = await Task.create({
				workspace_id: req.workspaceId,
				team_id,
				title,
				description,
				xp_reward: xp_reward ?? 10,
				due_date: due_date || null,
				status,
				created_by: req.user.id,
			});
			return res.status(201).json(task);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Create task failed' });
		}
	}
);

router.put(
	'/admin/tasks/:taskId',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { taskId } = req.params;
		const { title, description, xp_reward, due_date, status, team_id } =
			req.body;
		try {
			const task = await Task.findOne({
				where: { id: taskId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!task) return res.status(404).json({ message: 'Task not found' });
			if (team_id) {
				const team = await Team.findOne({
					where: {
						id: team_id,
						workspace_id: req.workspaceId,
						deleted_at: null,
					},
				});
				if (!team) return res.status(404).json({ message: 'Team not found' });
			}
			await task.update({
				title: title ?? task.title,
				description: description ?? task.description,
				xp_reward: xp_reward ?? task.xp_reward,
				due_date: due_date ?? task.due_date,
				status: status ?? task.status,
				team_id: team_id ?? task.team_id,
			});
			return res.json(task);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Update task failed' });
		}
	}
);

router.delete(
	'/admin/tasks/:taskId',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { taskId } = req.params;
		try {
			const task = await Task.findOne({
				where: { id: taskId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!task) return res.status(404).json({ message: 'Task not found' });
			await task.update({ deleted_at: new Date(), status: 'archived' });
			return res.json({ message: 'Task deleted' });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Delete task failed' });
		}
	}
);

router.post(
	'/tasks/:taskId/claim',
	authenticate,
	requireWorkspaceMember,
	async (req, res) => {
		const { taskId } = req.params;
		try {
			const task = await Task.findOne({
				where: { id: taskId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!task) return res.status(404).json({ message: 'Task not found' });
			const user = await User.findOne({
				where: { id: req.user.id, deleted_at: null },
			});
			if (!user) return res.status(404).json({ message: 'User not found' });
			if (task.team_id && user.team_id !== task.team_id) {
				return res
					.status(403)
					.json({ message: 'Task is not assigned to your team' });
			}

			const existing = await TaskAssignment.findOne({
				where: { task_id: task.id, user_id: req.user.id },
			});
			if (existing) {
				if (existing.status === 'completed') {
					return res.status(400).json({ message: 'Task already completed' });
				}
				await existing.update({ status: 'in_progress' });
				return res.json(existing);
			}

			const assignment = await TaskAssignment.create({
				task_id: task.id,
				user_id: req.user.id,
				status: 'in_progress',
			});
			return res.status(201).json(assignment);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Claim task failed' });
		}
	}
);

router.post(
	'/tasks/:taskId/complete',
	authenticate,
	requireWorkspaceMember,
	async (req, res) => {
		const { taskId } = req.params;
		try {
			const task = await Task.findOne({
				where: { id: taskId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!task) return res.status(404).json({ message: 'Task not found' });
			const user = await User.findOne({
				where: { id: req.user.id, deleted_at: null },
			});
			if (!user) return res.status(404).json({ message: 'User not found' });
			if (task.team_id && user.team_id !== task.team_id) {
				return res
					.status(403)
					.json({ message: 'Task is not assigned to your team' });
			}

			const assignment = await TaskAssignment.findOne({
				where: { task_id: task.id, user_id: req.user.id },
			});
			if (!assignment)
				return res.status(404).json({ message: 'Task not claimed' });
			if (assignment.status === 'completed')
				return res.status(400).json({ message: 'Task already completed' });

			await assignment.update({
				status: 'completed',
				completed_at: new Date(),
			});
			return res.json(assignment);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Complete task failed' });
		}
	}
);

router.post(
	'/admin/tasks/:taskId/assign',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { taskId } = req.params;
		const { userId } = req.body;
		if (!userId) return res.status(400).json({ message: 'User required' });
		try {
			const task = await Task.findOne({
				where: { id: taskId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!task) return res.status(404).json({ message: 'Task not found' });
			const user = await User.findOne({
				where: { id: userId, deleted_at: null },
			});
			if (!user) return res.status(404).json({ message: 'User not found' });
			const membership = await WorkspaceUser.findOne({
				where: { workspace_id: req.workspaceId, user_id: userId },
			});
			if (!membership)
				return res
					.status(403)
					.json({ message: 'User is not a member of this workspace' });
			if (task.team_id && user.team_id !== task.team_id) {
				return res
					.status(403)
					.json({ message: 'User is not in the task team' });
			}
			const assignment = await TaskAssignment.create({
				task_id: task.id,
				user_id: user.id,
				status: 'assigned',
			});
			return res.status(201).json(assignment);
		} catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError') {
				return res
					.status(409)
					.json({ message: 'Task already assigned to user' });
			}
			console.error(err);
			return res.status(500).json({ message: 'Assign task failed' });
		}
	}
);

router.get('/tasks', authenticate, requireWorkspaceMember, async (req, res) => {
	try {
		const where = { workspace_id: req.workspaceId, deleted_at: null };
		if (req.query.team_id) where.team_id = req.query.team_id;
		const tasks = await Task.findAll({ where });
		return res.json(tasks);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Fetch tasks failed' });
	}
});

export default router;
