export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Message',
		{
			id: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			task_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Tasks',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			team_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Teams',
					key: 'id',
				},
				onDelete: 'SET NULL',
			},
			workspace_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Workspaces',
					key: 'id',
				},
				onDelete: 'SET NULL',
			},
			sender_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: {
					model: 'Users',
					key: 'id',
				},
				onDelete: 'RESTRICT',
			},
			recipient_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: {
					model: 'Users',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: 'Messages',
			timestamps: false,
			underscored: true,
			indexes: [
				{ fields: ['task_id'] },
				{ fields: ['team_id'] },
				{ fields: ['workspace_id'] },
				{ fields: ['sender_user_id', 'recipient_user_id'] },
			],
		}
	);
};
