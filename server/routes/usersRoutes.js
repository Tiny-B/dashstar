import { Router } from 'express';
import { User, XpEvent } from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.patch('/users/profile-picture', authenticate, async (req, res) => {
	const { avatar_url } = req.body;
	if (!avatar_url)
		return res.status(400).json({ message: 'avatar_url required' });
	try {
		const user = await User.findOne({
			where: { id: req.user.id, deleted_at: null },
		});
		if (!user) return res.status(404).json({ message: 'User not found' });
		await user.update({ avatar_url });
		return res.json({ message: 'Profile picture updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Update profile picture failed' });
	}
});

router.patch('/users/profile', authenticate, async (req, res) => {
	const allowed = ['name', 'phone', 'country', 'city', 'timezone', 'theme'];
	const updates = {};
	allowed.forEach(field => {
		if (req.body[field] !== undefined) updates[field] = req.body[field];
	});
	if (Object.keys(updates).length === 0)
		return res.status(400).json({ message: 'No updates provided' });
	try {
		const user = await User.findOne({
			where: { id: req.user.id, deleted_at: null },
		});
		if (!user) return res.status(404).json({ message: 'User not found' });
		await user.update(updates);
		return res.json({ message: 'Profile updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Update profile failed' });
	}
});

router.post('/users/xp', authenticate, async (req, res) => {
	const { userId, delta, reason, taskId = null } = req.body;
	if (!userId || !delta || !reason)
		return res
			.status(400)
			.json({ message: 'userId, delta, and reason required' });
	if (parseInt(userId, 10) !== req.user.id) {
		return res.status(403).json({ message: 'Can only adjust your own XP' });
	}
	try {
		const user = await User.findOne({
			where: { id: req.user.id, deleted_at: null },
		});
		if (!user) return res.status(404).json({ message: 'User not found' });
		await user.increment({ xp: delta });
		await XpEvent.create({ user_id: user.id, task_id: taskId, delta, reason });
		return res.json({ message: 'XP updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Update XP failed' });
	}
});

router.delete('/users/me', authenticate, async (req, res) => {
	try {
		const user = await User.findOne({
			where: { id: req.user.id, deleted_at: null },
		});
		if (!user) return res.status(404).json({ message: 'User not found' });
		await user.update({ deleted_at: new Date() });
		return res.json({ message: 'Account deleted' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Delete account failed' });
	}
});

export default router;
