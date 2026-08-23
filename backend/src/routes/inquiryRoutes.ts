import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { createInquiry, getInquiries } from '../controllers/inquiryController';
import { validateRequest } from '../middleware/validationMiddleware';
import jwt from 'jsonwebtoken';
import { AuthRequest, protect, authorize } from '../middleware/authMiddleware';

const router = Router();


// Middleware to optionally decode user token if present
const optionalProtect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'estatehub_jwt_secret_key_987654321') as any;
      req.user = decoded;
    } catch (error) {
      // Silently ignore token errors and let user submit as anonymous
    }
  }
  next();
};

// @route   POST /api/inquiries
// @desc    Submit an inquiry for a property
// @access  Public (Optional Auth)
router.post(
  '/',
  [
    optionalProtect,
    body('propertyId').isMongoId().withMessage('Valid property ID is required'),
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('message').notEmpty().withMessage('Message is required').trim(),
    validateRequest,
  ],
  createInquiry
);

// @route   GET /api/inquiries
// @desc    Get all inquiries for the logged-in agent's listings
// @access  Private (Agent only)
router.get('/', protect, authorize('agent'), getInquiries);

export default router;
