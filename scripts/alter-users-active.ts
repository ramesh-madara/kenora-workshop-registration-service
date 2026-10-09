import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Automatically load .env.local or .env if present
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    if (typeof (process as any).loadEnvFile === 'function') {
      try { (process as any).loadEnvFile(envPath); } catch {}
    } else {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

async function runAlter() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workshop-db';
  console.log(`Connecting to Postgres database at: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log('Altering users table to add is_active column...');
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `);
    await client.query('COMMIT');
    console.log('Successfully added is_active column!');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Alter failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runAlter();
