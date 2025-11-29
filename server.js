import authRoutes from './backend/routes/auth.js';
import express from 'express';
import sequelize from './backend/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use('/api', authRoutes);

//Use this one for prod
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

// 	async () => {
// 		// Quick seeded data, delete later

// 		await sequelize.sync({ force: true });

// 		// Create an admin user
// 		const admin = await User.create({
// 			username: 'Alice Admin',
// 			email: 'alice@example.com',
// 			password_hash: '<<bcrypt‑hash>>',
// 			role: 'admin',
// 			level: 5,
// 			xp: 1500,
// 		});

// 		// Admin creates a workspace
// 		const ws = await Workspace.create({
// 			code: 'ABCD-2025',
// 			admin_user_id: admin.id,
// 		});

// 		// Register a regular user that joins the workspace
// 		const bob = await User.create({
// 			username: 'Bob Bobson',
// 			email: 'bob@example.com',
// 			password_hash: '<<bcrypt‑hash>>',
// 			role: 'user',
// 		});

// 		await UserWorkspace.create({
// 			user_id: bob.id,
// 			workspace_id: ws.id,
// 			role: 'member',
// 		});

// 		// Admin creates a team inside that workspace
// 		const teamAlpha = await Team.create({
// 			workspace_id: ws.id,
// 			name: 'Team Alpha',
// 			admin_user_id: admin.id,
// 		});

// 		// Add Bob to the team
// 		await TeamMember.create({
// 			team_id: teamAlpha.id,
// 			user_id: bob.id,
// 		});

// 		// Admin creates a task for the team
// 		const task = await Task.create({
// 			team_id: teamAlpha.id,
// 			created_by_user_id: admin.id,
// 			task_name: 'Design UI',
// 			task_desc: 'Create mockups for the dashboard',
// 			date_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
// 			status: 'open',
// 			task_xp: 20,
// 		});

// 		console.log('✅ Demo data inserted, everything lines‑up!');
// 		process.exit(0);
// 	}
// )();

// // sudo mysql -u <username> -p -h <host>

// export NODE_EXTRA_CA_CERTS=$(pwd)/certs/aiven-ca.pem
