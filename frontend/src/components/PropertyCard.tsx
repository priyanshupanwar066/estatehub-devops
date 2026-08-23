import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { BedDouble, Bath, Maximize, Heart, Edit, Trash, MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onDelete?: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete }) => {
  const { user, isFavorite, addFavorite, removeFavorite } = useAuth();

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const favorited = isFavorite(property._id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add properties to favorites.');
      return;
    }
    if (favorited) {
      removeFavorite(property._id);
    } else {
      addFavorite(property._id);
    }
  };

  // Check if current user is the agent who created this listing
  const isCreator = (): boolean => {
    if (!user || user.role !== 'agent') return false;
    const creatorId = typeof property.createdBy === 'object' ? property.createdBy._id : property.createdBy;
    return user._id === creatorId;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this listing?')) {
      if (onDelete) {
        onDelete(property._id);
      }
    }
  };

  // Fallback image url
  const imageUrl =
    property.images && property.images.length > 0 && property.images[0].trim() !== ''
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      id={`property-card-${property._id}`}
      className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge (for-sale vs for-rent) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className="px-2.5 py-1 rounded bg-white/95 backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase text-slate-950 shadow-sm"
          >
            {property.status === 'for-sale' ? 'FOR SALE' : 'FOR RENT'}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900/90 backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase text-white shadow-sm">
            {property.propertyType}
          </span>
        </div>

        {/* Favorite Star Button (Only shown to buyers/authenticated or for prompting login) */}
        {(!user || user.role === 'buyer') && (
          <button
            id={`btn-fav-${property._id}`}
            onClick={handleFavoriteClick}
            class={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              favorited
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/95 text-slate-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart class={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Property Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Price & Agent */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-lg font-extrabold text-blue-600">{formattedPrice}</span>
          {typeof property.createdBy === 'object' && (
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">By {property.createdBy.name}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
          <Link to={`/properties/${property._id}`}>{property.title}</Link>
        </h3>

        {/* Location */}
        <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">
            {property.location.address}, {property.location.city}
          </span>
        </p>

        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 text-slate-600 text-xs mt-auto">
          <div className="flex items-center gap-1">
            <BedDouble className="h-4 w-4 text-slate-400 shrink-0" />
            <span><strong className="text-slate-900">{property.bedrooms}</strong> Bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-slate-400 shrink-0" />
            <span><strong className="text-slate-900">{property.bathrooms}</strong> Bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4 text-slate-400 shrink-0" />
            <span><strong className="text-slate-900">{property.area.toLocaleString()}</strong> sqft</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
          <Link
            id={`btn-view-${property._id}`}
            to={`/properties/${property._id}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            View Details &rarr;
          </Link>

          {isCreator() && (
            <div className="flex items-center space-x-1.5">
              <Link
                id={`btn-edit-${property._id}`}
                to={`/edit-listing/${property._id}`}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-md transition-colors"
                title="Edit Listing"
              >
                <Edit className="h-3.5 w-3.5" />
              </Link>
              <button
                id={`btn-del-${property._id}`}
                onClick={handleDeleteClick}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-md transition-colors cursor-pointer"
                title="Delete Listing"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
