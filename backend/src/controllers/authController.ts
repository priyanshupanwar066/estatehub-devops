import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Helper to generate JWT
const generateToken = (payload: { id: string; name: string; email: string; role: string }): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'estatehub_jwt_secret_key_987654321',
    { expiresIn: '30d' }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
    });

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favorites: user.favorites,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favorites: user.favorites,
      token,
    });
  } catch (error) {
    next(error);
  }
};
