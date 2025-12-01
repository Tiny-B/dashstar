import { Router } from 'express';
import { Message, Team, User } from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';
import {
	requireWorkspaceMember,
	requireWorkspaceRole,
} from '../middleware/workspaceAuth.js';

const router = Router();

router.post(
	'/admin/messages',
	authenticate,
	requireWorkspaceRole(['owner', 'admin']),
	async (req, res) => {
		const {
			recipient_user_id,
			recipient_team_id,
			subject,
			body,
			status = 'sent',
		} = req.body;
		if (!subject || !body)
			return res.status(400).json({ message: 'subject and body required' });
		try {
			if (recipient_user_id) {
				const user = await User.findOne({
					where: { id: recipient_user_id, deleted_at: null },
				});
				if (!user)
					return res.status(404).json({ message: 'Recipient user not found' });
			}
			if (recipient_team_id) {
				const team = await Team.findOne({
					where: {
						id: recipient_team_id,
						workspace_id: req.workspaceId,
						deleted_at: null,
					},
				});
				if (!team)
					return res.status(404).json({ message: 'Recipient team not found' });
			}
			const message = await Message.create({
				workspace_id: req.workspaceId,
				sender_id: req.user.id,
				recipient_user_id: recipient_user_id || null,
				recipient_team_id: recipient_team_id || null,
				subject,
				body,
				status,
			});
			return res.status(201).json(message);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Send message failed' });
		}
	}
);

router.get(
	'/messages',
	authenticate,
	requireWorkspaceMember,
	async (req, res) => {
		try {
			const messages = await Message.findAll({
				where: { workspace_id: req.workspaceId },
			});
			return res.json(messages);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Fetch messages failed' });
		}
	}
);

export default router;
