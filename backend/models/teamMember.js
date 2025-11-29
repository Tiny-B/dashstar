export default (sequelize, DataTypes) => {
	return sequelize.define(
		'TeamMember',
		{
			team_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				references: { model: 'Teams', key: 'id' },
				onDelete: 'CASCADE',
			},
			user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				references: { model: 'Users', key: 'id' },
				onDelete: 'CASCADE',
			},
		},
		{
			tableName: 'TeamMembers',
			timestamps: true,
			underscored: true,
		}
	);
};
