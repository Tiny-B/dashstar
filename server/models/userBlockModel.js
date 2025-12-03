export default (sequelize, DataTypes) => {
	const UserBlock = sequelize.define(
		'UserBlock',
		{
			user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Users', key: 'id' },
				onDelete: 'CASCADE',
				primaryKey: true,
			},
			blocked_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Users', key: 'id' },
				onDelete: 'CASCADE',
				primaryKey: true,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: 'UserBlocks',
			timestamps: false,
			underscored: true,
			id: false,
		}
	);
	UserBlock.removeAttribute('id');
	return UserBlock;
};
