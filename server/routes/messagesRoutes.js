import { Router } from 'express';
import { Op } from 'sequelize';
import { Message, User, Task, TeamMember, UserBlock } from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

async function isTeamMember(userId, taskId) {
	const task = await Task.findByPk(taskId, { attributes: ['team_id'] });
	if (!task) return false;
	const membership = await TeamMember.findOne({
		where: { user_id: userId, team_id: task.team_id },
	});
	return !!membership;
}

async function isBlocked(a, b) {
	const [blocked, blockedByOther] = await Promise.all([
		UserBlock.findOne({ where: { user_id: a, blocked_user_id: b } }),
		UserBlock.findOne({ where: { user_id: b, blocked_user_id: a } }),
	]);
	return !!blocked || !!blockedByOther;
}

router.get('/messages/users/search', authenticate, async (req, res) => {
	const q = req.query.q?.trim();
	const where = { id: { [Op.ne]: req.user.id } };
	if (q) {
		where[Op.or] = [
			{ username: { [Op.like]: `%${q}%` } },
			{ email: { [Op.like]: `%${q}%` } },
		];
	}
	try {
		const users = await User.findAll({
			where,
			attributes: ['id', 'username', 'email', 'avatar_url'],
			limit: 50,
			order: [['username', 'ASC']],
		});
		return res.json(users);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to search users' });
	}
});

router.get('/messages/users/:userId', authenticate, async (req, res) => {
	const otherUserId = Number(req.params.userId);
	if (!otherUserId) return res.status(400).json({ message: 'userId required' });
	try {
		const otherUser = await User.findByPk(otherUserId);
		if (!otherUser) return res.status(404).json({ message: 'User not found' });
		if (await isBlocked(req.user.id, otherUserId)) {
			return res.status(403).json({ message: 'Messaging is blocked' });
		}
		const messages = await Message.findAll({
			where: {
				task_id: null,
				[Op.or]: [
					{ sender_user_id: req.user.id, recipient_user_id: otherUserId },
					{ sender_user_id: otherUserId, recipient_user_id: req.user.id },
				],
			},
			order: [['createdAt', 'ASC']],
		});
		return res.json(messages);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to fetch messages' });
	}
});

router.get('/messages/recent', authenticate, async (req, res) => {
	try {
		const msgs = await Message.findAll({
			where: {
				task_id: null,
				[Op.or]: [
					{ sender_user_id: req.user.id },
					{ recipient_user_id: req.user.id },
				],
			},
			order: [['createdAt', 'DESC']],
			limit: 100,
		});

		const latestByUser = new Map();
		for (const m of msgs) {
			const otherId = m.sender_user_id === req.user.id ? m.recipient_user_id : m.sender_user_id;
			if (!otherId) continue;
			if (!latestByUser.has(otherId)) {
				latestByUser.set(otherId, m);
			}
		}

		const userIds = Array.from(latestByUser.keys());
		if (userIds.length === 0) return res.json([]);

		const users = await User.findAll({
			where: { id: userIds },
			attributes: ['id', 'username', 'email', 'avatar_url'],
		});

		const payload = users.map(u => {
			const m = latestByUser.get(u.id);
			return {
				id: u.id,
				username: u.username,
				email: u.email,
				avatar_url: u.avatar_url,
				lastMessage: m?.content,
				lastTime: m
					? new Date(m.createdAt || m.created_at).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
					  })
					: null,
			};
		});

		return res.json(payload);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to load recent messages' });
	}
});

router.post('/messages/users/:userId', authenticate, async (req, res) => {
	const otherUserId = Number(req.params.userId);
	const { content } = req.body;
	if (!otherUserId) return res.status(400).json({ message: 'userId required' });
	if (!content?.trim()) return res.status(400).json({ message: 'content required' });
	try {
		const otherUser = await User.findByPk(otherUserId);
		if (!otherUser) return res.status(404).json({ message: 'User not found' });
		if (await isBlocked(req.user.id, otherUserId)) {
			return res.status(403).json({ message: 'Messaging is blocked' });
		}
		const message = await Message.create({
			sender_user_id: req.user.id,
			recipient_user_id: otherUserId,
			content: content.trim(),
		});
		return res.status(201).json(message);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to send message' });
	}
});

router.get('/messages/tasks/:taskId', authenticate, async (req, res) => {
	const { taskId } = req.params;
	try {
		const allowed = await isTeamMember(req.user.id, taskId);
		if (!allowed) return res.status(403).json({ message: 'Not authorized for this task' });
		const messages = await Message.findAll({
			where: { task_id: taskId },
			order: [['createdAt', 'ASC']],
		});
		return res.json(messages);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to fetch task messages' });
	}
});

router.post('/messages/tasks/:taskId', authenticate, async (req, res) => {
	const { taskId } = req.params;
	const { content } = req.body;
	if (!content?.trim()) return res.status(400).json({ message: 'content required' });
	try {
		const allowed = await isTeamMember(req.user.id, taskId);
		if (!allowed) return res.status(403).json({ message: 'Not authorized for this task' });
		const message = await Message.create({
			task_id: taskId,
			sender_user_id: req.user.id,
			content: content.trim(),
		});
		return res.status(201).json(message);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to send task message' });
	}
});

router.patch('/messages/:messageId', authenticate, async (req, res) => {
	const { messageId } = req.params;
	const { content } = req.body;
	if (!content?.trim()) return res.status(400).json({ message: 'content required' });
	try {
		const msg = await Message.findByPk(messageId);
		if (!msg) return res.status(404).json({ message: 'Message not found' });
		if (msg.sender_user_id !== req.user.id) {
			return res.status(403).json({ message: 'Only sender can edit' });
		}
		await msg.update({ content: content.trim() });
		return res.json(msg);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to edit message' });
	}
});

router.delete('/messages/:messageId', authenticate, async (req, res) => {
	const { messageId } = req.params;
	try {
		const msg = await Message.findByPk(messageId);
		if (!msg) return res.status(404).json({ message: 'Message not found' });
		if (msg.sender_user_id !== req.user.id) {
			return res.status(403).json({ message: 'Only sender can delete' });
		}
		await msg.destroy();
		return res.json({ message: 'Deleted' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to delete message' });
	}
});

router.delete('/messages/users/:userId/all', authenticate, async (req, res) => {
	const otherUserId = Number(req.params.userId);
	if (!otherUserId) return res.status(400).json({ message: 'userId required' });
	try {
		await Message.destroy({
			where: {
				task_id: null,
				[Op.or]: [
					{ sender_user_id: req.user.id, recipient_user_id: otherUserId },
					{ sender_user_id: otherUserId, recipient_user_id: req.user.id },
				],
			},
		});
		return res.json({ message: 'Conversation cleared' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to clear conversation' });
	}
});

router.post('/messages/block/:userId', authenticate, async (req, res) => {
	const targetId = Number(req.params.userId);
	if (!targetId) return res.status(400).json({ message: 'userId required' });
	if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot block self' });
	try {
		const [block] = await UserBlock.findOrCreate({
			where: { user_id: req.user.id, blocked_user_id: targetId },
			defaults: { user_id: req.user.id, blocked_user_id: targetId },
		});
		return res.status(201).json(block);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to block user' });
	}
});

router.delete('/messages/block/:userId', authenticate, async (req, res) => {
	const targetId = Number(req.params.userId);
	if (!targetId) return res.status(400).json({ message: 'userId required' });
	try {
		await UserBlock.destroy({
			where: { user_id: req.user.id, blocked_user_id: targetId },
		});
		return res.json({ message: 'Unblocked' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to unblock user' });
	}
});

router.get('/messages/blocks', authenticate, async (req, res) => {
	try {
		const blocks = await UserBlock.findAll({ where: { user_id: req.user.id } });
		return res.json(blocks);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to list blocks' });
	}
});

export default router;
