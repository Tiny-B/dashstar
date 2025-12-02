import { Router } from 'express';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.patch('/users/profile-picture', authenticate, async (req, res) => {
	const { avatar_url } = req.body;
	if (!avatar_url)
		return res.status(400).json({ message: 'Please provide an avatar URL.' });
	try {
		const user = await User.findOne({
			where: { id: req.user.id, deleted_at: null },
		});
		if (!user) return res.status(404).json({ message: 'User not found.' });
		await user.update({ avatar_url });
		return res.json({ message: 'Profile picture updated.', avatar_url });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Unable to update profile picture.' });
	}
});

router.patch('/users/profile', authenticate, async (req, res) => {
	const allowed = [
		'full_name',
		'username',
		'email',
		'phone',
		'country',
		'city',
		'timezone',
		'theme',
	];
	const updates = {};
	allowed.forEach(field => {
		if (req.body[field] !== undefined) updates[field] = req.body[field];
	});
	if (Object.keys(updates).length === 0)
		return res.status(400).json({ message: 'No updates provided.' });
	try {
		const user = await User.findOne({
			where: { id: req.user.id, deleted_at: null },
		});
		if (!user) return res.status(404).json({ message: 'User not found.' });
		await user.update(updates);
		return res.json({
			message: 'Profile updated.',
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
				full_name: user.full_name,
				phone: user.phone,
				country: user.country,
				city: user.city,
				timezone: user.timezone,
				level: user.level,
				xp: user.xp,
				numTasks: user.numTasksCompleted,
				theme: user.theme,
				avatar_url: user.avatar_url,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Unable to update profile.' });
	}
});

export default router;
