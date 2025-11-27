/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const {
	sequelize,
	User,
	Workspace,
	WorkspaceUser,
	Team,
	Task,
	TaskAssignment,
	Message,
	Schedule,
} = require('../backend/models/index.js');

const WORKSPACE_CODE = 'abc123@2025';
const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJson(filename) {
	return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
}

function parseDateString(value) {
	if (!value) return null;
	// expecting formats like dd/mm/yy
	const parts = value.split('/');
	if (parts.length === 3) {
		const [d, m, y] = parts;
		const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
		const month = parseInt(m, 10) - 1;
		const day = parseInt(d, 10);
		const dt = new Date(year, month, day);
		return Number.isNaN(dt.getTime()) ? null : dt;
	}
	const dt = new Date(value);
	return Number.isNaN(dt.getTime()) ? null : dt;
}

async function seed() {
	await sequelize.authenticate();

	const usersData = loadJson('users.json');
	const teamsData = loadJson('teams.json');
	const tasksData = loadJson('tasks.json');
	const messagesData = loadJson('messages.json');
	const schedulesData = loadJson('schedules.json');

	const userMap = new Map(); // data id -> db user id

	// pick an owner user from data (admin preferred)
	const ownerData = usersData.find(u => u.role === 'admin') || usersData[0];
	if (!ownerData) throw new Error('No users found in data');

	// create owner user first with no team
	const ownerEmail = ownerData.email.toLowerCase();
	const ownerUsername = ownerEmail.split('@')[0];
	const ownerPasswordHash = await bcrypt.hash(ownerData.password, 10);

	const [owner] = await User.findOrCreate({
		where: { email: ownerEmail },
		defaults: {
			username: ownerUsername,
			name: ownerData.name,
			email: ownerEmail,
			password_hash: ownerPasswordHash,
			role: ownerData.role === 'admin' ? 'admin' : 'user',
			level: parseInt(ownerData.level, 10) || 1,
			xp: parseInt(ownerData.xp, 10) || 0,
			avatar_url: ownerData.pfp || null,
		},
	});
	userMap.set(parseInt(ownerData.id, 10), owner.id);

	// create workspace with owner
	const [workspace] = await Workspace.findOrCreate({
		where: { join_code: WORKSPACE_CODE },
		defaults: { name: 'Default Workspace', owner_user_id: owner.id, join_code: WORKSPACE_CODE },
	});

	await WorkspaceUser.findOrCreate({
		where: { workspace_id: workspace.id, user_id: owner.id },
		defaults: { role: 'owner' },
	});

	// teams
	const teamMap = new Map(); // data id -> db id
	for (const t of teamsData) {
		const [team] = await Team.findOrCreate({
			where: { workspace_id: workspace.id, name: t.team_name },
			defaults: { description: null, manager_name: null },
		});
		teamMap.set(parseInt(t.id, 10), team.id);
	}

	// remaining users
	for (const u of usersData) {
		if (userMap.has(parseInt(u.id, 10))) continue;
		const email = u.email.toLowerCase();
		const username = email.split('@')[0];
		const password_hash = await bcrypt.hash(u.password, 10);

		const [user] = await User.findOrCreate({
			where: { email },
			defaults: {
				username,
				name: u.name,
				email,
				password_hash,
				role: u.role === 'admin' ? 'admin' : 'user',
				level: parseInt(u.level, 10) || 1,
				xp: parseInt(u.xp, 10) || 0,
				avatar_url: u.pfp || null,
			},
		});
		userMap.set(parseInt(u.id, 10), user.id);

		await WorkspaceUser.findOrCreate({
			where: { workspace_id: workspace.id, user_id: user.id },
			defaults: { role: u.role === 'admin' ? 'admin' : 'member' },
		});
	}

	// update users with team_id
	for (const u of usersData) {
		const dbUserId = userMap.get(parseInt(u.id, 10));
		const dbTeamId = teamMap.get(parseInt(u.team_id, 10));
		if (dbTeamId && dbUserId) {
			await User.update({ team_id: dbTeamId }, { where: { id: dbUserId } });
		}
	}

	// tasks and assignments
	for (const t of tasksData) {
		const teamId = teamMap.get(parseInt(t.team_id, 10)) || null;
		const statusMap = {
			task: 'open',
			inprogress: 'inprogress',
			complete: 'complete',
		};
		const mappedStatus = statusMap[t.status] || 'open';

		const [task] = await Task.findOrCreate({
			where: { workspace_id: workspace.id, title: t.title },
			defaults: {
				workspace_id: workspace.id,
				team_id: teamId,
				title: t.title,
				description: t.desc || null,
				status: mappedStatus,
				xp_reward: parseInt(t.task_xp, 10) || 10,
				due_date: parseDateString(t.date_due),
				created_by: owner.id,
			},
		});

		if (mappedStatus === 'inprogress' || mappedStatus === 'complete') {
			const teamUsers = usersData.filter(u => parseInt(u.team_id, 10) === parseInt(t.team_id, 10));
			const assigneeData = teamUsers[0] || usersData[0];
			const assigneeId = userMap.get(parseInt(assigneeData.id, 10));
			const assignmentStatus = mappedStatus === 'complete' ? 'completed' : 'in_progress';
			await TaskAssignment.findOrCreate({
				where: { task_id: task.id, user_id: assigneeId },
				defaults: {
					status: assignmentStatus,
					completed_at: mappedStatus === 'complete' ? new Date() : null,
				},
			});
		}
	}

	// messages
	for (const m of messagesData) {
		const teamId = teamMap.get(parseInt(m.team_id, 10)) || null;
		const senderId = owner.id;
		await Message.findOrCreate({
			where: { workspace_id: workspace.id, recipient_team_id: teamId, body: m.content },
			defaults: {
				workspace_id: workspace.id,
				sender_id: senderId,
				recipient_team_id: teamId,
				subject: 'Message',
				body: m.content,
				status: 'sent',
			},
		});
	}

	// schedules
	for (const s of schedulesData) {
		const teamId = teamMap.get(parseInt(s.team_id, 10)) || null;
		const creatorId = owner.id;
		await Schedule.findOrCreate({
			where: { workspace_id: workspace.id, target_team_id: teamId, title: s.message },
			defaults: {
				workspace_id: workspace.id,
				target_team_id: teamId,
				target_user_id: null,
				title: s.message || 'Schedule',
				description: s.message || null,
				start_at: new Date(),
				end_at: null,
				status: 'planned',
				created_by: creatorId,
			},
		});
	}

	console.log('Seeding complete.');
}

seed()
	.then(() => sequelize.close())
	.catch(err => {
		console.error(err);
		sequelize.close();
		process.exit(1);
	});
