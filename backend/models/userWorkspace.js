export default (sequelize, DataTypes) => {
	return sequelize.define(
		'UserWorkspace',
		{
			user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Users', key: 'id' },
				onDelete: 'CASCADE',
			},
			workspace_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Workspaces', key: 'id' },
				onDelete: 'CASCADE',
			},
			role: {
				type: DataTypes.ENUM('admin', 'member'), // admin or member
				allowNull: false,
				defaultValue: 'member',
			},
		},
		{
			tableName: 'UserWorkspace',
			timestamps: true,
			underscored: true,
		}
	);
};
