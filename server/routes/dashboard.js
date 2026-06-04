import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, name, email, role, balance FROM users WHERE id = ?').get(userId);

    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC').all(userId);

    const deposits = db.prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(userId);
    const withdrawals = db.prepare('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(userId);

    res.json({
      user,
      investments,
      deposits,
      withdrawals,
      stats: {
        totalEarnings: investments.reduce((sum, investment) => sum + investment.daily_income * investment.duration_days, 0),
        activeInvestments: investments.filter((item) => item.status === 'active').length,
        completedInvestments: investments.filter((item) => item.status === 'completed').length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load dashboard' });
  }
});

export default router;
