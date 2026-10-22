import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthJwtPayload {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthJwtPayload;
}

function isAuthJwtPayload(value: unknown): value is AuthJwtPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.id === 'string' && typeof payload.email === 'string';
}

function verifyAuthToken(token: string): AuthJwtPayload | null {
  const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
  return isAuthJwtPayload(decoded) ? decoded : null;
}

/**
 * Authentication middleware that verifies JWT bearer tokens
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. No valid authentication token was provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Authentication token is missing.',
    });
    return;
  }

  try {
    const decoded = verifyAuthToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid token', message: 'Authentication token is invalid.' });
      return;
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.',
      });
      return;
    }

    res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid or corrupted.',
    });
  }
};

/**
 * Optional authentication middleware: if a valid Bearer token is provided,
 * attaches user to req.user; otherwise proceeds with req.user undefined.
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    res.status(401).json({ error: 'Invalid token', message: 'Authentication token is missing.' });
    return;
  }

  try {
    const decoded = verifyAuthToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid token', message: 'Authentication token is invalid.' });
      return;
    }
    req.user = decoded;
  } catch (error) {
    res.status(401).json({
      error: error instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token',
      message: error instanceof jwt.TokenExpiredError
        ? 'Your session has expired. Please sign in again.'
        : 'Authentication token is invalid or corrupted.',
    });
    return;
  }
  next();
};
