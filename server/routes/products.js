import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const products = [
  { id: 1, name: 'iPhone 8', price: 13000, dailyIncome: 146, duration: 16, image: '/images/iphone8.png' },
  { id: 2, name: 'iPad Mini', price: 28000, dailyIncome: 373, duration: 15, image: '/images/ipad-mini.png' },
  { id: 3, name: 'iPhone X', price: 39000, dailyIncome: 212, duration: 35, image: '/images/iphonex.png' },
  { id: 4, name: 'iPhone 11', price: 97500, dailyIncome: 278, duration: 70, image: '/images/iphone11.png' },
  { id: 5, name: 'MacBook', price: 130000, dailyIncome: 433, duration: 60, image: '/images/macbook.png' },
  { id: 6, name: 'iPhone 12', price: 208000, dailyIncome: 336, duration: 130, image: '/images/iphone12.png' },
  { id: 7, name: 'iPhone 13', price: 390000, dailyIncome: 448, duration: 200, image: '/images/iphone13.png' },
  { id: 8, name: 'iPhone 14', price: 650000, dailyIncome: 600, duration: 260, image: '/images/iphone14.png' },
  { id: 9, name: 'iPhone 15', price: 1170000, dailyIncome: 812.5, duration: 360, image: '/images/iphone15.png' },
  { id: 10, name: 'iPhone 16', price: 2950000, dailyIncome: 1640, duration: 500, image: '/images/iphone16.png' }
];

router.get('/', (req, res) => {
  res.json(products);
});

router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.user.id;
    const product = products.find((item) => item.id === Number(productId));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (Number(user.balance) < Number(product.price)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    db.prepare(
      'INSERT INTO investments (user_id, product_name, price, daily_income, duration_days, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, product.name, product.price, product.dailyIncome, product.duration, 'active');
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(product.price, userId);
    res.json({ message: 'Investment purchased successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not purchase investment' });
  }
});

export default router;
