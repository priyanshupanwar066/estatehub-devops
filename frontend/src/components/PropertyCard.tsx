import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { BedDouble, Bath, Maximize, Heart, Edit, Trash, MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onDelete?: (id: string) => void;
}


const useFonts = () => {
  useEffect(() => {
    const id = 'property-form-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete }) => {
  useFonts();
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
      className="group bg-white rounded-2xl border border-stone-200 hover:border-stone-300 shadow-[0_1px_2px_rgba(28,36,49,0.04)] hover:shadow-[0_8px_24px_rgba(28,36,49,0.08)] transition-all duration-300 overflow-hidden flex flex-col h-full"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={imageUrl}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />

        {/* Status Badge (for-sale vs for-rent) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-sm ${
              property.status === 'for-rent'
                ? 'bg-teal-800 text-teal-50'
                : 'bg-stone-900 text-white'
            }`}
          >
            {property.status === 'for-sale' ? 'For sale' : 'For rent'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-semibold tracking-wide uppercase text-stone-700 shadow-sm capitalize">
            {property.propertyType}
          </span>
        </div>

        {/* Favorite Star Button (Only shown to buyers/authenticated or for prompting login) */}
        {(!user || user.role === 'buyer') && (
          <button
            id={`btn-fav-${property._id}`}
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              favorited
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/95 text-stone-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Property Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Price & Agent */}
        <div className="flex items-baseline justify-between mb-1.5">
          <span
            className="text-xl text-stone-900"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            {formattedPrice}
          </span>
          {typeof property.createdBy === 'object' && (
            <span className="text-[10px] text-stone-400 font-semibold tracking-wide uppercase">
              By {property.createdBy.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-stone-800 line-clamp-1 group-hover:text-amber-800 transition-colors mb-1">
          <Link to={`/properties/${property._id}`}>{property.title}</Link>
        </h3>

        {/* Location */}
        <p className="text-xs text-stone-500 flex items-center gap-1 mb-4">
          <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
          <span className="truncate">
            {property.location.address}, {property.location.city}
          </span>
        </p>

        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-stone-100 text-stone-500 text-xs mt-auto">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>
              <strong className="text-stone-900 font-semibold">{property.bedrooms}</strong> bed
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>
              <strong className="text-stone-900 font-semibold">{property.bathrooms}</strong> bath
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>
              <strong className="text-stone-900 font-semibold">{property.area.toLocaleString()}</strong> sqft
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2 mt-4">
          <Link
            id={`btn-view-${property._id}`}
            to={`/properties/${property._id}`}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
          >
            View details &rarr;
          </Link>

          {isCreator() && (
            <div className="flex items-center gap-1.5">
              <Link
                id={`btn-edit-${property._id}`}
                to={`/edit-listing/${property._id}`}
                className="p-1.5 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-900 rounded-md transition-colors"
                title="Edit listing"
              >
                <Edit className="h-3.5 w-3.5" />
              </Link>
              <button
                id={`btn-del-${property._id}`}
                onClick={handleDeleteClick}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-md transition-colors cursor-pointer"
                title="Delete listing"
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
