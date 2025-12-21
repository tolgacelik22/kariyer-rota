/**
 * Migration: Add action_plan_original and ai_usage columns to conversation_steps
 * Run this once to update existing database
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'kariyerrota',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add action_plan_original column if it doesn't exist
    await client.query(`
      ALTER TABLE conversation_steps 
      ADD COLUMN IF NOT EXISTS action_plan_original TEXT[]
    `);
    
    // Add ai_usage column if it doesn't exist
    await client.query(`
      ALTER TABLE conversation_steps 
      ADD COLUMN IF NOT EXISTS ai_usage JSONB
    `);
    
    // Copy existing action_plan to action_plan_original for existing records
    await client.query(`
      UPDATE conversation_steps 
      SET action_plan_original = action_plan 
      WHERE action_plan_original IS NULL AND action_plan IS NOT NULL
    `);
    
    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);

