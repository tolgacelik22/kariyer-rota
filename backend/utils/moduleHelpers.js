const pool = require('./db');

// Get all modules from database
async function getAllModules() {
  try {
    const result = await pool.query(
      'SELECT id, category, title, description, icon, display_order FROM modules ORDER BY display_order, id'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting all modules:', error);
    return [];
  }
}

// Get module by ID with questions by level
async function getModuleById(moduleId, userLevel = 1) {
  try {
    // Get module info
    const moduleResult = await pool.query(
      'SELECT id, category, title, description, icon FROM modules WHERE id = $1',
      [moduleId]
    );

    if (moduleResult.rows.length === 0) {
      return null;
    }

    const module = moduleResult.rows[0];

    // Get questions for the specified level
    const questionsResult = await pool.query(
      `SELECT question_id, question_text, options, display_order 
       FROM module_questions 
       WHERE module_id = $1 AND level = $2 
       ORDER BY display_order, question_id`,
      [moduleId, userLevel]
    );

    // Parse options JSON
    const questions = questionsResult.rows.map(row => ({
      id: row.question_id,
      text: row.question_text,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
    }));

    return {
      id: module.id,
      category: module.category,
      title: module.title,
      description: module.description,
      icon: module.icon,
      questions: questions
    };
  } catch (error) {
    console.error('Error getting module:', error);
    return null;
  }
}

// Get questions for a specific module and level
async function getModuleQuestions(moduleId, level) {
  try {
    const result = await pool.query(
      `SELECT question_id, question_text, options, display_order 
       FROM module_questions 
       WHERE module_id = $1 AND level = $2 
       ORDER BY display_order, question_id`,
      [moduleId, level]
    );

    return result.rows.map(row => ({
      id: row.question_id,
      text: row.question_text,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
    }));
  } catch (error) {
    console.error('Error getting module questions:', error);
    return [];
  }
}

// Get all questions for a module (all levels) - for admin/management
async function getAllModuleQuestions(moduleId) {
  try {
    const result = await pool.query(
      `SELECT level, question_id, question_text, options, display_order 
       FROM module_questions 
       WHERE module_id = $1 
       ORDER BY level, display_order, question_id`,
      [moduleId]
    );

    const questionsByLevel = {
      level1: [],
      level2: [],
      level3: []
    };

    result.rows.forEach(row => {
      const levelKey = `level${row.level}`;
      if (questionsByLevel[levelKey]) {
        questionsByLevel[levelKey].push({
          id: row.question_id,
          text: row.question_text,
          options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
        });
      }
    });

    return questionsByLevel;
  } catch (error) {
    console.error('Error getting all module questions:', error);
    return { level1: [], level2: [], level3: [] };
  }
}

module.exports = {
  getAllModules,
  getModuleById,
  getModuleQuestions,
  getAllModuleQuestions
};

