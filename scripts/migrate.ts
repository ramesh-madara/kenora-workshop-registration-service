import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { seedAdminUser } from './seed';

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

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workshop-db';
  console.log(`Connecting to Postgres database at: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const schemaSqlPath = path.resolve(process.cwd(), 'schema.sql');
    if (!fs.existsSync(schemaSqlPath)) {
      throw new Error(`Schema file not found at ${schemaSqlPath}`);
    }

    const sql = fs.readFileSync(schemaSqlPath, 'utf8');
    console.log('Applying schema.sql...');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('Successfully applied schema.sql migrations to Postgres!');

    console.log('Running automatic admin seeder...');
    await seedAdminUser(pool);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
