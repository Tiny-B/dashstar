import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import TeamModel from './team.js';
import UserModel from './user.js';
import TaskModel from './task.js';
import TaskAssignmentModel from './taskAssignment.js';
import XpEventModel from './xpEvent.js';
import BadgeModel from './badge.js';
import UserBadgeModel from './userBadge.js';
import ScheduleModel from './schedule.js';
import MessageModel from './message.js';
import WorkspaceModel from './workspace.js';
import WorkspaceUserModel from './workspaceUser.js';

const Team = TeamModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Task = TaskModel(sequelize, DataTypes);
const TaskAssignment = TaskAssignmentModel(sequelize, DataTypes);
const XpEvent = XpEventModel(sequelize, DataTypes);
const Badge = BadgeModel(sequelize, DataTypes);
const UserBadge = UserBadgeModel(sequelize, DataTypes);
const Schedule = ScheduleModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const Workspace = WorkspaceModel(sequelize, DataTypes);
const WorkspaceUser = WorkspaceUserModel(sequelize, DataTypes);

Team.hasMany(User, { foreignKey: 'team_id' });
User.belongsTo(Team, { foreignKey: 'team_id' });

User.hasMany(Task, { foreignKey: 'created_by' });
Task.belongsTo(User, { foreignKey: 'created_by' });
Team.hasMany(Task, { foreignKey: 'team_id' });
Task.belongsTo(Team, { foreignKey: 'team_id' });

Task.hasMany(TaskAssignment, { foreignKey: 'task_id' });
User.hasMany(TaskAssignment, { foreignKey: 'user_id' });
TaskAssignment.belongsTo(Task, { foreignKey: 'task_id' });
TaskAssignment.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(XpEvent, { foreignKey: 'user_id' });
Task.hasMany(XpEvent, { foreignKey: 'task_id' });
XpEvent.belongsTo(User, { foreignKey: 'user_id' });
XpEvent.belongsTo(Task, { foreignKey: 'task_id' });

User.hasMany(UserBadge, { foreignKey: 'user_id' });
UserBadge.belongsTo(User, { foreignKey: 'user_id' });
Badge.hasMany(UserBadge, { foreignKey: 'badge_id' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id' });

Team.hasMany(Schedule, { foreignKey: 'target_team_id', as: 'teamSchedules' });
Schedule.belongsTo(Team, { foreignKey: 'target_team_id', as: 'targetTeam' });
User.hasMany(Schedule, { foreignKey: 'target_user_id', as: 'userSchedules' });
Schedule.belongsTo(User, { foreignKey: 'target_user_id', as: 'targetUser' });
User.hasMany(Schedule, { foreignKey: 'created_by', as: 'authoredSchedules' });
Schedule.belongsTo(User, { foreignKey: 'created_by', as: 'scheduleCreator' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
User.hasMany(Message, { foreignKey: 'recipient_user_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'recipient_user_id', as: 'recipientUser' });
Team.hasMany(Message, { foreignKey: 'recipient_team_id', as: 'teamMessages' });
Message.belongsTo(Team, { foreignKey: 'recipient_team_id', as: 'recipientTeam' });
Workspace.hasMany(Team, { foreignKey: 'workspace_id' });
Team.belongsTo(Workspace, { foreignKey: 'workspace_id' });
Workspace.hasMany(Task, { foreignKey: 'workspace_id' });
Task.belongsTo(Workspace, { foreignKey: 'workspace_id' });
Workspace.hasMany(Schedule, { foreignKey: 'workspace_id' });
Schedule.belongsTo(Workspace, { foreignKey: 'workspace_id' });
Workspace.hasMany(Message, { foreignKey: 'workspace_id' });
Message.belongsTo(Workspace, { foreignKey: 'workspace_id' });
Workspace.hasMany(WorkspaceUser, { foreignKey: 'workspace_id', as: 'memberships' });
WorkspaceUser.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
User.hasMany(WorkspaceUser, { foreignKey: 'user_id', as: 'workspaceMemberships' });
WorkspaceUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.belongsToMany(Workspace, { through: WorkspaceUser, foreignKey: 'user_id', otherKey: 'workspace_id', as: 'workspaces' });
Workspace.belongsToMany(User, { through: WorkspaceUser, foreignKey: 'workspace_id', otherKey: 'user_id', as: 'users' });

export {
	sequelize,
	Team,
	User,
	Task,
	TaskAssignment,
	XpEvent,
	Badge,
	UserBadge,
	Schedule,
	Message,
	Workspace,
	WorkspaceUser,
};
