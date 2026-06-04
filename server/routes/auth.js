import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

function signToken(userId, email, role) {
  return jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function buildVerificationToken(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?'
  ).run(token, expires, userId);
  return token;
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, balance, email_verified) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, name, email, role, balance, email_verified'
    ).run(name, email, passwordHash, 'user', 0, 0);

    const user = {
      id: result.lastInsertRowid,
      name,
      email,
      role: 'user',
      balance: 0,
      email_verified: false,
    };

    const verificationToken = await buildVerificationToken(user.id);
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    const emailResult = await sendEmail(
      user.email,
      'Verify your VOLTS account',
      `<p>Hello ${user.name},</p><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p><p>If email is unavailable, use this token: ${verificationToken}</p>`
    );

    const token = signToken(user.id, user.email, user.role);
    res.status(201).json({ user, token, emailPreview: emailResult.preview || null, verifyUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT id, name, email, password_hash, role, balance, email_verified FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user.id, user.email, user.role);
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      email_verified: user.email_verified === 1,
    };
    res.json({ user: sanitizedUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const now = new Date().toISOString();
    const result = db.prepare(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE verification_token = ? AND verification_token_expires > ?'
    ).run(token, now);

    if (result.changes === 0) {
      return res.status(400).json({ message: 'Verification token is invalid or expired' });
    }
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Email verification failed' });
  }
});

router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link was sent.' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?').run(token, expires, user.id);
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
    const emailResult = await sendEmail(
      email,
      'VOLTS password reset request',
      `<p>Hello ${user.name},</p><p>Reset your password by clicking the link below:</p><p><a href="${resetUrl}">Reset Password</a></p><p>If this was not you, ignore this email.</p>`
    );
    res.json({ message: 'Password reset instructions sent', preview: emailResult.preview || null, resetUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const now = new Date().toISOString();
    const user = db.prepare('SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > ?').get(token, now);
    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?'
    ).run(passwordHash, user.id);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Reset password failed' });
  }
});

export default router;
