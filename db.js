const { Pool } = require('pg');

// Replace with your own PostgreSQL connection details
const pool = new Pool({
  user: 'isisnava',
  host: 'localhost',
  database: 'company_db',
  password: 'Iskanalu12',
  port: 5432,
});

module.exports = pool;