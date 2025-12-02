import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
	Workspace,
	UserWorkspace,
	Team,
	TeamMember,
	Task,
	User,
} from '../models/index.js';
import { uniqueWorkspaceCode } from '../scripts/util.js';

const router = Router();

async function ensureMember(userId, workspaceId) {
	const membership = await UserWorkspace.findOne({
		where: { user_id: userId, workspace_id: workspaceId },
	});
	return membership;
}

router.get('/workspaces/my', authenticate, async (req, res) => {
	try {
		const memberships = await UserWorkspace.findAll({
			where: { user_id: req.user.id },
			attributes: ['workspace_id', 'role'],
			include: [{ model: Workspace, attributes: ['id', 'name', 'code', 'admin_user_id'] }],
		});

		const workspaces = memberships
			.map(m => {
				if (!m.Workspace) return null;
				return {
					id: m.Workspace.id,
					name: m.Workspace.name,
					code: m.Workspace.code,
					admin_user_id: m.Workspace.admin_user_id,
					role: m.role,
				};
			})
			.filter(Boolean);

		return res.json(workspaces);
	} catch (err) {
		console.error('Fetch workspaces failed', err);
		return res.status(500).json({ message: 'Fetch workspaces failed' });
	}
});

router.post('/workspaces', authenticate, async (req, res) => {
	const code = uniqueWorkspaceCode(25);
	const name = req.body?.name?.trim() || 'Workspace';

	try {
		const workspace = await Workspace.create({
			code,
			name,
			admin_user_id: req.user.id,
		});

		await UserWorkspace.create({
			user_id: req.user.id,
			workspace_id: workspace.id,
			role: 'admin',
		});

		const personalTeam = await Team.create({
			workspace_id: workspace.id,
			name: 'personal',
			admin_user_id: req.user.id,
		});

		await TeamMember.create({
			team_id: personalTeam.id,
			user_id: req.user.id,
		});

		return res.status(201).json({
			id: workspace.id,
			name: workspace.name,
			code: workspace.code,
			admin_user_id: workspace.admin_user_id,
			default_team_id: personalTeam.id,
		});
	} catch (err) {
		console.error('Create workspace failed', err);
		return res.status(500).json({ message: 'Unable to create workspace right now.' });
	}
});

router.post('/workspaces/join', authenticate, async (req, res) => {
	const { code } = req.body;
	if (!code) return res.status(400).json({ message: 'code is required' });

	try {
		const workspace = await Workspace.findOne({ where: { code } });
		if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

		const existing = await UserWorkspace.findOne({
			where: { user_id: req.user.id, workspace_id: workspace.id },
		});
		if (existing)
			return res.status(409).json({ message: 'You are already a member of this workspace.' });

		await UserWorkspace.create({
			user_id: req.user.id,
			workspace_id: workspace.id,
			role: 'member',
		});

		let personalTeam = await Team.findOne({
			where: { workspace_id: workspace.id, name: 'personal' },
		});
		if (!personalTeam) {
			personalTeam = await Team.create({
				workspace_id: workspace.id,
				name: 'personal',
				admin_user_id: workspace.admin_user_id,
			});
		}

		await TeamMember.findOrCreate({
			where: { team_id: personalTeam.id, user_id: req.user.id },
			defaults: { team_id: personalTeam.id, user_id: req.user.id },
		});

		return res.status(201).json({
			id: workspace.id,
			name: workspace.name,
			code: workspace.code,
			admin_user_id: workspace.admin_user_id,
			default_team_id: personalTeam.id,
		});
	} catch (err) {
		console.error('Join workspace failed', err);
		return res.status(500).json({ message: 'Unable to join workspace right now.' });
	}
});

	router.get('/workspaces/:workspaceId/teams', authenticate, async (req, res) => {
	const { workspaceId } = req.params;
	try {
		const membership = await ensureMember(req.user.id, workspaceId);
		if (!membership)
			return res.status(403).json({ message: 'You need to join this workspace to view teams.' });

		const teams = await Team.findAll({
			where: { workspace_id: workspaceId },
			attributes: ['id', 'name', 'workspace_id', 'admin_user_id'],
		});
		return res.json(teams);
	} catch (err) {
		console.error('Fetch teams failed', err);
		return res.status(500).json({ message: 'Unable to load teams right now.' });
	}
});

router.get('/workspaces/:workspaceId/summary', authenticate, async (req, res) => {
	const { workspaceId } = req.params;
	try {
		const membership = await ensureMember(req.user.id, workspaceId);
		if (!membership)
			return res.status(403).json({ message: 'You need to join this workspace to view details.' });

		const workspace = await Workspace.findByPk(workspaceId, {
			attributes: ['id', 'name', 'code', 'admin_user_id'],
		});
		if (!workspace)
			return res
				.status(404)
				.json({ message: 'We could not find that workspace. Please check the code.' });

		const members = await UserWorkspace.findAll({
			where: { workspace_id: workspaceId },
			attributes: ['role'],
			include: [
				{
					model: User,
					attributes: ['id', 'username', 'email'],
				},
			],
		});

		const totalTasks = await Task.count({
			include: [{ model: Team, required: true, where: { workspace_id: workspaceId } }],
		});
		const completedTasks = await Task.count({
			where: { status: 'complete' },
			include: [{ model: Team, required: true, where: { workspace_id: workspaceId } }],
		});

		return res.json({
			id: workspace.id,
			name: workspace.name,
			code: workspace.code,
			role: membership.role,
			admin_user_id: workspace.admin_user_id,
			members: members
				.filter(m => m.User)
				.map(m => ({
					id: m.User.id,
					username: m.User.username,
					email: m.User.email,
					role: m.role,
				})),
			taskCounts: {
				total: totalTasks,
				complete: completedTasks,
			},
		});
	} catch (err) {
		console.error('Fetch workspace summary failed', err);
		return res.status(500).json({ message: 'Unable to load workspace details right now.' });
	}
});

export default router;
