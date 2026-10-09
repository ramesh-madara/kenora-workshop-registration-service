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
  // Silence pg SSL warning
  const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workshop-db';
  const connectionString = rawUrl.replace('sslmode=require', 'sslmode=verify-full');
  
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id),
          action VARCHAR(50) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id INT,
          details TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query('COMMIT');
    console.log("Successfully created system_audit_logs table.");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
