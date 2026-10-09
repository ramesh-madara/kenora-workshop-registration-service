import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

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
    
    // Add duration column with default 60 minutes
    await client.query("ALTER TABLE workshops ADD COLUMN IF NOT EXISTS duration INT NOT NULL DEFAULT 60");
    
    // Seed existing workshops with random durations (60, 90, 120, 150)
    await client.query(`
      UPDATE workshops SET duration = 
      CASE (id % 4)
        WHEN 0 THEN 60
        WHEN 1 THEN 90
        WHEN 2 THEN 120
        ELSE 150
      END
    `);
    
    await client.query('COMMIT');
    console.log("Successfully added and seeded duration to workshops table.");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
