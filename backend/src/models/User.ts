import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'buyer' | 'agent';
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['buyer', 'agent'],
      default: 'buyer',
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IUser>('User', UserSchema);
