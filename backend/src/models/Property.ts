import { Schema, model, Document, Types } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    address: string;
  };
  propertyType: 'apartment' | 'house' | 'villa' | 'plot';
  bedrooms: number;
  bathrooms: number;
  area: number; // sq ft
  images: string[];
  status: 'for-sale' | 'for-rent';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Property price is required'],
      min: [0, 'Price must be a positive number'],
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
    },
    propertyType: {
      type: String,
      enum: {
        values: ['apartment', 'house', 'villa', 'plot'],
        message: '{VALUE} is not a valid property type',
      },
      required: [true, 'Property type is required'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
    },
    area: {
      type: Number,
      required: [true, 'Property area in sq ft is required'],
      min: [1, 'Area must be at least 1 sq ft'],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['for-sale', 'for-rent'],
      default: 'for-sale',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IProperty>('Property', PropertySchema);
