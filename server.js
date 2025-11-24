import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
	host: DB_HOST,
	dialect: 'mysql',
	port: DB_PORT,
	logging: console.log,
});

const Team = sequelize.define(
	'teams',
	{
		id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
		description: { type: DataTypes.TEXT, allowNull: true },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
	},
	{ timestamps: false }
);

const User = sequelize.define(
	'users',
	{
		id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
		team_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'teams', key: 'id' } },
		name: { type: DataTypes.STRING(100), allowNull: false },
		email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
		password_hash: { type: DataTypes.STRING(255), allowNull: false },
		role: { type: DataTypes.ENUM('admin', 'user'), allowNull: false, defaultValue: 'user' },
		level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
		xp: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
	},
	{ timestamps: false }
);

const Task = sequelize.define(
	'tasks',
	{
		id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
		title: { type: DataTypes.STRING(150), allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: true },
		status: { type: DataTypes.ENUM('draft', 'published', 'archived'), allowNull: false, defaultValue: 'draft' },
		xp_reward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
		due_date: { type: DataTypes.DATE, allowNull: true },
		created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
	},
	{ timestamps: false }
);

const TaskAssignment = sequelize.define(
	'task_assignments',
	{
		id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
		task_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tasks', key: 'id' } },
		user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
		status: { type: DataTypes.ENUM('assigned', 'in_progress', 'completed'), allowNull: false, defaultValue: 'assigned' },
		completed_at: { type: DataTypes.DATE, allowNull: true },
	},
	{ timestamps: false }
);

const XpEvent = sequelize.define(
	'xp_events',
	{
		id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
		user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
		task_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'tasks', key: 'id' } },
		delta: { type: DataTypes.INTEGER, allowNull: false },
		reason: { type: DataTypes.STRING(255), allowNull: false },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
	},
	{ timestamps: false }
);

Team.hasMany(User, { foreignKey: 'team_id' });
User.belongsTo(Team, { foreignKey: 'team_id' });
User.hasMany(Task, { foreignKey: 'created_by' });
Task.belongsTo(User, { foreignKey: 'created_by' });
Task.hasMany(TaskAssignment, { foreignKey: 'task_id' });
User.hasMany(TaskAssignment, { foreignKey: 'user_id' });
TaskAssignment.belongsTo(Task, { foreignKey: 'task_id' });
TaskAssignment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(XpEvent, { foreignKey: 'user_id' });
Task.hasMany(XpEvent, { foreignKey: 'task_id' });
XpEvent.belongsTo(User, { foreignKey: 'user_id' });
XpEvent.belongsTo(Task, { foreignKey: 'task_id' });

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
