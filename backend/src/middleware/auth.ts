import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { supabase } from '../services/supabaseClient';
import { UserPublic, UserRole, AuthRequest } from '../types';

// Middleware to verify JWT token
export const authenticate = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = _req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Attach user to request
    _req.user = user as UserPublic;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// Middleware to check if user has required role
export const authorize = (...allowedRoles: UserRole[]) => {
  return (_req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!_req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(_req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
};