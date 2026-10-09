const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_wo6aG3efBYvI@ep-proud-hat-b3x3e46f.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)');
    await pool.query('UPDATE users SET password = \'pw123\' WHERE password IS NULL');
    await pool.query('ALTER TABLE users ALTER COLUMN password SET NOT NULL');
    await pool.query('ALTER TABLE users DROP COLUMN IF EXISTS password_hash');
    
    // Seed any missing users if needed
    await pool.query(`
      INSERT INTO users (email, password, role) VALUES 
      ('admin', 'pw123', 'admin'),
      ('manager', 'pw123', 'manager'),
      ('staff', 'pw123', 'staff')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
    `);

    console.log('Successfully altered users table');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
