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
 * Generate optimized prompt for conversation continuation
 * Minimizes token usage while maintaining context
 */
function buildConversationPrompt(conversation, newSituation) {
  // Extract only essential context (last 2-3 steps to save tokens)
  const recentSteps = conversation.steps.slice(-2);
  
  // Build compact context
  let context = `Modül: ${conversation.moduleTitle}\n`;
  
  recentSteps.forEach((step, idx) => {
    if (step.step_type === 'initial') {
      context += `Başlangıç: ${step.feedback?.substring(0, 100)}...\n`;
    } else {
      context += `Adım ${step.step_number}: ${step.situation?.substring(0, 80)}... → ${step.feedback?.substring(0, 100)}...\n`;
    }
  });
  
  // Ultra-compact prompt
  const prompt = `Kariyer simülasyonu. Önceki: ${context}Yeni durum: ${newSituation}

JSON döndür:
{
  "feedback": "Kısa geri bildirim (max 150 kelime)",
  "actionPlan": ["Aksiyon 1", "Aksiyon 2", "Aksiyon 3"],
  "traits": {"skill1": 7, "skill2": 8},
  "totalScore": 75
}`;

  return prompt;
}

/**
 * Generate conversation continuation using OpenAI
 */
async function generateConversationResponse(conversation, newSituation) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const prompt = buildConversationPrompt(conversation, newSituation);

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Kariyer danışmanı. Türkçe, kısa ve öz cevaplar ver. JSON formatında döndür.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500, // Limit output tokens to save cost
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
  console.log(`[OpenAI Usage] User: ${userId}, Model: ${model}, Cost: $${cost.totalCost.toFixed(4)}, Tokens: ${tokens.total}`);
}

module.exports = {
  generateConversationResponse,
  calculateCost,
  logUsage,
  DEFAULT_MODEL
};

