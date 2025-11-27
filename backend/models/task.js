export default (sequelize, DataTypes) =>
	sequelize.define(
		'tasks',
		{
			id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
			workspace_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'workspaces', key: 'id' } },
			team_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'teams', key: 'id' } },
			title: { type: DataTypes.STRING(150), allowNull: false },
			description: { type: DataTypes.TEXT, allowNull: true },
			status: {
				type: DataTypes.ENUM('open', 'published', 'inprogress', 'complete'),
				allowNull: false,
				defaultValue: 'open',
			},
			xp_reward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
			due_date: { type: DataTypes.DATE, allowNull: true },
			created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			deleted_at: { type: DataTypes.DATE, allowNull: true },
		},
		{ timestamps: false }
	);
