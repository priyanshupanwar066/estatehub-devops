export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'agent';
  favorites: string[];
  token?: string;
}

export interface Property {
  _id: string;
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
  area: number;
  images: string[];
  status: 'for-sale' | 'for-rent';
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    price: number;
    location: {
      city: string;
      address: string;
    };
    propertyType: string;
    status: string;
    images?: string[];
  } | string;
  buyerId?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}
