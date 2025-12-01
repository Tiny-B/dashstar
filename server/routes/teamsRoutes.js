import { Router } from 'express';
import { Team, User, WorkspaceUser } from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';
import {
	requireWorkspaceMember,
	requireWorkspaceRole,
} from '../middleware/workspaceAuth.js';

const router = Router();

router.post(
	'/admin/teams',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { name, description, manager_name } = req.body;
		if (!name) return res.status(400).json({ message: 'Team name required' });
		try {
			const existing = await Team.findOne({
				where: { name, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (existing)
				return res.status(409).json({ message: 'Team already exists' });
			const team = await Team.create({
				workspace_id: req.workspaceId,
				name,
				description,
				manager_name,
			});
			return res.status(201).json(team);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Create team failed' });
		}
	}
);

router.post(
	'/admin/teams/:teamId/users/:userId',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { teamId, userId } = req.params;
		try {
			const team = await Team.findOne({
				where: { id: teamId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!team) return res.status(404).json({ message: 'Team not found' });
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
			await user.update({ team_id: team.id });
			return res.json({ message: 'User added to team' });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Add user to team failed' });
		}
	}
);

router.delete(
	'/admin/teams/:teamId',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const { teamId } = req.params;
		try {
			const team = await Team.findOne({
				where: { id: teamId, workspace_id: req.workspaceId, deleted_at: null },
			});
			if (!team) return res.status(404).json({ message: 'Team not found' });
			await team.update({ deleted_at: new Date() });
			return res.json({ message: 'Team deleted' });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Delete team failed' });
		}
	}
);

router.get('/teams', authenticate, requireWorkspaceMember, async (req, res) => {
	try {
		const teams = await Team.findAll({
			where: { workspace_id: req.workspaceId, deleted_at: null },
		});
		return res.json(teams);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Fetch teams failed' });
	}
});

export default router;
