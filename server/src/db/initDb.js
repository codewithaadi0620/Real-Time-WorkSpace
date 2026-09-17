const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeDatabase() {
  try {
    console.log('🔄 Checking database initialization state...');
    
    // Check if tables already exist
    const checkRes = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tablesExist = checkRes.rows[0].exists;

    if (!tablesExist) {
      console.log('🚀 Running database schema migration (001_init_schema.sql)...');
      const migrationPath = path.resolve(__dirname, '../../../database/migrations/001_init_schema.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await db.query(migrationSql);
      console.log('✅ Schema migration completed.');

      console.log('🌱 Seeding demo database data (001_seed_demo_data.sql)...');
      const seedPath = path.resolve(__dirname, '../../../database/seed/001_seed_demo_data.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await db.query(seedSql);
      console.log('✅ Demo data seeded successfully.');
    } else {
      console.log('ℹ️ Database tables already present. Skipping migration and seed.');
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    // Don't crash hard if migrations fail due to transient issue; log and continue
  }
}

module.exports = initializeDatabase;
