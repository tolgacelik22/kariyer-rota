const pool = require('./db');
const modules = require('../data_v2');

// Get user from database
async function getUserById(userId) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(userId)]);
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      tier: user.tier,
      lastLoginDate: user.last_login_date,
      completedModules: user.completed_modules || [],
      completedQuests: user.completed_quests || [],
      skills: user.skills || {}
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Get category progress for a user
function getCategoryLevel(completedCountInCategory) {
  if (completedCountInCategory === 0) return 1;
  if (completedCountInCategory === 1) return 2;
  return 3;
}

function getCategories() {
  const categories = new Set();
  modules.forEach(m => categories.add(m.category));
  return Array.from(categories);
}

function getCategoryProgress(user) {
  const categories = getCategories();
  const categoryProgress = {};
  
  categories.forEach(category => {
    const categoryModules = modules.filter(m => m.category === category);
    const completedInCategory = (user.completedModules || []).filter(moduleId => {
      return categoryModules.some(m => m.id === moduleId);
    });
    const completedCount = completedInCategory.length;
    const totalInCategory = categoryModules.length;
    const level = getCategoryLevel(completedCount);
    
    categoryProgress[category] = {
      completedCount,
      totalCount: totalInCategory,
      level,
      progressPercentage: (completedCount / totalInCategory) * 100
    };
  });
  
  return categoryProgress;
}

// Normalize skills to 0-100 scale
function normalizeSkillsTo100(skills) {
  if (!skills || typeof skills !== 'object') return {};
  
  const normalized = {};
  Object.entries(skills).forEach(([skillKey, skillData]) => {
    if (skillData && typeof skillData === 'object' && skillData.average !== undefined) {
      const average = skillData.average || 0;
      const normalizedAverage = average <= 10 ? average * 10 : average;
      const normalizedTotal = average <= 10 ? (skillData.total || 0) * 10 : (skillData.total || 0);
      
      normalized[skillKey] = {
        total: normalizedTotal,
        count: skillData.count || 1,
        average: normalizedAverage
      };
    }
  });
  return normalized;
}

// Get tier configuration
function getTierConfig(tier) {
  const TIERS = {
    FREE: {
      id: 'FREE',
      name: 'Free',
      dailyReward: 50,
      simCost: 50,
      canSeeActionPlan: false,
      canSeeAdvancedStats: false,
      color: '#9CA3AF'
    },
    BRONZE: {
      id: 'BRONZE',
      name: 'Bronze',
      dailyReward: 100,
      simCost: 40,
      canSeeActionPlan: true,
      canSeeAdvancedStats: false,
      color: '#CD7F32'
    },
    GOLD: {
      id: 'GOLD',
      name: 'Gold',
      dailyReward: 200,
      simCost: 25,
      canSeeActionPlan: true,
      canSeeAdvancedStats: true,
      color: '#F59E0B'
    },
    PLATINUM: {
      id: 'PLATINUM',
      name: 'Platinum',
      dailyReward: 500,
      simCost: 0,
      canSeeActionPlan: true,
      canSeeAdvancedStats: true,
      vipSupport: true,
      color: '#E5E7EB'
    }
  };
  return TIERS[tier] || TIERS.FREE;
}

module.exports = {
  getUserById,
  getCategoryProgress,
  normalizeSkillsTo100,
  getTierConfig,
  getCategoryLevel
};

