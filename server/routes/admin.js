import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get('/overview', async (req, res) => {
  try {
    const users = db.prepare('SELECT COUNT(*) as users FROM users').get();
    const investments = db.prepare('SELECT COUNT(*) as investments FROM investments').get();
    const withdrawals = db.prepare('SELECT COUNT(*) as withdrawals FROM withdrawals').get();
    const deposits = db.prepare('SELECT COUNT(*) as deposits FROM deposits').get();
    const pending = db.prepare('SELECT COUNT(*) as pending FROM withdrawals WHERE status = ?').get('pending');

    res.json({
      users: users.users || 0,
      investments: investments.investments || 0,
      withdrawals: withdrawals.withdrawals || 0,
      deposits: deposits.deposits || 0,
      pendingWithdrawals: pending.pending || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load admin overview' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = db.prepare('SELECT id, name, email, role, balance, email_verified, created_at FROM users ORDER BY created_at DESC').all();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load users' });
  }
});

router.get('/withdrawals', async (req, res) => {
  try {
    const result = db.prepare('SELECT w.*, u.name, u.email FROM withdrawals w JOIN users u ON u.id = w.user_id ORDER BY w.created_at DESC').all();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load withdrawals' });
  }
});

router.post('/withdrawals/:id/approve', async (req, res) => {
  try {
    const withdrawalId = req.params.id;
    db.prepare('UPDATE withdrawals SET status = ? WHERE id = ?').run('approved', withdrawalId);
    res.json({ message: 'Withdrawal approved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not approve withdrawal' });
  }
});

router.post('/withdrawals/:id/reject', async (req, res) => {
  try {
    const withdrawalId = req.params.id;
    const record = db.prepare('SELECT user_id, amount FROM withdrawals WHERE id = ?').get(withdrawalId);
    if (!record) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    db.prepare('UPDATE withdrawals SET status = ? WHERE id = ?').run('rejected', withdrawalId);
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(record.amount, record.user_id);
    res.json({ message: 'Withdrawal rejected and funds returned' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not reject withdrawal' });
  }
});

export default router;
