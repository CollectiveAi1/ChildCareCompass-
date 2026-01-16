import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🔨 Initializing database...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Create default center
    const centerResult = await pool.query(
      `INSERT INTO centers (name, address, phone, email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Demo Childcare Center', '123 Main St, Anytown, USA', '555-0100', 'info@democenter.com']
    );

    let centerId;
    if (centerResult.rows.length > 0) {
      centerId = centerResult.rows[0].id;
      console.log('✅ Default center created');
    } else {
      const existing = await pool.query(`SELECT id FROM centers LIMIT 1`);
      centerId = existing.rows[0]?.id;
    }

    // Create default users
    const passwordHash = await bcrypt.hash('demo123', 10);

    const users = [
      { email: 'admin@demo.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User' },
      { email: 'teacher@demo.com', role: 'TEACHER', firstName: 'Sarah', lastName: 'Teacher' },
      { email: 'parent@demo.com', role: 'PARENT', firstName: 'Parent', lastName: 'User' },
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (center_id, email, password_hash, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [centerId, user.email, passwordHash, user.role, user.firstName, user.lastName]
      );
    }
    console.log('✅ Default users created');

    // Create classrooms
    const classroomIds: any = {};
    const classrooms = [
      { name: 'Toddlers 1A', capacity: 12, ageGroup: '1-2 years' },
      { name: 'Infants', capacity: 8, ageGroup: '0-1 years' },
    ];

    for (const classroom of classrooms) {
      const result = await pool.query(
        `INSERT INTO classrooms (center_id, name, capacity, age_group)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [centerId, classroom.name, classroom.capacity, classroom.ageGroup]
      );
      if (result.rows.length > 0) {
        classroomIds[classroom.name] = result.rows[0].id;
      }
    }
    console.log('✅ Classrooms created');

    console.log('\n🎉 Database initialization complete!');
    console.log('\n📝 Demo credentials:');
    console.log('   Admin: admin@demo.com / demo123');
    console.log('   Teacher: teacher@demo.com / demo123');
    console.log('   Parent: parent@demo.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
