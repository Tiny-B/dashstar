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
			full_name: {
				type: DataTypes.STRING(150),
				allowNull: true,
			},
			phone: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			country: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			city: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			timezone: {
				type: DataTypes.STRING(100),
				allowNull: true,
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
			numTasksCompleted: {
				type: DataTypes.INTEGER.UNSIGNED,
				defaultValue: 0,
				allowNull: false,
				field: 'numTasksCompleted',
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
			timestamps: false,
			paranoid: true,
			underscored: true,
		}
	);
};
