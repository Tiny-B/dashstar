export default (sequelize, DataTypes) =>
	sequelize.define(
		'workspaces',
		{
			id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
			name: { type: DataTypes.STRING(150), allowNull: false },
			owner_user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
			join_code: { type: DataTypes.STRING(64), allowNull: true, unique: true },
			join_code_expires_at: { type: DataTypes.DATE, allowNull: true },
			created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
			updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
		},
		{ timestamps: false }
	);
