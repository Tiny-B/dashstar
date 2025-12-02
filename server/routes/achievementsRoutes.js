import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { Achievement, UserAchievement } from '../models/index.js';

const router = Router();

router.get('/achievements/my', authenticate, async (req, res) => {
	try {
		const earned = await UserAchievement.findAll({
			where: { user_id: req.user.id },
			include: [{ model: Achievement }],
			order: [['awarded_at', 'ASC']],
		});
		return res.json(
			earned
				.filter(e => e.Achievement)
				.map(e => ({
					code: e.Achievement.code,
					name: e.Achievement.name,
					description: e.Achievement.description,
					awarded_at: e.awarded_at,
				}))
		);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to load achievements' });
	}
});

export default router;
