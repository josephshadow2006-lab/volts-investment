import express from 'express';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import dashboardRoutes from './routes/dashboard.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';
import { query, db } from './db.js';
import { initDatabase } from './seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localClientDist = path.join(__dirname, '../client/dist');
const dockerClientDist = path.join(__dirname, 'client/dist');
const clientDistPath = fs.existsSync(localClientDist) ? localClientDist : dockerClientDist;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(clientDistPath));

app.get('/api/stats', async (req, res) => {
  try {
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const investments = db.prepare('SELECT COUNT(*) as count FROM investments').get();
    const earnings = db.prepare('SELECT COALESCE(SUM(daily_income * duration_days), 0) as total FROM investments').get();
    res.json({
      activeInvestors: users.count || 0,
      totalInvestments: investments.count || 0,
      totalProjectedEarnings: earnings.total || 0,
    });
  } catch (error) {
    console.error(error);
    res.json({ activeInvestors: 0, totalInvestments: 0, totalProjectedEarnings: 0 });
  }
});

app.get('/api/referrals', async (req, res) => {
  res.json({ referralLink: 'https://volts.example.com/ref/USER123', referralCount: 12, commissions: 5400 });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  const interval = setInterval(() => {
    socket.emit('marketUpdate', {
      investors: Math.floor(3400 + Math.random() * 120),
      revenue: Math.floor(214000 + Math.random() * 5800),
    });
  }, 6000);

  socket.on('disconnect', () => {
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 4000;

initDatabase()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
