import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import TeamModel from './team.js';
import TeamMemberModel from './teamMember.js';
import UserModel from './user.js';
import TaskModel from './task.js';
import ScheduleModel from './schedule.js';
import MessageModel from './message.js';
import WorkspaceModel from './workspace.js';
import UserWorkspaceModel from './userWorkspace.js';

const Team = TeamModel(sequelize, DataTypes);
const TeamMember = TeamMemberModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Task = TaskModel(sequelize, DataTypes);
const Schedule = ScheduleModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const Workspace = WorkspaceModel(sequelize, DataTypes);
const UserWorkspace = UserWorkspaceModel(sequelize, DataTypes);

// ====================== USER =============================
// A user can belong to many workspaces (member or admin)
User.belongsToMany(Workspace, {
	through: UserWorkspace,
	foreignKey: 'user_id',
	otherKey: 'workspace_id',
});

// Workspaces where the user is the *owner* (admin_user_id)
User.hasMany(Workspace, {
	foreignKey: 'admin_user_id',
	as: 'ownedWorkspaces',
});

// Teams that the user created (team admin)
User.hasMany(Team, {
	foreignKey: 'admin_user_id',
	as: 'adminTeams',
});

// Teams the user is a member of (through TeamMembers)
User.belongsToMany(Team, {
	through: TeamMember,
	foreignKey: 'user_id',
	otherKey: 'team_id',
});

// Tasks created by the user (admin only)
User.hasMany(Task, {
	foreignKey: 'created_by_user_id',
	as: 'createdTasks',
});

// Schedules created by the user
User.hasMany(Schedule, {
	foreignKey: 'created_by_user_id',
	as: 'createdSchedules',
});

// Messages created by the user
User.hasMany(Message, {
	foreignKey: 'created_by_user_id',
	as: 'createdMessages',
});

// ===================Workspace ==================================
// The owner (admin) of the workspace
Workspace.belongsTo(User, {
	foreignKey: 'admin_user_id',
	as: 'admin',
});

// Users that belong to the workspace (member or admin)
Workspace.belongsToMany(User, {
	through: UserWorkspace,
	foreignKey: 'workspace_id',
	otherKey: 'user_id',
});

// Teams that live inside the workspace
Workspace.hasMany(Team, {
	foreignKey: 'workspace_id',
	as: 'teams',
});

//=================== Team ========================
// Workspace that contains this team
Team.belongsTo(Workspace, {
	foreignKey: 'workspace_id',
	as: 'workspace',
});

// The user who created / leads the team
Team.belongsTo(User, {
	foreignKey: 'admin_user_id',
	as: 'admin',
});

// Users belonging to the team (many‑to‑many)
Team.belongsToMany(User, {
	through: TeamMember,
	foreignKey: 'team_id',
	otherKey: 'user_id',
	as: 'members',
});

// Tasks, Schedules, Messages that belong to this team
Team.hasMany(Task, { foreignKey: 'team_id', as: 'tasks' });
Team.hasMany(Schedule, { foreignKey: 'team_id', as: 'schedules' });
Team.hasMany(Message, { foreignKey: 'team_id', as: 'messages' });

//=========================== Task =====================
Task.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Task.belongsTo(User, {
	foreignKey: 'created_by_user_id',
	as: 'creator',
});

//=========================== Schedule ========================
Schedule.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Schedule.belongsTo(User, {
	foreignKey: 'created_by_user_id',
	as: 'creator',
});

// ============================= Messages ========================
Message.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Message.belongsTo(User, {
	foreignKey: 'created_by_user_id',
	as: 'author',
});

export {
	sequelize,
	Team,
	TeamMember,
	User,
	Task,
	Schedule,
	Message,
	Workspace,
	UserWorkspace,
};
