const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, balance, tier, last_login_date, completed_modules, completed_quests, skills)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, name, balance, tier, completed_modules, completed_quests, skills, created_at`,
      [email, passwordHash, name || null, 100, 'FREE', new Date().toISOString().split('T')[0], [], [], {}]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    // Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        tier: 'FREE',
        completedModules: user.completed_modules || [],
        completedQuests: user.completed_quests || []
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' });
    }

    // Update last login date
    const today = new Date().toISOString().split('T')[0];
    await pool.query('UPDATE users SET last_login_date = $1 WHERE id = $2', [today, user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    // Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Check daily reward
    const userTier = getTierConfig(user.tier);
    let rewardGranted = false;
    let rewardAmount = 0;

    if (user.last_login_date !== today) {
      rewardAmount = userTier.dailyReward;
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [rewardAmount, user.id]
      );
      rewardGranted = true;
    }

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance + (rewardGranted ? rewardAmount : 0),
        tier: userTier,
        rewardGranted,
        rewardAmount,
        completedModules: user.completed_modules || [],
        completedQuests: user.completed_quests || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu' });
  }
});

// POST /api/auth/guest - Guest login (backward compatibility)
router.post('/guest', async (req, res) => {
  try {
    let userId = req.body.userId;

    if (!userId) {
      // Create a temporary guest user
      const guestEmail = `guest_${Date.now()}@guest.com`;
      const tempPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, balance, tier, last_login_date, completed_modules, completed_quests, skills)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, name, balance, tier, completed_modules, completed_quests, skills, last_login_date`,
        [guestEmail, passwordHash, 100, 'FREE', new Date().toISOString().split('T')[0], [], [], {}]
      );

      userId = result.rows[0].id.toString();
    } else {
      // Check if user exists
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(userId)]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
    }

    // Get user data
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(userId)]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];
    const userTier = getTierConfig(user.tier);
    const today = new Date().toISOString().split('T')[0];
    let rewardGranted = false;
    let rewardAmount = 0;

    // Daily Reward Logic - check if last_login_date is null or different from today
    const lastLoginDate = user.last_login_date ? user.last_login_date.toISOString().split('T')[0] : null;
    if (!lastLoginDate || lastLoginDate !== today) {
      rewardAmount = userTier.dailyReward;
      await pool.query(
        'UPDATE users SET balance = balance + $1, last_login_date = $2 WHERE id = $3',
        [rewardAmount, today, user.id]
      );
      rewardGranted = true;
    }

    // Get updated balance
    const updatedUser = await pool.query('SELECT balance FROM users WHERE id = $1', [user.id]);

    // Get total modules count from database
    const modulesCount = await pool.query('SELECT COUNT(*) FROM modules');
    const totalModules = parseInt(modulesCount.rows[0].count) || 10;

    // Get category progress
    const { getCategoryProgress } = require('../utils/userHelpers');
    const categoryProgress = getCategoryProgress({
      completedModules: user.completed_modules || []
    });

    res.json({
      userId: user.id.toString(),
      name: user.name || null,
      balance: updatedUser.rows[0].balance,
      tier: userTier,
      rewardGranted,
      rewardAmount,
      completedModules: user.completed_modules || [],
      completedModulesCount: (user.completed_modules || []).length,
      totalModules: totalModules,
      skills: normalizeSkillsTo100(user.skills || {}),
      completedQuests: user.completed_quests || [],
      categoryProgress: categoryProgress,
      message: 'Success'
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu' });
  }
});

// Helper functions
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

module.exports = router;

