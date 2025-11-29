export default (sequelize, DataTypes) => {
	return sequelize.define(
		'User',
		{
			id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: DataTypes.STRING(50),
				unique: true,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING(150),
				unique: true,
				allowNull: false,
			},
			password_hash: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			role: {
				type: DataTypes.ENUM('admin', 'user'),
				defaultValue: 'user',
				allowNull: false,
			},
			level: {
				type: DataTypes.INTEGER.UNSIGNED,
				defaultValue: 1,
				allowNull: false,
			},
			xp: {
				type: DataTypes.INTEGER.UNSIGNED,
				defaultValue: 0,
				allowNull: false,
			},
			theme: {
				type: DataTypes.STRING(50),
				defaultValue: 'dark',
				allowNull: false,
			},
			avatar_url: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
		},
		{
			tableName: 'Users',
			timestamps: true,
			paranoid: true,
			underscored: true,
		}
	);
};
