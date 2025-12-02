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
			name: {
				type: DataTypes.STRING(150),
				allowNull: false,
				defaultValue: 'Workspace',
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
