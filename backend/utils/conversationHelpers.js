const pool = require('./db');

// Generate conversation ID
function generateConversationId() {
  return 'conv_' + Math.random().toString(36).substr(2, 9);
}

// Create a new conversation
async function createConversation(userId, moduleId, moduleTitle) {
  try {
    const conversationId = generateConversationId();
    
    await pool.query(
      `INSERT INTO conversations (id, user_id, module_id, module_title)
       VALUES ($1, $2, $3, $4)`,
      [conversationId, parseInt(userId), moduleId, moduleTitle]
    );
    
    return conversationId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

// Add a step to a conversation
async function addConversationStep(conversationId, stepData) {
  try {
    const {
      stepNumber,
      stepType,
      answers,
      situation,
      feedback,
      actionPlan,
      actionPlanOriginal,
      traits,
      totalScore,
      aiUsage
    } = stepData;
    
    await pool.query(
      `INSERT INTO conversation_steps 
       (conversation_id, step_number, step_type, answers, situation, feedback, action_plan, action_plan_original, traits, total_score, ai_usage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        conversationId,
        stepNumber,
        stepType,
        answers ? JSON.stringify(answers) : null,
        situation || null,
        feedback,
        actionPlan || [],
        actionPlanOriginal || actionPlan || [], // Store original if provided
        traits ? JSON.stringify(traits) : null,
        totalScore,
        aiUsage ? JSON.stringify(aiUsage) : null
      ]
    );
    
    // Update conversation updated_at
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );
  } catch (error) {
    console.error('Error adding conversation step:', error);
    throw error;
  }
}

// Get conversation by ID
async function getConversationById(conversationId, userId = null) {
  try {
    const convResult = await pool.query(
      `SELECT c.*, m.title as module_title 
       FROM conversations c
       LEFT JOIN modules m ON c.module_id = m.id
       WHERE c.id = $1`,
      [conversationId]
    );
    
    if (convResult.rows.length === 0) {
      return null;
    }
    
    const conversation = convResult.rows[0];
    
    // Check if user has access
    if (userId && conversation.user_id !== parseInt(userId)) {
      return null;
    }
    
    // Get steps
    const stepsResult = await pool.query(
      `SELECT * FROM conversation_steps 
       WHERE conversation_id = $1 
       ORDER BY step_number ASC`,
      [conversationId]
    );
    
    const steps = stepsResult.rows.map(row => {
      const step = {
        stepNumber: row.step_number,
        type: row.step_type,
        answers: row.answers ? (typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers) : null,
        situation: row.situation,
        feedback: row.feedback,
        actionPlan: row.action_plan || [],
        traits: row.traits ? (typeof row.traits === 'string' ? JSON.parse(row.traits) : row.traits) : null,
        totalScore: row.total_score,
        timestamp: row.timestamp
      };
      
      // Include original action plan if available (for tier upgrades)
      if (row.action_plan_original && row.action_plan_original.length > 0) {
        step.actionPlanOriginal = row.action_plan_original;
      }
      
      // Include AI usage data if available
      if (row.ai_usage) {
        step.aiUsage = typeof row.ai_usage === 'string' ? JSON.parse(row.ai_usage) : row.ai_usage;
      }
      
      return step;
    });
    
    return {
      id: conversation.id,
      userId: conversation.user_id,
      moduleId: conversation.module_id,
      moduleTitle: conversation.module_title || conversation.module_title,
      steps: steps,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
}

// Get all conversations for a user
async function getUserConversations(userId) {
  try {
    const result = await pool.query(
      `SELECT c.*, m.title as module_title,
       (SELECT COUNT(*) FROM conversation_steps WHERE conversation_id = c.id) as steps_count,
       (SELECT total_score FROM conversation_steps 
        WHERE conversation_id = c.id 
        ORDER BY step_number DESC LIMIT 1) as last_score,
       (SELECT feedback FROM conversation_steps 
        WHERE conversation_id = c.id 
        ORDER BY step_number DESC LIMIT 1) as last_feedback
       FROM conversations c
       LEFT JOIN modules m ON c.module_id = m.id
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC`,
      [parseInt(userId)]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      moduleId: row.module_id,
      moduleTitle: row.module_title || row.module_title,
      stepsCount: parseInt(row.steps_count) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastStep: row.last_score ? {
        feedback: row.last_feedback,
        totalScore: row.last_score
      } : null
    }));
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
}

module.exports = {
  generateConversationId,
  createConversation,
  addConversationStep,
  getConversationById,
  getUserConversations
};

