export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Task',
		{
			id: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			team_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: {
					model: 'Teams',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			created_by_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: {
					model: 'Users',
					key: 'id',
				},
				onDelete: 'RESTRICT',
			},
			task_name: {
				type: DataTypes.STRING(150),
				allowNull: false,
			},
			task_desc: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			difficulty: {
				type: DataTypes.ENUM('easy', 'medium', 'hard', 'insane'),
				allowNull: false,
				defaultValue: 'easy',
			},
			date_due: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM('open', 'inprogress', 'complete', 'archived'),
				allowNull: false,
				defaultValue: 'open',
			},
			assigned_to_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Users',
					key: 'id',
				},
				onDelete: 'SET NULL',
			},
			assigned_to_username: {
				type: DataTypes.STRING(150),
				allowNull: true,
			},
			completed_by_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Users',
					key: 'id',
				},
				onDelete: 'SET NULL',
			},
			completed_by_username: {
				type: DataTypes.STRING(150),
				allowNull: true,
			},
			task_xp: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 10,
				field: 'task_xp',
			},
		},
		{
			tableName: 'Tasks',
			timestamps: true,
			paranoid: true, // adds deletedAt (soft‑delete)
			underscored: true,
		}
	);
};
