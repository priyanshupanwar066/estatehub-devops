import { Response, NextFunction } from 'express';
import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Submit an inquiry for a property
export const createInquiry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    // Validate if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    const inquiry = await Inquiry.create({
      propertyId,
      buyerId: req.user ? req.user.id : undefined,
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      message: 'Inquiry submitted successfully! The agent will contact you soon.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// Get inquiries for the logged-in agent's properties
export const getInquiries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Find all properties owned by this agent
    const properties = await Property.find({ createdBy: req.user!.id });
    const propertyIds = properties.map((p) => p._id);

    const inquiries = await Inquiry.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId', 'title price location propertyType status images')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

