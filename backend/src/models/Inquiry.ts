import { Schema, model, Document, Types } from 'mongoose';

export interface IInquiry extends Document {
  propertyId: Types.ObjectId;
  buyerId?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default model<IInquiry>('Inquiry', InquirySchema);
