export default (sequelize, DataTypes) => {
	const UserAchievement = sequelize.define(
		'UserAchievement',
		{
			user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Users', key: 'id' },
				onDelete: 'CASCADE',
				primaryKey: true,
			},
			achievement_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Achievements', key: 'id' },
				onDelete: 'CASCADE',
				primaryKey: true,
			},
			awarded_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: 'UserAchievements',
			timestamps: false,
			underscored: true,
			id: false,
		}
	);
	UserAchievement.removeAttribute('id');
	return UserAchievement;
};
