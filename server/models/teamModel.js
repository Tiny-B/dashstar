export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Team',
		{
			id: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			workspace_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: {
					model: 'Workspaces',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			admin_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: {
					model: 'Users',
					key: 'id',
				},
				onDelete: 'RESTRICT',
			},
		},
		{
			tableName: 'Teams',
			timestamps: true,
			underscored: true,
			indexes: [
				{
					unique: true,
					fields: ['workspace_id', 'name'],
				},
			],
		}
	);
};
