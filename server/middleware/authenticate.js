import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authenticate(req, res, next) {
	let token = req.cookies?.token;

	if (!token && req.headers.authorization?.startsWith('Bearer '))
		token = req.headers.authorization.split(' ')[1];

	if (!token) {
		return res
			.status(401)
			.json({ error: { message: 'Missing authentication token' } });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload;

		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

export function requireAdmin(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	if (req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}

	next();
}
