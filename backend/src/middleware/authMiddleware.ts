import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'buyer' | 'agent';
    email: string;
    name: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'estatehub_jwt_secret_key_987654321') as {
      id: string;
      role: 'buyer' | 'agent';
      email: string;
      name: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: ('buyer' | 'agent')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
      return;
    }

    next();
  };
};
