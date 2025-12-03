export default (sequelize, DataTypes) => {
	return sequelize.define(
		'Achievement',
		{
			id: {
				type: DataTypes.INTEGER.UNSIGNED,
				primaryKey: true,
				autoIncrement: true,
			},
			code: {
				type: DataTypes.STRING(100),
				unique: true,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING(150),
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
		},
		{
			tableName: 'Achievements',
			timestamps: false,
			underscored: true,
		}
	);
};
