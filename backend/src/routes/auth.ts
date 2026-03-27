import { RequestHandler } from "express";
import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User';
import AgentProfile from '../models/AgentProfile';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// POST /api/auth/signup
router.post('/signup', async (req: any, res: any) => {
  try {
    const { fullName, email, username, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const user = await User.create({
      fullName,
      email,
      username,
      password,
      role: role || 'customer',
      phone: phone || '',
      address: address || '',
    });

    // If registering as agent, create an AgentProfile
    if (role === 'agent') {
      await AgentProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }],
    }).select('+password');

    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate as any, async (req: any, res: any) => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate as any, async (req: any, res: any) => {
  try {
    const user = req.user!;
    const { fullName, email, username, phone, address, avatar } = req.body;

    if (typeof fullName === 'string') user.fullName = fullName.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof address === 'string') user.address = address.trim();
    if (typeof avatar === 'string') user.avatar = avatar.trim();

    if (typeof email === 'string' && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });
        if (existingEmail) {
          res.status(400).json({ message: 'Email is already in use' });
          return;
        }
      }
      user.email = normalizedEmail;
    }

    if (typeof username === 'string' && username.trim()) {
      const normalizedUsername = username.trim().toLowerCase();
      if (normalizedUsername !== user.username) {
        const existingUsername = await User.findOne({
          username: normalizedUsername,
          _id: { $ne: user._id },
        });
        if (existingUsername) {
          res.status(400).json({ message: 'Username is already in use' });
          return;
        }
      }
      user.username = normalizedUsername;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate as any, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters long' });
      return;
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.password) {
      if (!currentPassword || typeof currentPassword !== 'string') {
        res.status(400).json({ message: 'Current password is required' });
        return;
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

// GET /api/auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: any, res: any) => {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    const clientURL = process.env.CLIENT_URL || 'http://localhost:8080';
    const isNew = (user as any)._isNewUser ? '&isNew=true' : '';
    res.redirect(`${clientURL}/auth/google/callback?token=${token}${isNew}`);
  }
);

// PUT /api/auth/role — let new Google users choose their role
router.put('/role', authenticate as any, async (req: any, res: any) => {
  try {
    const { role } = req.body;
    if (!['customer', 'agent'].includes(role)) {
      res.status(400).json({ message: 'Invalid role. Must be customer or agent.' });
      return;
    }

    const user = req.user!;
    user.role = role;
    await user.save();

    // If switching to agent, create AgentProfile if it doesn't exist
    if (role === 'agent') {
      const existing = await AgentProfile.findOne({ userId: user._id });
      if (!existing) {
        await AgentProfile.create({ userId: user._id });
      }
    }

    res.json({ message: 'Role updated', user: user.toJSON() });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Request failed', error: error.message });
  }
});

export default router;
