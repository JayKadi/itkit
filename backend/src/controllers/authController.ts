import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateRegistration, isValidEmail } from '../utils/validation';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserPublic,
  AuthRequest,
} from '../types';

// Register new user
export const register = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, full_name }: RegisterRequest = _req.body;

    // Validate input
    const validationError = validateRegistration(email, password, full_name);
    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError,
      });
      return;
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error } = await (supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        password_hash,
        full_name,
        role: 'user' as const, // Default role
      }] as any)
      .select('id, email, full_name, role, created_at')
      .single());

    if (error || !newUser) {
      res.status(500).json({
        success: false,
        error: 'Failed to create user',
      });
      return;
    }

    // Generate token
    const token = generateToken(newUser as UserPublic);

    // Response
    const response: AuthResponse = {
      user: newUser as UserPublic,
      token,
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
    });
  }
};

// Login user
export const login = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = _req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Type assertion for user with password_hash
    type UserWithPassword = {
      id: string;
      email: string;
      password_hash: string;
      full_name: string;
      role: 'user' | 'it_staff' | 'admin';
      created_at: string;
    };

    const userWithPassword = user as UserWithPassword;

    // Verify password
    const isPasswordValid = await comparePassword(password, userWithPassword.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const userPublic: UserPublic = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      full_name: userWithPassword.full_name,
      role: userWithPassword.role,
      created_at: userWithPassword.created_at,
    };

    const token = generateToken(userPublic);

    // Response
    const response: AuthResponse = {
      user: userPublic,
      token,
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
    });
  }
};

// Get current user profile
export const getProfile = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // User is already attached by authenticate middleware
    if (!_req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: _req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
};

// Update user profile
export const updateProfile = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { full_name } = _req.body;

    if (!_req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Validate input
    if (!full_name || full_name.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: 'Full name must be at least 2 characters long',
      });
      return;
    }

    // Update user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedUser, error } = await (supabase as any)
      .from('users')
      .update({ full_name })
      .eq('id', _req.user.id)
      .select('id, email, full_name, role, created_at')
      .single();

    if (error || !updatedUser) {
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
};