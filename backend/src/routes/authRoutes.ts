import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { config } from '../config.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Generate a JWT token for an authenticated user
 */
function generateToken(userId: string, email: string): string {
  const signOptions: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign({ id: userId, email }, config.jwt.secret as jwt.Secret, signOptions);
}

/**
 * POST /api/auth/register
 * Creates a new user with hashed password and generates a JWT
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable. Please try again shortly.',
      });
      return;
    }

    const { name, email, password, phone } = req.body;

    // Field existence validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Please provide your full name.',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Please provide an email address.',
      });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        error: 'Validation error',
        message: 'Please provide a password.',
      });
      return;
    }

    // Format & length validation
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Full name must be at least 2 characters long.',
      });
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Please provide a valid email address (e.g. name@example.com).',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists. Please sign in instead.',
      });
      return;
    }

    // Create user in MongoDB
    const newUser = new UserModel({
      name: trimmedName,
      email: normalizedEmail,
      password,
      phone: typeof phone === 'string' ? phone.trim() : '',
    });

    await newUser.save();

    // Generate JWT
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Error registering user:', error instanceof Error ? error.name : 'Unknown error');

    // Handle Mongo duplicate key error if race condition occurs
    if (error.code === 11000) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists. Please sign in instead.',
      });
      return;
    }

    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error during account creation.',
    });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials and returns JWT token and safe user payload
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable. Please try again shortly.',
      });
      return;
    }

    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Please provide your email address.',
      });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        error: 'Validation error',
        message: 'Please provide your password.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user and explicitly select password hash
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password. Please verify your credentials and try again.',
      });
      return;
    }

    // Compare candidate password with stored bcrypt hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password. Please verify your credentials and try again.',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      message: 'Signed in successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Error authenticating user:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during sign in.',
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile using JWT bearer token
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        error: 'Database unavailable',
        message: 'MongoDB connection is currently unavailable.',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user token payload.',
      });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The requested user account was not found.',
      });
      return;
    }

    res.status(200).json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Error fetching current user:', error instanceof Error ? error.name : 'Unknown error');
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: 'Internal server error.',
    });
  }
});

export default authRouter;
