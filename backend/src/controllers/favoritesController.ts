import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Add property to favorites
export const addFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      res.status(400).json({ message: 'Invalid property id' });
      return;
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already in favorites
    // NOTE: user.favorites holds Mongoose ObjectId instances, not strings.
    // ObjectId !== string, so comparing them directly with .includes() always
    // returns false. Convert each entry to a string before comparing.
    const alreadyFavorited = user.favorites.some((fav) => fav.toString() === propertyId);
    if (alreadyFavorited) {
      res.status(400).json({ message: 'Property is already in favorites' });
      return;
    }

    // Use MongoDB update operator to avoid full document validation
    // This prevents "validation failed" errors from invalid role values in old data
    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $addToSet: { favorites: propertyId } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Property added to favorites',
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Remove property from favorites
export const removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      res.status(400).json({ message: 'Invalid property id' });
      return;
    }

    // Use MongoDB update operator to avoid full document validation
    // This prevents "validation failed" errors from invalid role values in old data
    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $pull: { favorites: propertyId } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the property was actually removed by comparing with the original
    const user = await User.findById(req.user!.id);
    if (user && user.favorites.some((fav) => fav.toString() === propertyId)) {
      res.status(400).json({ message: 'Property not in favorites' });
      return;
    }

    res.status(200).json({
      message: 'Property removed from favorites',
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's favorites
export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).populate({
      path: 'favorites',
      populate: {
        path: 'createdBy',
        select: 'name email role',
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
};