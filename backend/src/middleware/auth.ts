import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/init';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    name?: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    
    const db = getDb();
    const user = await db.get('SELECT id, email, is_admin, is_banned FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.is_banned) {
      return res.status(403).json({ message: 'User account is banned' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: Boolean(user.is_admin)
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}; 