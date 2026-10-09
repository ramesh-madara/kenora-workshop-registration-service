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

export async function seedWorkshops(customPool?: Pool) {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workshop-db';
  const pool = customPool || new Pool({ connectionString });

  try {
    const types = [
      { name: 'Pottery Fundamentals', category: 'Arts & Crafts' },
      { name: 'Full-Stack Coding', category: 'Technology' },
      { name: 'HIIT Fitness', category: 'Health & Wellness' },
      { name: 'Yoga Retreat', category: 'Health & Wellness' },
      { name: 'Digital Painting', category: 'Arts & Crafts' }
    ];

    const typeIds: Record<string, number> = {};

    for (const t of types) {
      const res = await pool.query(
        'INSERT INTO workshop_types (name, category) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category RETURNING id',
        [t.name, t.category]
      );
      typeIds[t.name] = res.rows[0].id;
    }

    const locations = ['Colombo', 'Nugegoda', 'Mount Lavinia'];
    const instructors = ['Alice Smith', 'Bob Jones', 'Charlie Brown', 'Diana Prince', 'Evan Wright'];

    const countRes = await pool.query('SELECT COUNT(*) FROM workshops');
    if (parseInt(countRes.rows[0].count) > 0) {
      console.log('Workshops already exist, skipping seeding.');
      return;
    }

    const insertQuery = `
      INSERT INTO workshops (type_id, code, title, instructor, schedule_date, duration, capacity, status, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    for (let i = 0; i < 15; i++) {
      const typeKey = types[i % types.length].name;
      const typeId = typeIds[typeKey];
      const code = `WS-${1000 + i}`;
      const title = `${typeKey} Masterclass`;
      const instructor = instructors[i % instructors.length];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i + 1) * 2);
      futureDate.setHours(10 + (i % 5), 0, 0, 0);
      const capacity = 10 + (i % 3) * 10;
      const duration = 60 + (i % 3) * 30; // 60, 90, 120
      const status = 'published';
      const location = locations[i % 3];

      await pool.query(insertQuery, [
        typeId,
        code,
        title,
        instructor,
        futureDate,
        duration,
        capacity,
        status,
        location
      ]);
    }
    
    console.log('Successfully seeded 15 varied workshops.');
  } catch (error) {
    console.error('Error seeding workshops:', error);
    throw error;
  } finally {
    if (!customPool) {
      await pool.end();
    }
  }
}

if (require.main === module || process.argv[1]?.endsWith('seed-workshops.ts')) {
  seedWorkshops()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
