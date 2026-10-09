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

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workshop-db';
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Drop existing constraints
    await client.query('ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check');
    await client.query('ALTER TABLE registration_history DROP CONSTRAINT IF EXISTS registration_history_action_check');
    
    // Add new constraints
    await client.query("ALTER TABLE registrations ADD CONSTRAINT registrations_status_check CHECK (status IN ('active', 'cancelled', 'waitlisted'))");
    await client.query("ALTER TABLE registration_history ADD CONSTRAINT registration_history_action_check CHECK (action IN ('registered', 'cancelled', 'waitlisted', 'promoted'))");
    
    await client.query('COMMIT');
    console.log("Successfully updated constraints for Waitlist feature.");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
