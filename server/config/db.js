/**
 * PayRoll Pro – Database Configuration
 * MySQL2 connection pool with promise wrapper.
 * Handles database creation and schema initialization on first run.
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Create a connection pool for MySQL database.
 * Uses environment variables for configuration with sensible defaults.
 */
// SSL config for cloud-hosted MySQL (Railway, Aiven, PlanetScale, etc.)
const sslConfig = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false }
  : false;

const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.MYSQLPORT || process.env.DB_PORT, 10) || 3306;
const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'payroll_pro';

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: sslConfig,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  connectTimeout: 30000,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Timezone handling for consistent date/time operations
  timezone: '+05:30',
  // Return date fields as strings to avoid timezone conversion issues
  dateStrings: true,
});

/**
 * Initialize the database by creating it if it doesn't exist
 * and running the schema SQL file.
 * @returns {Promise<void>}
 */
const initializeDatabase = async () => {
  let connection;
  try {
    // Create a temporary connection without specifying a database
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      ssl: sslConfig,
      multipleStatements: true,
    });

    const dbName = process.env.DB_NAME || 'payroll_pro';

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    // Check if tables already exist by looking for the users table
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [dbName]
    );

    if (tables.length === 0) {
      // Tables don't exist – run the schema SQL file
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Remove CREATE DATABASE and USE statements since we've already selected the DB
        const cleanSchema = schema
          .replace(/CREATE DATABASE.*?;/gi, '')
          .replace(/USE\s+\w+;/gi, '');

        await connection.query(cleanSchema);
        console.log('✅ Database schema created successfully');
      } else {
        console.warn('⚠️  Schema file not found at:', schemaPath);
      }
    } else {
      console.log('✅ Database tables already exist');
    }

    // Auto-migrate new authentication & attendance columns
    try {
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
        [dbName]
      );
      const existingCols = columns.map(c => c.COLUMN_NAME);

      if (!existingCols.includes('is_first_login')) {
        await connection.query(`ALTER TABLE users ADD COLUMN is_first_login TINYINT(1) NOT NULL DEFAULT 1`);
        console.log('✅ Migrated column is_first_login to users table');
      }
      if (!existingCols.includes('otp')) {
        await connection.query(`ALTER TABLE users ADD COLUMN otp VARCHAR(10) DEFAULT NULL`);
        console.log('✅ Migrated column otp to users table');
      }
      if (!existingCols.includes('otp_expiry')) {
        await connection.query(`ALTER TABLE users ADD COLUMN otp_expiry DATETIME DEFAULT NULL`);
        console.log('✅ Migrated column otp_expiry to users table');
      }

      // Attendance Table Migrations
      const [attCols] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'attendance'`,
        [dbName]
      );
      const attColNames = attCols.map(c => c.COLUMN_NAME);

      if (!attColNames.includes('check_in_lat')) {
        await connection.query(`ALTER TABLE attendance 
          ADD COLUMN check_in_lat DECIMAL(10,8) DEFAULT NULL,
          ADD COLUMN check_in_lng DECIMAL(11,8) DEFAULT NULL,
          ADD COLUMN check_in_address VARCHAR(255) DEFAULT NULL,
          ADD COLUMN check_out_lat DECIMAL(10,8) DEFAULT NULL,
          ADD COLUMN check_out_lng DECIMAL(11,8) DEFAULT NULL,
          ADD COLUMN check_out_address VARCHAR(255) DEFAULT NULL,
          ADD COLUMN late_minutes INT DEFAULT 0,
          ADD COLUMN early_exit_minutes INT DEFAULT 0,
          ADD COLUMN overtime_hours DECIMAL(5,2) DEFAULT 0.00,
          ADD COLUMN shift_name VARCHAR(50) DEFAULT 'General Shift'`);
        console.log('✅ Migrated GPS, Shift, Late & Overtime columns to attendance table');
      }
    } catch (migErr) {
      console.warn('⚠️ Column migration check warning:', migErr.message);
    }

    console.log(`✅ Connected to MySQL database: ${dbName}`);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * Test the connection pool by acquiring and releasing a connection.
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection pool is active');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection pool test failed:', error.message);
    return false;
  }
};

module.exports = { pool, initializeDatabase, testConnection };
