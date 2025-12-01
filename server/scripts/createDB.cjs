require('dotenv').config();
const { execSync } = require('child_process');

const { DB_HOST, DB_PORT, DB_USER, DB_PASS } = process.env;

const cmd = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} -e "SOURCE server/db/create.sql;"`;
execSync(cmd, { stdio: 'inherit', shell: true });
