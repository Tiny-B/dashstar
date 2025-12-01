export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Message',
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
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: 'Messages',
			timestamps: true, // adds createdAt / updatedAt
			underscored: true,
		}
	);
};
