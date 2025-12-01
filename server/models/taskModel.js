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
			date_due: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM('open', 'inprogress', 'complete'),
				allowNull: false,
				defaultValue: 'open',
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
