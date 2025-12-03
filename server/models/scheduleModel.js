export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Schedule',
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
			start_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			end_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM('planned', 'active', 'complete', 'cancelled'),
				allowNull: false,
				defaultValue: 'planned',
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			tableName: 'Schedules',
			timestamps: false,
			underscored: true,
		}
	);
};
