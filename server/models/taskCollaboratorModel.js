export default (sequelize, DataTypes) => {
	const TaskCollaborator = sequelize.define(
		'TaskCollaborator',
		{
			task_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Tasks', key: 'id' },
				onDelete: 'CASCADE',
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Users', key: 'id' },
				onDelete: 'CASCADE',
				primaryKey: true,
			},
			invited_by_user_id: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
				references: { model: 'Users', key: 'id' },
				onDelete: 'SET NULL',
			},
			status: {
				type: DataTypes.ENUM('invited', 'accepted', 'declined'),
				allowNull: false,
				defaultValue: 'accepted',
			},
			role: {
				type: DataTypes.ENUM('participant', 'admin'),
				allowNull: false,
				defaultValue: 'participant',
			},
		},
		{
			tableName: 'TaskCollaborators',
			timestamps: true,
			underscored: true,
			id: false,
		}
	);

	TaskCollaborator.removeAttribute('id');
	return TaskCollaborator;
};
