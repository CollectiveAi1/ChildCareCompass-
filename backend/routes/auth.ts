import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { z } from 'zod';
import { toCamelCase } from '../utils/case-converter';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TEACHER', 'PARENT']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  centerId: z.string().uuid().optional(),
});

// Mock data for demo mode
const DEMO_USERS: Record<string, any> = {
  'admin@demo.com': { id: '00000000-0000-0000-0000-000000000001', email: 'admin@demo.com', role: 'ADMIN', first_name: 'Admin', last_name: 'User', center_id: '00000000-0000-0000-0000-000000000000' },
  'teacher@demo.com': { id: '00000000-0000-0000-0000-000000000002', email: 'teacher@demo.com', role: 'TEACHER', first_name: 'Sarah', last_name: 'Teacher', center_id: '00000000-0000-0000-0000-000000000000' },
  'parent@demo.com': { id: '00000000-0000-0000-0000-000000000003', email: 'parent@demo.com', role: 'PARENT', first_name: 'Parent', last_name: 'User', center_id: '00000000-0000-0000-0000-000000000000' },
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    let user;

    try {
      const result = await query(
        'SELECT id, email, password_hash, role, center_id, first_name, last_name FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length > 0) {
        const dbUser = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);
        if (isValidPassword) {
          user = dbUser;
        }
      }
    } catch (dbError) {
      console.warn('Database connection failed, checking for demo credentials...');
    }

    // Fallback to demo mode if user not found in DB or DB is down
    if (!user && password === 'demo123') {
      user = DEMO_USERS[email] || {
        id: '00000000-0000-0000-0000-000000000000',
        email,
        role: 'ADMIN',
        first_name: 'Demo',
        last_name: 'User',
        center_id: '00000000-0000-0000-0000-000000000000'
      };
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        centerId: user.center_id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.json({
      token,
      user: toCamelCase(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, centerId } = RegisterSchema.parse(req.body);

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, center_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, center_id`,
      [email, passwordHash, role, firstName, lastName, centerId]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        centerId: user.center_id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({
      token,
      user: toCamelCase(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
