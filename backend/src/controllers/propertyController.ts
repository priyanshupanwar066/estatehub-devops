import { Response, NextFunction } from 'express';
import Property from '../models/Property.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Create a property
export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, price, location, propertyType, bedrooms, bathrooms, area, images, status } = req.body;

    const property = await Property.create({
      title,
      description,
      price,
      location,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      images: images || [],
      status: status || 'for-sale',
      createdBy: req.user!.id,
    });

    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
};

// List properties with filters
export const getProperties = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city, minPrice, maxPrice, propertyType, bedrooms, search } = req.query;

    const filterQuery: any = {};

    // Filter by city
    if (city && typeof city === 'string' && city.trim() !== '') {
      filterQuery['location.city'] = { $regex: city.trim(), $options: 'i' };
    }

    // Filter by property type
    if (propertyType && typeof propertyType === 'string' && propertyType.trim() !== '') {
      filterQuery.propertyType = propertyType;
    }

    // Filter by bedrooms
    if (bedrooms) {
      const beds = parseInt(bedrooms as string, 10);
      if (!isNaN(beds)) {
        filterQuery.bedrooms = beds;
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice) {
        const min = parseFloat(minPrice as string);
        if (!isNaN(min)) {
          filterQuery.price.$gte = min;
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice as string);
        if (!isNaN(max)) {
          filterQuery.price.$lte = max;
        }
      }
    }

    // Text search (on title, address, description)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = search.trim();
      filterQuery.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { 'location.address': { $regex: s, $options: 'i' } },
        { 'location.city': { $regex: s, $options: 'i' } },
      ];
    }

    // Find and populate agent info
    const properties = await Property.find(filterQuery)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

// Get single property
export const getPropertyById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id).populate('createdBy', 'name email role');
    if (!property) {
      res.status(404).json({ message: 'Property listing not found' });
      return;
    }
    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

// Update property
export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property listing not found' });
      return;
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized to update this listing' });
      return;
    }

    const { title, description, price, location, propertyType, bedrooms, bathrooms, area, images, status } = req.body;

    // Apply updates
    property.title = title !== undefined ? title : property.title;
    property.description = description !== undefined ? description : property.description;
    property.price = price !== undefined ? price : property.price;
    property.location = location !== undefined ? location : property.location;
    property.propertyType = propertyType !== undefined ? propertyType : property.propertyType;
    property.bedrooms = bedrooms !== undefined ? bedrooms : property.bedrooms;
    property.bathrooms = bathrooms !== undefined ? bathrooms : property.bathrooms;
    property.area = area !== undefined ? area : property.area;
    property.images = images !== undefined ? images : property.images;
    property.status = status !== undefined ? status : property.status;

    const updatedProperty = await property.save();
    res.status(200).json(updatedProperty);
  } catch (error) {
    next(error);
  }
};

// Delete property
export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property listing not found' });
      return;
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized to delete this listing' });
      return;
    }

    await Property.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Property listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};
