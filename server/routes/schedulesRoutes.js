import { Router } from 'express';
import { Schedule, Team, User } from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';
import {
	requireWorkspaceMember,
	requireWorkspaceRole,
} from '../middleware/workspaceAuth.js';

const router = Router();

router.post(
	'/admin/schedules',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const {
			title,
			description,
			start_at,
			end_at,
			status = 'planned',
			target_team_id,
			target_user_id,
		} = req.body;
		if (!title || !start_at)
			return res.status(400).json({ message: 'title and start_at required' });
		try {
			if (target_team_id) {
				const team = await Team.findOne({
					where: {
						id: target_team_id,
						workspace_id: req.workspaceId,
						deleted_at: null,
					},
				});
				if (!team)
					return res.status(404).json({ message: 'Target team not found' });
			}
			if (target_user_id) {
				const user = await User.findOne({
					where: { id: target_user_id, deleted_at: null },
				});
				if (!user)
					return res.status(404).json({ message: 'Target user not found' });
			}
			const schedule = await Schedule.create({
				workspace_id: req.workspaceId,
				title,
				description,
				start_at,
				end_at: end_at || null,
				status,
				target_team_id: target_team_id || null,
				target_user_id: target_user_id || null,
				created_by: req.user.id,
			});
			return res.status(201).json(schedule);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Create schedule failed' });
		}
	}
);

router.get(
	'/schedules',
	authenticate,
	requireWorkspaceMember,
	async (req, res) => {
		try {
			const schedules = await Schedule.findAll({
				where: { workspace_id: req.workspaceId },
			});
			return res.json(schedules);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Fetch schedules failed' });
		}
	}
);

export default router;
