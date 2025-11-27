import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './backend/routes/auth.js';
import teamRoutes from './backend/routes/teams.js';
import taskRoutes from './backend/routes/tasks.js';
import userRoutes from './backend/routes/users.js';
import scheduleRoutes from './backend/routes/schedules.js';
import messageRoutes from './backend/routes/messages.js';
import workspaceRoutes from './backend/routes/workspaces.js';
import { sequelize } from './backend/models/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'dev-secret' || JWT_SECRET === 'change_me_to_a_long_random_value') {
	console.error('JWT_SECRET must be set to a strong value in .env');
	process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', teamRoutes);
app.use('/api', taskRoutes);
app.use('/api', userRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', messageRoutes);
app.use('/api', workspaceRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.all('*', (req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

(async () => {
	try {
		await sequelize.authenticate();
		await sequelize.sync();

		const server = app.listen(PORT, () => {
			console.log(`Server is listening at http://localhost:${PORT}`);
		});

		server.on('error', err => {
			console.error('HTTP server error:', err);
			process.exit(1);
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})();
