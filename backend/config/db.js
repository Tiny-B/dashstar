import 'dotenv/config';
import Sequelize from 'sequelize';

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
	host: DB_HOST,
	dialect: 'mysql',
	port: DB_PORT,
	logging: console.log,
});

export default sequelize;
