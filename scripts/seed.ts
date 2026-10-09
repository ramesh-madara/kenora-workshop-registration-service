import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

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

export async function seedAdminUser(customPool?: Pool) {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workshop-db';
  const pool = customPool || new Pool({ connectionString });

  try {
    const username = 'admin';
    const plainPassword = 'pw123';
    const role = 'admin';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    // Upsert admin user
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role
      RETURNING id, email, role, created_at;
    `;

    const res = await pool.query(query, [username, passwordHash, role]);
    console.log(`[Seed] Successfully seeded admin user:`, {
      id: res.rows[0].id,
      username: res.rows[0].email,
      role: res.rows[0].role,
    });
    return res.rows[0];
  } catch (error) {
    console.error('[Seed] Error seeding admin user:', error);
    throw error;
  } finally {
    if (!customPool) {
      await pool.end();
    }
  }
}

// Run directly if invoked via CLI
if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seedAdminUser()
    .then(() => {
      console.log('Admin user seeding completed.');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
