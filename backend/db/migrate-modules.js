/**
 * Migration Script: Import modules from data_v2.js to database
 * Run this once to populate the database with module data
 */

const pool = require('../utils/db');
const modules = require('../data_v2');

async function migrateModules() {
  try {
    console.log('🔄 Modül verileri database\'e aktarılıyor...');

    // Clear existing modules (optional - comment out if you want to keep existing)
    // await pool.query('DELETE FROM module_questions');
    // await pool.query('DELETE FROM modules');

    for (const module of modules) {
      console.log(`📦 Modül ${module.id}: ${module.title} işleniyor...`);

      // Insert or update module
      const moduleResult = await pool.query(
        `INSERT INTO modules (id, category, title, description, icon, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           category = EXCLUDED.category,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           icon = EXCLUDED.icon,
           display_order = EXCLUDED.display_order,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [module.id, module.category, module.title, module.description, module.icon, module.id]
      );

      const moduleId = moduleResult.rows[0].id;

      // Insert questions by level
      if (module.questionsByLevel) {
        for (const [levelKey, questions] of Object.entries(module.questionsByLevel)) {
          const level = parseInt(levelKey.replace('level', ''));
          
          if (!Array.isArray(questions)) continue;

          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            await pool.query(
              `INSERT INTO module_questions (module_id, level, question_id, question_text, options, display_order)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (module_id, level, question_id) DO UPDATE SET
                 question_text = EXCLUDED.question_text,
                 options = EXCLUDED.options,
                 display_order = EXCLUDED.display_order`,
              [
                moduleId,
                level,
                question.id,
                question.text,
                JSON.stringify(question.options),
                i
              ]
            );
          }
        }
      }
    }

    console.log('✅ Tüm modüller başarıyla database\'e aktarıldı!');
    
    // Show summary
    const moduleCount = await pool.query('SELECT COUNT(*) FROM modules');
    const questionCount = await pool.query('SELECT COUNT(*) FROM module_questions');
    
    console.log(`📊 Özet:`);
    console.log(`   - Toplam Modül: ${moduleCount.rows[0].count}`);
    console.log(`   - Toplam Soru: ${questionCount.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  }
}

// Run migration
migrateModules();

