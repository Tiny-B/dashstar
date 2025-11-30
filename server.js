import RegisterLoginRoute from './server/routes/RegisterLoginRoutes.js';
import express from 'express';
import sequelize from './server/config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api', RegisterLoginRoute);

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
