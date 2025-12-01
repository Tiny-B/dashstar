import RegisterLoginRoute from './server/routes/RegisterLoginRoutes.js';
import express from 'express';
import sequelize from './server/config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

const whitelist = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:4000',
	'http://127.0.0.1:4000',
	// URLs here,'https://my‑app.com'
];
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (whitelist.includes(origin)) return callback(null, true);
			return callback(new Error('Not allowed by CORS'));
		},
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['Set-Cookie'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	})
);
app.use(express.json());
app.use(cookieParser());

app.use('/api', RegisterLoginRoute);

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

// // sudo mysql -u <username> -p -h <host>

// export NODE_EXTRA_CA_CERTS=$(pwd)/certs/aiven-ca.pem
