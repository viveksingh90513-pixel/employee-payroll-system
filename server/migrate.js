require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'payroll_pro',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    multipleStatements: true,
  };

  try {
    console.log('Connecting to Aiven MySQL...');
    const conn = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove CREATE DATABASE and USE statements
    schema = schema.replace(/CREATE DATABASE.*?;/gi, '').replace(/USE\s+\w+;/gi, '');

    console.log('Running schema...');
    await conn.query(schema);
    console.log('Schema created.');

    // Read seed file
    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    let seed = fs.readFileSync(seedPath, 'utf8');
    seed = seed.replace(/USE\s+\w+;/gi, '');

    console.log('Running seed data...');
    await conn.query(seed);
    console.log('Seed data inserted.');

    await conn.end();
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
