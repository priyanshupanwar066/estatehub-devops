import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController';
import { protect, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

// Validation for creating/updating properties
const propertyValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('price').isNumeric().withMessage('Price must be a number').custom(val => val >= 0).withMessage('Price cannot be negative'),
  body('location.city').notEmpty().withMessage('City is required').trim(),
  body('location.address').notEmpty().withMessage('Address is required').trim(),
  body('propertyType')
    .isIn(['apartment', 'house', 'villa', 'plot'])
    .withMessage('Property type must be apartment, house, villa, or plot'),
  body('bedrooms').isNumeric().withMessage('Bedrooms must be a number'),
  body('bathrooms').isNumeric().withMessage('Bathrooms must be a number'),
  body('area').isNumeric().withMessage('Area must be a number').custom(val => val > 0).withMessage('Area must be greater than 0'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
  body('status').optional().isIn(['for-sale', 'for-rent']).withMessage('Status must be for-sale or for-rent'),
  validateRequest,
];

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes (Agents only)
router.post('/', protect, authorize('agent'), propertyValidation, createProperty);
router.put('/:id', protect, authorize('agent'), propertyValidation, updateProperty);
router.delete('/:id', protect, authorize('agent'), deleteProperty);

export default router;
