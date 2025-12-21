const express = require('express');
const cors = require('cors');
const pool = require('./utils/db');
const authRoutes = require('./routes/auth');
const { getAllModules, getModuleById, getModuleQuestions } = require('./utils/moduleHelpers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    console.log('⚠️  Server will continue but database operations may fail');
  });

// --- CONSTANTS & TIERS ---
const TIERS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    dailyReward: 50,
    simCost: 50,
    canSeeActionPlan: false,
    canSeeAdvancedStats: false,
    color: '#9CA3AF' // Gray
  },
  BRONZE: {
    id: 'BRONZE',
    name: 'Bronze',
    dailyReward: 100,
    simCost: 40, // Discounted cost
    canSeeActionPlan: true, // Basic action plan
    canSeeAdvancedStats: false,
    color: '#CD7F32' // Bronze
  },
  GOLD: {
    id: 'GOLD',
    name: 'Gold',
    dailyReward: 200,
    simCost: 25, // Heavily discounted
    canSeeActionPlan: true,
    canSeeAdvancedStats: true, // Detailed stats
    color: '#F59E0B' // Gold
  },
  PLATINUM: {
    id: 'PLATINUM',
    name: 'Platinum',
    dailyReward: 500,
    simCost: 0, // Free simulations!
    canSeeActionPlan: true,
    canSeeAdvancedStats: true,
    vipSupport: true,
    color: '#E5E7EB' // Platinum/Whiteish
  }
};

const INITIAL_BALANCE = 100;

// --- QUEST SYSTEM ---
const QUESTS = [
  {
    id: 'complete_3_modules',
    title: 'İlk Adımlar',
    description: '3 modül tamamla',
    requirement: 3,
    reward: 100,
    icon: '🎯'
  },
  {
    id: 'complete_5_modules',
    title: 'Yolun Yarısı',
    description: '5 modül tamamla',
    requirement: 5,
    reward: 250,
    icon: '⭐'
  },
  {
    id: 'complete_10_modules',
    title: 'Usta Ol',
    description: 'Tüm 10 modülü tamamla',
    requirement: 10,
    reward: 500,
    icon: '🏆'
  }
];

// Helper: Check and complete quests based on module count
const checkAndCompleteQuests = (user, completedCount) => {
  const newlyCompletedQuests = [];
  const rewards = [];
  
  if (!user.completedQuests) {
    user.completedQuests = [];
  }
  
  QUESTS.forEach(quest => {
    // Check if quest is not already completed
    if (!user.completedQuests.includes(quest.id)) {
      // Check if requirement is met
      if (completedCount >= quest.requirement) {
        user.completedQuests.push(quest.id);
        user.balance += quest.reward;
        newlyCompletedQuests.push(quest);
        rewards.push({
          questId: quest.id,
          questTitle: quest.title,
          reward: quest.reward
        });
      }
    }
  });
  
  return { newlyCompletedQuests, rewards, totalReward: rewards.reduce((sum, r) => sum + r.reward, 0) };
};

// --- USER LEVEL SYSTEM ---
// Calculate user level based on completed modules in a category
const getCategoryLevel = (completedCountInCategory) => {
  if (completedCountInCategory === 0) return 1; // Başlangıç (Hiç tamamlanmadı)
  if (completedCountInCategory === 1) return 2; // Orta (1 modül tamamlandı -> Seviye 2)
  return 3; // İleri (2 veya daha fazla modül tamamlandı -> Seviye 3)
};

// Get all unique categories from modules
const getCategories = () => {
  const categories = new Set();
  modules.forEach(m => categories.add(m.category));
  return Array.from(categories);
};

// Calculate category progress for a user
const getCategoryProgress = (user) => {
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
};

// --- ROUTES ---
// Authentication routes
app.use('/api/auth', authRoutes);

// Helper: Get today's date string YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Helper: Generate conversation ID
const generateConversationId = () => 'conv_' + Math.random().toString(36).substr(2, 9);

// Helper: Convert skills to 0-100 scale (for backward compatibility)
const normalizeSkillsTo100 = (skills) => {
  if (!skills || typeof skills !== 'object') return {};
  
  const normalized = {};
  Object.entries(skills).forEach(([skillKey, skillData]) => {
    if (skillData && typeof skillData === 'object' && skillData.average !== undefined) {
      // If average is <= 10, it's in old scale (0-10), convert to 0-100
      // If average is > 10, it's already in new scale (0-100)
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
};

// --- ROUTES ---

// GET /api/modules
app.get('/api/modules', async (req, res) => {
  try {
    const { userId } = req.query;
    let categoryProgress = {};
    
    // If userId provided, get user from database and include category progress
    if (userId) {
      const { getUserById, getCategoryProgress } = require('./utils/userHelpers');
      const user = await getUserById(userId);
      if (user) {
        categoryProgress = getCategoryProgress(user);
      }
    }
    
    // Get all modules from database
    const dbModules = await getAllModules();
    
    const modulesWithLevel = dbModules.map(m => {
      const moduleData = { 
        id: m.id, 
        title: m.title, 
        category: m.category, 
        description: m.description,
        icon: m.icon 
      };
      
      // Add category level if user provided
      if (userId && categoryProgress[m.category]) {
        moduleData.categoryLevel = categoryProgress[m.category].level;
        moduleData.categoryProgress = categoryProgress[m.category];
      }
      
      return moduleData;
    });
    
    res.json(modulesWithLevel);
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({ message: 'Modüller yüklenirken bir hata oluştu' });
  }
});

// GET /api/modules/:id
app.get('/api/modules/:id', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    const { userId } = req.query;
    
    // Get module from database
    const moduleData = await getModuleById(moduleId, 1); // Default level 1, will update based on user
    
    if (!moduleData) {
      return res.status(404).json({ message: "Modül bulunamadı" });
    }
    
    // Get user's level in this category
    let categoryLevel = 1;
    let categoryProgress = null;
    
    if (userId) {
      const { getUserById, getCategoryProgress } = require('./utils/userHelpers');
      const user = await getUserById(userId);
      if (user) {
        const categoryProgressData = getCategoryProgress(user);
        if (categoryProgressData[moduleData.category]) {
          categoryLevel = categoryProgressData[moduleData.category].level;
          categoryProgress = categoryProgressData[moduleData.category];
        }
      }
    }
    
    // Get questions for the user's level
    const selectedQuestions = await getModuleQuestions(moduleId, categoryLevel);
    
    // If no questions for this level, try level 1 as fallback
    const questions = selectedQuestions.length > 0 ? selectedQuestions : await getModuleQuestions(moduleId, 1);

    // Return module with level-specific questions
    const response = {
      id: moduleData.id,
      category: moduleData.category,
      title: moduleData.title,
      description: moduleData.description,
      icon: moduleData.icon,
      questions: questions,
      userCategoryLevel: categoryLevel,
      categoryProgress: categoryProgress
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({ message: 'Modül yüklenirken bir hata oluştu' });
  }
});

// GET /api/quests - Get all quests with user progress
app.get('/api/quests', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { getUserById } = require('./utils/userHelpers');
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const completedModulesCount = (user.completedModules || []).length;
    const completedQuestIds = user.completedQuests || [];
  
  const questsWithProgress = QUESTS.map(quest => {
    const isCompleted = completedQuestIds.includes(quest.id);
    const progress = Math.min(completedModulesCount, quest.requirement);
    const progressPercentage = (progress / quest.requirement) * 100;
    
    return {
      ...quest,
      isCompleted,
      progress,
      progressPercentage,
      canClaim: !isCompleted && progress >= quest.requirement
    };
  });
  
    res.json({
      quests: questsWithProgress,
      completedCount: completedQuestIds.length,
      totalQuests: QUESTS.length
    });
  } catch (error) {
    console.error('Error getting quests:', error);
    res.status(500).json({ message: 'Questler yüklenirken bir hata oluştu' });
  }
});

// POST /api/auth/update-name - Update user name
app.post('/api/auth/update-name', async (req, res) => {
  try {
    const { userId, name } = req.body;
    
    if (!userId) {
      return res.status(404).json({ message: "User ID required" });
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "Geçerli bir isim giriniz" });
    }
    
    if (name.trim().length > 50) {
      return res.status(400).json({ message: "İsim en fazla 50 karakter olabilir" });
    }
    
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name.trim(), parseInt(userId)]);
    
    res.json({
      success: true,
      name: name.trim(),
      message: "İsim başarıyla güncellendi"
    });
  } catch (error) {
    console.error('Error updating name:', error);
    res.status(500).json({ message: 'İsim güncellenirken bir hata oluştu' });
  }
});

// Note: /api/auth/guest and /api/auth/update-name are now handled by auth routes

// POST /api/store/buy - Buy Coins
app.post('/api/store/buy', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [parseInt(amount), parseInt(userId)]
    );
    
    const result = await pool.query('SELECT balance FROM users WHERE id = $1', [parseInt(userId)]);
    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    console.error('Error buying coins:', error);
    res.status(500).json({ message: 'Coin satın alınırken bir hata oluştu' });
  }
});

// POST /api/store/upgrade - Upgrade Tier
app.post('/api/store/upgrade', async (req, res) => {
  try {
    const { userId, targetTier } = req.body;
    
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const validTiers = ['FREE', 'BRONZE', 'GOLD', 'PLATINUM'];
    if (!validTiers.includes(targetTier)) {
      return res.status(400).json({ message: "Geçersiz üyelik tipi" });
    }
    
    await pool.query(
      'UPDATE users SET tier = $1 WHERE id = $2',
      [targetTier, parseInt(userId)]
    );
    
    const { getTierConfig } = require('./utils/userHelpers');
    const newTier = getTierConfig(targetTier);
    
    res.json({ 
      success: true, 
      newTier: newTier,
      message: `${targetTier} üyeliğine geçiş yapıldı!` 
    });
  } catch (error) {
    console.error('Error upgrading tier:', error);
    res.status(500).json({ message: 'Üyelik yükseltilirken bir hata oluştu' });
  }
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  try {
    const { moduleId, answers, userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user from database
    const { getUserById, getCategoryProgress, getTierConfig } = require('./utils/userHelpers');
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userTier = getTierConfig(user.tier);
    const cost = userTier.simCost;

    // Check Balance
    if (user.balance < cost) {
      return res.status(402).json({ message: "Yetersiz bakiye. Lütfen mağazadan KR alın." });
    }

    // Get module from database
    const { getModuleById, getModuleQuestions } = require('./utils/moduleHelpers');
    const moduleData = await getModuleById(moduleId, 1);
    
    if (!moduleData) {
      return res.status(404).json({ message: "Modül bulunamadı" });
    }

    // Determine user level for this category to select correct questions
    let categoryLevel = 1;
    const categoryProgressData = getCategoryProgress(user);
    if (categoryProgressData[moduleData.category]) {
      categoryLevel = categoryProgressData[moduleData.category].level;
    }

    // Get questions for user's level
    const selectedQuestions = await getModuleQuestions(moduleId, categoryLevel);
    
    if (selectedQuestions.length === 0) {
      return res.status(404).json({ message: "Bu seviye için soru bulunamadı" });
    }

    // Deduct Balance from database
    await pool.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [cost, parseInt(userId)]
    );

  let totalScore = 0;
  let traits = {};

  console.log('Analyzing module:', moduleId);
  console.log('Selected questions count:', selectedQuestions.length);
  console.log('Answers received:', JSON.stringify(answers));

  selectedQuestions.forEach(q => {
    const answerId = answers[q.id];
    console.log(`Checking question ${q.id}, answer: ${answerId}`);
    const selectedOption = q.options.find(opt => opt.id === answerId);
    if (selectedOption && selectedOption.score) {
      console.log(`Score found for ${q.id}:`, JSON.stringify(selectedOption.score));
      Object.entries(selectedOption.score).forEach(([trait, value]) => {
        if (!traits[trait]) traits[trait] = 0;
        traits[trait] += value;
        totalScore += value;
      });
    } else {
      console.log(`No score found for question ${q.id}`);
    }
  });
  
  console.log('Total Score calculated:', totalScore);

  const averageScore = totalScore / (Object.keys(traits).length || 1);
  
  let feedback = "";
  let actionPlan = [];

  // Basic feedback logic
  if (averageScore > 25) {
    feedback = "Harika bir profesyonellik ve stratejik bakış açısı sergiliyorsunuz.";
    actionPlan = ["Bu yaklaşımınızı mentorluk yaparak başkalarına aktarın.", "Riskli projelerde sorumluluk alın."];
  } else if (averageScore > 15) {
    feedback = "Güçlü yönleriniz var ancak bazen duygusal davranabiliyorsunuz.";
    actionPlan = ["Veri analizi için zaman ayırın.", "Zorlu konuşmalar öncesi hazırlık yapın."];
  } else {
    feedback = "Gelişime ihtiyacınız var.";
    actionPlan = ["Temel eğitimleri alın.", "Riskleri hesaplayın."];
  }

  // Tier Restrictions
  if (!userTier.canSeeActionPlan) {
    actionPlan = ["🔒 Detaylı aksiyon planı sadece BRONZE ve üzeri üyeler içindir."];
  }

  // Advanced Stats (Mock)
  let advancedStats = null;
  if (userTier.canSeeAdvancedStats) {
    advancedStats = {
      percentile: "En iyi %10 içindesiniz",
      marketComparison: "Sektör ortalamasının üzerindesiniz",
      nextLevelRequirement: "Daha fazla stratejik risk alın"
    };
  }

    // Create new conversation/thread in database
    const { createConversation, addConversationStep } = require('./utils/conversationHelpers');
    const conversationId = await createConversation(userId, moduleId, moduleData.title);
    
    // Add initial step
    await addConversationStep(conversationId, {
      stepNumber: 1,
      stepType: 'initial',
      answers: answers,
      situation: null,
      feedback: feedback,
      actionPlan: actionPlan,
      traits: traits,
      totalScore: totalScore
    });

    // Track completed module and update skills in database
    const moduleIdInt = parseInt(moduleId);
    const userResult = await pool.query('SELECT completed_modules, skills FROM users WHERE id = $1', [parseInt(userId)]);
    const currentUser = userResult.rows[0];
    const completedModules = currentUser.completed_modules || [];
    const currentSkills = currentUser.skills || {};
    
    let isNewModule = false;
    if (!completedModules.includes(moduleIdInt)) {
      completedModules.push(moduleIdInt);
      isNewModule = true;
    }
    
    // Aggregate skills from this module
    const updatedSkills = { ...currentSkills };
    Object.entries(traits).forEach(([skill, value]) => {
      if (!updatedSkills[skill]) {
        updatedSkills[skill] = { total: 0, count: 0, average: 0 };
      }
      // Store values as 0-100 scale
      const value100 = value * 10; // Convert 0-10 to 0-100
      updatedSkills[skill].total += value100;
      updatedSkills[skill].count += 1;
      updatedSkills[skill].average = updatedSkills[skill].total / updatedSkills[skill].count;
    });

    // Update user in database
    await pool.query(
      'UPDATE users SET completed_modules = $1, skills = $2 WHERE id = $3',
      [completedModules, JSON.stringify(updatedSkills), parseInt(userId)]
    );

    // Check and complete quests if this is a new module
    let questRewards = [];
    if (isNewModule) {
      const completedQuestIds = currentUser.completed_quests || [];
      const QUESTS = [
        { id: 'complete_3_modules', requirement: 3, reward: 100 },
        { id: 'complete_5_modules', requirement: 5, reward: 250 },
        { id: 'complete_10_modules', requirement: 10, reward: 500 }
      ];
      
      for (const quest of QUESTS) {
        if (!completedQuestIds.includes(quest.id) && completedModules.length >= quest.requirement) {
          completedQuestIds.push(quest.id);
          questRewards.push({
            questId: quest.id,
            questTitle: quest.id === 'complete_3_modules' ? 'İlk Adımlar' : 
                       quest.id === 'complete_5_modules' ? 'Yolun Yarısı' : 'Usta Ol',
            reward: quest.reward
          });
          
          // Add reward to balance
          await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2',
            [quest.reward, parseInt(userId)]
          );
        }
      }
      
      if (questRewards.length > 0) {
        await pool.query(
          'UPDATE users SET completed_quests = $1 WHERE id = $2',
          [completedQuestIds, parseInt(userId)]
        );
      }
    }

    // Get updated balance
    const updatedUser = await pool.query('SELECT balance FROM users WHERE id = $1', [parseInt(userId)]);
    const newBalance = updatedUser.rows[0].balance;

    // Get total modules count
    const modulesCount = await pool.query('SELECT COUNT(*) FROM modules');
    const totalModules = parseInt(modulesCount.rows[0].count);

    res.json({
      conversationId,
      moduleId,
      traits,
      totalScore,
      feedback,
      actionPlan,
      advancedStats,
      newBalance: newBalance,
      costDeducted: cost,
      canContinue: true,
      completedModules: completedModules,
      completedModulesCount: completedModules.length,
      totalModules: totalModules,
      questRewards: questRewards.length > 0 ? questRewards : undefined,
      newQuestsCompleted: questRewards.length > 0 ? questRewards.map(r => r.questId) : []
    });
  } catch (error) {
    console.error('Error in analyze:', error);
    res.status(500).json({ message: 'Analiz sırasında bir hata oluştu' });
  }
});

// POST /api/analyze/custom - Custom Simulation (PLATINUM only)
app.post('/api/analyze/custom', async (req, res) => {
  const { userId, scenario } = req.body;
  
  if (!userId || !users[userId]) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = users[userId];
  
  // PLATINUM Check
  if (user.tier !== 'PLATINUM') {
    return res.status(403).json({ 
      message: "Bu özellik sadece PLATINUM üyeler için geçerlidir.",
      requiresTier: 'PLATINUM'
    });
  }

  // Validate scenario text
  if (!scenario || scenario.trim().length === 0) {
    return res.status(400).json({ message: "Lütfen senaryonuzu açıklayın." });
  }

  if (scenario.length > 500) {
    return res.status(400).json({ message: "Senaryo 500 karakterden uzun olamaz." });
  }

  // Simple AI-like analysis based on keywords
  const scenarioLower = scenario.toLowerCase();
  let feedback = "";
  let actionPlan = [];
  let traits = {};
  let totalScore = 0;

  // Analyze keywords and provide feedback
  if (scenarioLower.includes('maaş') || scenarioLower.includes('ücret') || scenarioLower.includes('para')) {
    feedback = "Maaş/ücret konusunda yaşadığınız durumu analiz ettik. Bu tür görüşmelerde veriye dayalı hazırlık çok önemlidir.";
    actionPlan = [
      "Piyasa araştırması yapın ve kendi değerinizi objektif olarak belirleyin.",
      "Başarılarınızı ve katkılarınızı somut örneklerle destekleyin.",
      "Alternatif çözümler önerin (ek ödemeler, esnek çalışma saatleri vb.)."
    ];
    traits = { negotiation: 8, preparation: 7, confidence: 6 };
    totalScore = 70;
  } else if (scenarioLower.includes('terfi') || scenarioLower.includes('yükselme') || scenarioLower.includes('promosyon')) {
    feedback = "Terfi sürecinde doğru zamanlama ve hazırlık kritik öneme sahiptir. Durumunuzu değerlendirdik.";
    actionPlan = [
      "Üstlendiğiniz ek sorumlulukları ve başarılarınızı dokümante edin.",
      "Yöneticinizle düzenli geri bildirim toplantıları yapın.",
      "Hedef pozisyon için gerekli yetkinlikleri geliştirmeye odaklanın."
    ];
    traits = { leadership: 8, strategic: 7, communication: 7 };
    totalScore = 73;
  } else if (scenarioLower.includes('çatışma') || scenarioLower.includes('sorun') || scenarioLower.includes('problem')) {
    feedback = "İş yerindeki çatışmaları yönetmek profesyonel gelişimin önemli bir parçasıdır.";
    actionPlan = [
      "Duygusal tepkiler yerine objektif verilere odaklanın.",
      "Açık ve yapıcı iletişim kurun, karşı tarafın perspektifini anlamaya çalışın.",
      "Gerekirse üst yönetim veya İK departmanından destek alın."
    ];
    traits = { conflictResolution: 8, empathy: 7, professionalism: 8 };
    totalScore = 76;
  } else if (scenarioLower.includes('ekip') || scenarioLower.includes('takım') || scenarioLower.includes('yönetim')) {
    feedback = "Ekip yönetimi liderlik yetkinliklerinizi geliştirmek için harika bir fırsattır.";
    actionPlan = [
      "Bireysel ihtiyaçları anlayın ve her ekip üyesine özel yaklaşım sergileyin.",
      "Açık hedefler belirleyin ve düzenli geri bildirim verin.",
      "Başarıları kutlayın ve zorlukları birlikte çözün."
    ];
    traits = { leadership: 9, teamManagement: 8, communication: 8 };
    totalScore = 83;
  } else {
    // Generic analysis
    feedback = "Yaşadığınız durumu analiz ettik. Profesyonel gelişim için her deneyim değerlidir.";
    actionPlan = [
      "Durumu objektif olarak değerlendirin ve öğrenilecek dersleri çıkarın.",
      "Benzer durumlar için gelecekte daha hazırlıklı olmak için strateji geliştirin.",
      "Gerekirse mentorluk veya profesyonel destek almayı düşünün."
    ];
    traits = { adaptability: 7, learning: 8, resilience: 7 };
    totalScore = 73;
  }

  res.json({
    isCustom: true,
    scenario: scenario.substring(0, 500),
    traits,
    totalScore,
    feedback,
    actionPlan,
    advancedStats: {
      percentile: "Özel senaryonuz analiz edildi",
      marketComparison: "Durumunuz profesyonel standartlara göre değerlendirildi",
      nextLevelRequirement: "Önerilen aksiyon planını takip edin"
    },
    newBalance: user.balance,
    costDeducted: 0 // Free for PLATINUM
  });
});

// GET /api/conversations - Get all conversations for a user
// IMPORTANT: This must be defined BEFORE /api/conversations/:conversationId
app.get('/api/conversations', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { getUserConversations } = require('./utils/conversationHelpers');
    const userConversations = await getUserConversations(userId);

    res.json({
      conversations: userConversations,
      total: userConversations.length
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Konuşmalar yüklenirken bir hata oluştu' });
  }
});

// GET /api/conversations/:conversationId - Get conversation details
app.get('/api/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query; // Optional: to filter based on current tier
    
    const { getConversationById } = require('./utils/conversationHelpers');
    const conversation = await getConversationById(conversationId, userId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı" });
    }
    
    // If userId provided, filter steps based on current user tier
    let filteredConversation = { ...conversation };
    
    if (userId) {
      const { getUserById, getTierConfig } = require('./utils/userHelpers');
      const user = await getUserById(userId);
      
      if (user) {
        const userTier = getTierConfig(user.tier);
        
        // Filter steps based on current tier
        filteredConversation.steps = conversation.steps.map(step => {
          const filteredStep = { ...step };
          
          // Check if actionPlan is locked (starts with 🔒)
          if (step.actionPlan && step.actionPlan.length > 0) {
            const isLocked = step.actionPlan[0] && step.actionPlan[0].includes('🔒');
            
            // If locked but user now has access, regenerate actionPlan based on feedback/context
            if (isLocked && userTier.canSeeActionPlan) {
              // Generate a generic action plan since we don't store original
              filteredStep.actionPlan = [
                "Öğrendiklerinizi uygulamaya koyun.",
                "Gelişim alanlarınızı belirleyin ve çalışın.",
                "Düzenli geri bildirim alın ve ilerlemeyi takip edin."
              ];
            } else if (!userTier.canSeeActionPlan && !isLocked) {
              // If user downgraded, lock the action plan
              filteredStep.actionPlan = ["🔒 Detaylı aksiyon planı sadece BRONZE ve üzeri üyeler içindir."];
            }
          }
          
          return filteredStep;
        });
      }
    }
    
    res.json(filteredConversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ message: 'Konuşma yüklenirken bir hata oluştu' });
  }
});

// POST /api/conversations/:conversationId/continue - Continue conversation with new situation
app.post('/api/conversations/:conversationId/continue', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, newSituation } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get conversation from database
    const { getConversationById, addConversationStep } = require('./utils/conversationHelpers');
    const conversation = await getConversationById(conversationId, userId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı" });
    }

    // Get user from database
    const { getUserById, getTierConfig } = require('./utils/userHelpers');
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userTier = getTierConfig(user.tier);
    const cost = userTier.simCost;

    // Check Balance (PLATINUM free)
    if (user.balance < cost) {
      return res.status(402).json({ message: "Yetersiz bakiye. Lütfen mağazadan KR alın." });
    }

    // Validate new situation
    if (!newSituation || newSituation.trim().length === 0) {
      return res.status(400).json({ message: "Lütfen yeni durumu açıklayın." });
    }

    if (newSituation.length > 500) {
      return res.status(400).json({ message: "Durum açıklaması 500 karakterden uzun olamaz." });
    }

    // Deduct Balance (if not PLATINUM)
    if (cost > 0) {
      await pool.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [cost, parseInt(userId)]
      );
    }

    // Analyze new situation based on conversation context
    const previousStep = conversation.steps[conversation.steps.length - 1];
    const situationLower = newSituation.toLowerCase();
    
    let feedback = "";
    let actionPlan = [];
    let traits = {};
    let totalScore = 0;

    // Context-aware analysis
    if (situationLower.includes('sonuç') || situationLower.includes('oldu') || situationLower.includes('yaptım')) {
      feedback = "Aldığınız aksiyonları değerlendirdik. Sonuçlara göre bir sonraki adımları planlayalım.";
      actionPlan = [
        "Sonuçları objektif olarak değerlendirin ve öğrenilen dersleri not edin.",
        "Başarılı olan yaklaşımları gelecekte de kullanın.",
        "Geliştirilmesi gereken noktalar için yeni stratejiler belirleyin."
      ];
      traits = { reflection: 8, learning: 9, adaptability: 7 };
      totalScore = 80;
    } else if (situationLower.includes('sorun') || situationLower.includes('problem') || situationLower.includes('zorluk')) {
      feedback = "Yeni bir zorlukla karşılaştınız. Önceki deneyimlerinizden öğrendiklerinizi uygulayın.";
      actionPlan = [
        "Önceki adımlarda öğrendiklerinizi hatırlayın ve uygulayın.",
        "Sorunu küçük parçalara bölerek çözüm üretin.",
        "Gerekirse destek alın veya alternatif yaklaşımlar deneyin."
      ];
      traits = { problemSolving: 8, resilience: 9, strategic: 7 };
      totalScore = 80;
    } else if (situationLower.includes('ilerleme') || situationLower.includes('gelişme') || situationLower.includes('başarı')) {
      feedback = "Harika bir ilerleme kaydediyorsunuz! Bu momentumu koruyun.";
      actionPlan = [
        "Başarılarınızı kutlayın ve motivasyonunuzu koruyun.",
        "Bir sonraki hedefi belirleyin ve plan yapın.",
        "Bu başarıyı başkalarıyla paylaşın ve mentorluk yapın."
      ];
      traits = { achievement: 9, motivation: 9, leadership: 8 };
      totalScore = 87;
    } else {
      // Generic continuation
      feedback = "Yeni durumu değerlendirdik. Hikayeniz devam ediyor, doğru adımlarla ilerleyin.";
      actionPlan = [
        "Önceki adımlardan öğrendiklerinizi uygulayın.",
        "Yeni duruma uygun strateji geliştirin.",
        "İlerlemeyi takip edin ve gerekirse ayarlamalar yapın."
      ];
      traits = { adaptability: 8, strategic: 7, learning: 8 };
      totalScore = 77;
    }

    // Tier Restrictions
    if (!userTier.canSeeActionPlan) {
      actionPlan = ["🔒 Detaylı aksiyon planı sadece BRONZE ve üzeri üyeler içindir."];
    }

    // Add new step to conversation in database
    const newStepNumber = conversation.steps.length + 1;
    await addConversationStep(conversationId, {
      stepNumber: newStepNumber,
      stepType: 'continuation',
      answers: null,
      situation: newSituation.trim(),
      feedback: feedback,
      actionPlan: actionPlan,
      traits: traits,
      totalScore: totalScore
    });

    // Get updated balance
    const updatedUser = await pool.query('SELECT balance FROM users WHERE id = $1', [parseInt(userId)]);
    const newBalance = updatedUser.rows[0].balance;

    const newStep = {
      stepNumber: newStepNumber,
      type: 'continuation',
      situation: newSituation.trim(),
      feedback: feedback,
      actionPlan: actionPlan,
      traits: traits,
      totalScore: totalScore,
      timestamp: new Date().toISOString()
    };

    res.json({
      conversationId: conversation.id,
      step: newStep,
      feedback,
      actionPlan,
      traits,
      totalScore,
      newBalance: newBalance,
      costDeducted: cost,
      canContinue: true
    });
  } catch (error) {
    console.error('Error continuing conversation:', error);
    res.status(500).json({ message: 'Konuşma devam ettirilirken bir hata oluştu' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
