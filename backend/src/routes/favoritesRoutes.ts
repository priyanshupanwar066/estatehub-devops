import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/favoritesController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All favorites routes are protected
router.use(protect);

router.get('/', getFavorites);
router.post('/:propertyId', addFavorite);
router.delete('/:propertyId', removeFavorite);

export default router;
