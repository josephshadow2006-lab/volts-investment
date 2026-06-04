import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    db.prepare('INSERT INTO deposits (user_id, amount) VALUES (?, ?)').run(userId, amount);
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
    res.json({ message: 'Deposit successful', amount: Number(amount) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deposit failed' });
  }
});

router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
    if (!user || Number(user.balance) < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    db.prepare('INSERT INTO withdrawals (user_id, amount, status) VALUES (?, ?, ?)').run(userId, amount, 'pending');
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, userId);
    res.json({ message: 'Withdrawal request submitted', amount: Number(amount) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Withdrawal request failed' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const deposits = db.prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const withdrawals = db.prepare('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json({ deposits, withdrawals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load transaction history' });
  }
});

export default router;
