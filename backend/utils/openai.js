const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Token and cost tracking
// Prices per 1K tokens (as of 2024)
const PRICING = {
  'gpt-4o-mini': {
    input: 0.15 / 1000,  // $0.15 per 1M input tokens
    output: 0.60 / 1000  // $0.60 per 1M output tokens
  },
  'gpt-4o': {
    input: 2.50 / 1000,  // $2.50 per 1M input tokens
    output: 10.00 / 1000 // $10.00 per 1M output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.50 / 1000,  // $0.50 per 1M input tokens
    output: 1.50 / 1000  // $1.50 per 1M output tokens
  }
};

// Use gpt-4o-mini for cost efficiency
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Calculate cost based on token usage
 */
function calculateCost(model, usage) {
  const pricing = PRICING[model] || PRICING[DEFAULT_MODEL];
  const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
  const outputCost = (usage.completion_tokens / 1000) * pricing.output;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    tokens: {
      prompt: usage.prompt_tokens,
      completion: usage.completion_tokens,
      total: usage.total_tokens
    }
  };
}

/**
 * Summarize conversation history efficiently
 * Returns a compact summary that preserves key information
 */
function summarizeConversationHistory(conversation) {
  const steps = conversation.steps || [];
  if (steps.length === 0) {
    return '';
  }

  // Always include first step (initial assessment)
  const firstStep = steps[0];
  let summary = `Modül: ${conversation.moduleTitle}\n`;
  
  if (firstStep.step_type === 'initial') {
    // Extract key traits and feedback from initial step
    const traits = firstStep.traits || {};
    const traitKeys = Object.keys(traits).slice(0, 3); // Top 3 traits
    const traitSummary = traitKeys.map(k => `${k}:${traits[k]}`).join(', ');
    
    summary += `Başlangıç: ${firstStep.feedback?.substring(0, 80) || 'Değerlendirme yapıldı'}${traitSummary ? ` [${traitSummary}]` : ''}\n`;
  }

  // For continuation steps, summarize intelligently
  if (steps.length > 1) {
    const continuationSteps = steps.slice(1);
    
    // If too many steps, summarize middle ones
    if (continuationSteps.length > 3) {
      // First continuation
      const firstCont = continuationSteps[0];
      summary += `Adım1: ${firstCont.situation?.substring(0, 60) || ''} → ${firstCont.feedback?.substring(0, 60) || ''}\n`;
      
      // Middle summary (if more than 3 steps)
      if (continuationSteps.length > 3) {
        const middleCount = continuationSteps.length - 2;
        summary += `...${middleCount} adım daha...\n`;
      }
      
      // Last continuation
      const lastCont = continuationSteps[continuationSteps.length - 1];
      summary += `Son: ${lastCont.situation?.substring(0, 60) || ''} → ${lastCont.feedback?.substring(0, 60) || ''}\n`;
    } else {
      // If 3 or fewer, include all
      continuationSteps.forEach((step, idx) => {
        summary += `Adım${idx + 1}: ${step.situation?.substring(0, 60) || ''} → ${step.feedback?.substring(0, 60) || ''}\n`;
      });
    }
  }

  return summary;
}

/**
 * Generate optimized prompt for conversation continuation
 * Minimizes token usage while maintaining essential context
 */
function buildConversationPrompt(conversation, newSituation) {
  // Get summarized history (token-efficient)
  const context = summarizeConversationHistory(conversation);
  
  // Ultra-compact prompt with strict token limits
  const prompt = `Kariyer simülasyonu devamı.

Geçmiş özeti:
${context}

Yeni durum: ${newSituation.substring(0, 300)}

JSON döndür (kısa ve öz):
{
  "feedback": "Max 100 kelime geri bildirim",
  "actionPlan": ["Kısa aksiyon 1", "Kısa aksiyon 2", "Kısa aksiyon 3"],
  "traits": {"skill1": 7, "skill2": 8},
  "totalScore": 75
}`;

  return prompt;
}

/**
 * Generate conversation continuation using OpenAI
 */
async function generateConversationResponse(conversation, newSituation) {
  // Check if OpenAI is configured
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here' || apiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY is not set or is invalid. Please set it in .env.prod file.');
    }
    throw new Error('OpenAI client not initialized');
  }

  const prompt = buildConversationPrompt(conversation, newSituation);

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Kariyer danışmanı. Türkçe, kısa ve öz. JSON döndür. Feedback max 100 kelime, actionPlan kısa maddeler.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400, // Reduced from 500 to save tokens
      response_format: { type: 'json_object' }
    });

    const usage = response.usage;
    const cost = calculateCost(DEFAULT_MODEL, usage);
    
    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedResponse = {
        feedback: response.choices[0].message.content,
        actionPlan: [],
        traits: {},
        totalScore: 75
      };
    }

    return {
      ...parsedResponse,
      _cost: cost,
      _model: DEFAULT_MODEL
    };
  } catch (error) {
    // Handle specific error types
    if (error.status === 429) {
      if (error.code === 'insufficient_quota' || error.type === 'insufficient_quota') {
        console.error('[OpenAI] Quota exceeded - falling back to simple analysis');
        throw new Error('QUOTA_EXCEEDED');
      } else {
        console.error('[OpenAI] Rate limit exceeded - too many requests');
        throw new Error('RATE_LIMIT');
      }
    } else if (error.status === 401) {
      console.error('[OpenAI] Invalid API key');
      throw new Error('INVALID_API_KEY');
    } else if (error.status === 500 || error.status === 503) {
      console.error('[OpenAI] Service unavailable');
      throw new Error('SERVICE_UNAVAILABLE');
    }
    
    console.error('OpenAI API Error:', error);
    throw new Error(`AI yanıt oluşturulamadı: ${error.message}`);
  }
}

/**
 * Log usage to database (optional, for analytics)
 */
async function logUsage(userId, model, cost, tokens, conversationId) {
  // This can be implemented later for analytics
  // For now, we'll just log to console
  console.log(`[OpenAI Usage] User: ${userId}, Model: ${model}, Cost: $${cost.totalCost.toFixed(4)}, Tokens: ${tokens.total} (input: ${tokens.prompt}, output: ${tokens.completion})`);
}

/**
 * Estimate token count for a text (rough approximation)
 * OpenAI uses ~4 characters per token for Turkish text
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Get conversation summary stats for monitoring
 */
function getConversationStats(conversation) {
  const steps = conversation.steps || [];
  const totalSteps = steps.length;
  const hasInitial = steps.some(s => s.step_type === 'initial');
  const continuationCount = steps.filter(s => s.step_type === 'continuation').length;
  
  // Estimate total tokens in conversation history
  let estimatedTokens = 0;
  steps.forEach(step => {
    estimatedTokens += estimateTokens(step.feedback || '');
    estimatedTokens += estimateTokens(step.situation || '');
    if (step.actionPlan) {
      step.actionPlan.forEach(plan => {
        estimatedTokens += estimateTokens(plan);
      });
    }
  });
  
  return {
    totalSteps,
    hasInitial,
    continuationCount,
    estimatedTokens
  };
}

module.exports = {
  generateConversationResponse,
  calculateCost,
  logUsage,
  summarizeConversationHistory,
  estimateTokens,
  getConversationStats,
  DEFAULT_MODEL
};

