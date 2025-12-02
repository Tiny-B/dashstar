import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import TeamModel from "./teamModel.js";
import TeamMemberModel from "./teamMemberModel.js";
import UserModel from "./userModel.js";
import TaskModel from "./taskModel.js";
import ScheduleModel from "./scheduleModel.js";
import MessageModel from "./messageModel.js";
import WorkspaceModel from "./workspaceModel.js";
import UserWorkspaceModel from "./userWorkspaceModel.js";

const Team = TeamModel(sequelize, DataTypes);
const TeamMember = TeamMemberModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Task = TaskModel(sequelize, DataTypes);
const Schedule = ScheduleModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const Workspace = WorkspaceModel(sequelize, DataTypes);
const UserWorkspace = UserWorkspaceModel(sequelize, DataTypes);

// ====================== USER =============================
User.belongsToMany(Workspace, {
    through: UserWorkspace,
    foreignKey: "user_id",
    otherKey: "workspace_id",
});

User.hasMany(Workspace, {
    foreignKey: "admin_user_id",
    as: "ownedWorkspaces",
});

User.hasMany(Team, {
    foreignKey: "admin_user_id",
    as: "adminTeams",
});

User.belongsToMany(Team, {
    through: TeamMember,
    foreignKey: "user_id",
    otherKey: "team_id",
});

User.hasMany(Task, {
    foreignKey: "created_by_user_id",
    as: "createdTasks",
});

User.hasMany(Schedule, {
    foreignKey: "created_by_user_id",
    as: "createdSchedules",
});

User.hasMany(Message, {
    foreignKey: "created_by_user_id",
    as: "createdMessages",
});

// ===================Workspace ==================================
Workspace.belongsTo(User, {
    foreignKey: "admin_user_id",
    as: "admin",
});

Workspace.belongsToMany(User, {
    through: UserWorkspace,
    foreignKey: "workspace_id",
    otherKey: "user_id",
});

Workspace.hasMany(UserWorkspace, { foreignKey: "workspace_id" });
UserWorkspace.belongsTo(Workspace, { foreignKey: "workspace_id" });
UserWorkspace.belongsTo(User, { foreignKey: "user_id" });

Workspace.hasMany(Team, {
    foreignKey: "workspace_id",
    as: "teams",
});

//=================== Team ========================
Team.belongsTo(Workspace, {
    foreignKey: "workspace_id",
    as: "workspace",
});

Team.belongsTo(User, {
    foreignKey: "admin_user_id",
    as: "admin",
});

Team.belongsToMany(User, {
    through: TeamMember,
    foreignKey: "team_id",
    otherKey: "user_id",
    as: "members",
});

TeamMember.belongsTo(Team, { foreignKey: "team_id" });
TeamMember.belongsTo(User, { foreignKey: "user_id" });

Team.hasMany(Task, { foreignKey: "team_id", as: "tasks" });
Team.hasMany(Schedule, { foreignKey: "team_id", as: "schedules" });
Team.hasMany(Message, { foreignKey: "team_id", as: "messages" });
Task.belongsTo(Team, { foreignKey: "team_id" });

//=========================== Task =====================
Task.belongsTo(Team, { foreignKey: "team_id", as: "team" });
Task.belongsTo(User, {
    foreignKey: "created_by_user_id",
    as: "creator",
});

//=========================== Schedule ========================
Schedule.belongsTo(Team, { foreignKey: "team_id", as: "team" });
Schedule.belongsTo(User, {
    foreignKey: "created_by_user_id",
    as: "creator",
});

// ============================= Messages ========================
Message.belongsTo(Team, { foreignKey: "team_id", as: "team" });
Message.belongsTo(User, {
    foreignKey: "created_by_user_id",
    as: "author",
});

function createStubModel(name) {
    return new Proxy(
        {},
        {
            get() {
                throw new Error(`${name} model is not implemented for this build`);
            },
        }
    );
}

const WorkspaceUser = UserWorkspace;
const TaskAssignment = createStubModel("TaskAssignment");
const XpEvent = createStubModel("XpEvent");

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
    WorkspaceUser,
    TaskAssignment,
    XpEvent,
};
