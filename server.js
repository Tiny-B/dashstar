import RegisterLoginRoute from './server/routes/RegisterLoginRoutes.js';
import TasksRoute from './server/routes/tasksRoutes.js';
import WorkspacesRoute from './server/routes/workspacesRoutes.js';
import UsersRoute from './server/routes/usersRoutes.js';
import MessagesRoute from './server/routes/messagesRoutes.js';
import AchievementsRoute from './server/routes/achievementsRoutes.js';
import express from 'express';
import sequelize from './server/config/db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins =
	process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
		'http://localhost:5173',
		'http://127.0.0.1:5173',
		'http://localhost:4000',
		'http://127.0.0.1:4000',
	];

app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (!origin || allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin || '*');
	}
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.header(
		'Access-Control-Allow-Methods',
		'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD'
	);
	res.header('Access-Control-Expose-Headers', 'Set-Cookie');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
});
app.use(express.json());
app.use(cookieParser());

app.use('/api', RegisterLoginRoute);
app.use('/api', TasksRoute);
app.use('/api', WorkspacesRoute);
app.use('/api', UsersRoute);
app.use('/api', MessagesRoute);
app.use('/api', AchievementsRoute);

app.use((err, req, res, next) => {
	console.error('error:', err);
	const status = err.status || 500;
	const message = err.message || 'Internal server error';

	res.status(status).json({ error: { message } });
	next();
});

(async () => {
	try {
		await sequelize.authenticate();
		console.log('connection established');

		await sequelize.sync({ alter: true });

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

// // sudo mysql -u <username> -p -h <host>

// export NODE_EXTRA_CA_CERTS=$(pwd)/certs/aiven-ca.pem

