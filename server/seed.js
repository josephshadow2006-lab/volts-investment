import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { db } from './db.js';

dotenv.config();

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      balance REAL DEFAULT 0,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      verification_token_expires TEXT,
      reset_password_token TEXT,
      reset_password_expires TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      daily_income REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@volts.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  
  try {
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    if (!existingAdmin) {
      const passwordHash = bcrypt.hashSync(adminPassword, 10);
      db.prepare(
        'INSERT INTO users (name, email, password_hash, role, balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)'
      ).run('Admin', adminEmail, passwordHash, 'admin', 0, 1);
      console.log(`✓ Admin user created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  console.log('✓ Database schema created successfully.');
}

export async function initDatabase() {
  try {
    createSchema();
  } catch (error) {
    console.error('Schema creation failed:', error);
    throw error;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectInvoke = process.argv[1] === __filename;

if (isDirectInvoke) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
