import { Router } from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/authenticate.js';
import {
	requireWorkspaceRole,
	ensureWorkspaceOwner,
} from '../middleware/workspaceAuth.js';
import { Workspace, WorkspaceUser, User } from '../models/index.js';

const router = Router();

function generateJoinCode() {
	return crypto.randomBytes(16).toString('hex');
}

router.post('/workspaces', authenticate, async (req, res) => {
	const { name } = req.body;
	if (!name)
		return res.status(400).json({ message: 'Workspace name required' });
	try {
		const workspace = await Workspace.create({
			name,
			owner_user_id: req.user.id,
			join_code: generateJoinCode(),
		});
		await WorkspaceUser.create({
			workspace_id: workspace.id,
			user_id: req.user.id,
			role: 'owner',
		});
		return res.status(201).json(workspace);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Create workspace failed' });
	}
});

router.post('/workspaces/join', authenticate, async (req, res) => {
	const { join_code } = req.body;
	if (!join_code)
		return res.status(400).json({ message: 'join_code required' });
	try {
		const workspace = await Workspace.findOne({ where: { join_code } });
		if (!workspace)
			return res.status(404).json({ message: 'Workspace not found' });
		if (
			workspace.join_code_expires_at &&
			workspace.join_code_expires_at < new Date()
		) {
			return res.status(400).json({ message: 'Join code expired' });
		}
		const existing = await WorkspaceUser.findOne({
			where: { workspace_id: workspace.id, user_id: req.user.id },
		});
		if (existing)
			return res
				.status(409)
				.json({ message: 'Already a member of this workspace' });
		await WorkspaceUser.create({
			workspace_id: workspace.id,
			user_id: req.user.id,
			role: 'member',
		});
		return res
			.status(201)
			.json({ workspace_id: workspace.id, name: workspace.name });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Join workspace failed' });
	}
});

router.post(
	'/workspaces/:workspaceId/rotate-join-code',
	authenticate,
	requireWorkspaceRole(['owner']),
	async (req, res) => {
		const { workspaceId } = req.params;
		try {
			const workspace = await Workspace.findByPk(workspaceId);
			if (!workspace)
				return res.status(404).json({ message: 'Workspace not found' });
			await workspace.update({
				join_code: generateJoinCode(),
				join_code_expires_at: null,
			});
			return res.json({ join_code: workspace.join_code });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Rotate join code failed' });
		}
	}
);

router.post(
	'/workspaces/:workspaceId/users',
	authenticate,
	requireWorkspaceRole(['owner']),
	async (req, res) => {
		const { workspaceId } = req.params;
		const { userId, role = 'member' } = req.body;
		if (!userId) return res.status(400).json({ message: 'userId required' });
		if (!['admin', 'member'].includes(role))
			return res.status(400).json({ message: 'Invalid role' });
		try {
			const user = await User.findOne({
				where: { id: userId, deleted_at: null },
			});
			if (!user) return res.status(404).json({ message: 'User not found' });
			const membership = await WorkspaceUser.findOne({
				where: { workspace_id: workspaceId, user_id: userId },
			});
			if (membership)
				return res.status(409).json({ message: 'User already in workspace' });
			await WorkspaceUser.create({
				workspace_id: workspaceId,
				user_id: userId,
				role,
			});
			return res.status(201).json({ message: 'User added to workspace' });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Add user failed' });
		}
	}
);

router.get(
	'/workspaces/:workspaceId/users',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { workspaceId } = req.params;
		try {
			const members = await WorkspaceUser.findAll({
				where: { workspace_id: workspaceId },
			});
			return res.json(members);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Fetch members failed' });
		}
	}
);

export default router;
