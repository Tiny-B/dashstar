import { Workspace, WorkspaceUser } from '../models/index.js';

export function requireWorkspaceRole(allowedRoles = ['owner', 'admin']) {
	return async (req, res, next) => {
		const workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId;
		if (!workspaceId) return res.status(400).json({ message: 'workspace id required' });
		try {
			const membership = await WorkspaceUser.findOne({
				where: { workspace_id: workspaceId, user_id: req.user.id },
			});
			if (!membership) return res.status(403).json({ message: 'Not a workspace member' });
			if (!allowedRoles.includes(membership.role)) {
				return res.status(403).json({ message: 'Insufficient workspace role' });
			}
			req.workspaceId = Number(workspaceId);
			req.workspaceRole = membership.role;
			return next();
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Workspace check failed' });
		}
	};
}

export async function requireWorkspaceMember(req, res, next) {
	const workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId;
	if (!workspaceId) return res.status(400).json({ message: 'workspace id required' });
	try {
		const membership = await WorkspaceUser.findOne({
			where: { workspace_id: workspaceId, user_id: req.user.id },
		});
		if (!membership) return res.status(403).json({ message: 'Not a workspace member' });
		req.workspaceId = Number(workspaceId);
		req.workspaceRole = membership.role;
		return next();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Workspace check failed' });
	}
}

export async function ensureWorkspaceOwner(req, res, next) {
	const workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId;
	if (!workspaceId) return res.status(400).json({ message: 'workspace id required' });
	try {
		const workspace = await Workspace.findByPk(workspaceId);
		if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
		if (workspace.owner_user_id !== req.user.id) {
			return res.status(403).json({ message: 'Owner role required' });
		}
		req.workspaceId = Number(workspaceId);
		req.workspaceRole = 'owner';
		return next();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Workspace check failed' });
	}
}
