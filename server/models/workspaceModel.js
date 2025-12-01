export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Workspace',
		{
			id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			code: {
				type: DataTypes.STRING(64),
				unique: true,
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
			tableName: 'Workspaces',
			timestamps: true,
			underscored: true,
		}
	);
};
