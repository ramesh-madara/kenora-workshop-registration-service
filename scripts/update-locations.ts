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
    
    await client.query("UPDATE workshops SET location = 'Colombo' WHERE location IN ('Room 101', 'Auditorium')");
    await client.query("UPDATE workshops SET location = 'Nugegoda' WHERE location = 'Lab A'");
    await client.query("UPDATE workshops SET location = 'Mount Lavinia' WHERE location IN ('Studio B', 'Gymnasium')");
    
    await client.query('COMMIT');
    console.log("Successfully updated existing workshop locations to Colombo area cities.");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
