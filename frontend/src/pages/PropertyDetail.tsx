import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  Home,
  MessageSquare,
  Heart,
} from 'lucide-react';



const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Favorite state
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // Selected gallery image
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data);
        setIsFavorited(Boolean((response.data as any)?.isFavorited));
        if (response.data.images && response.data.images.length > 0) {
          setSelectedImage(response.data.images[0]);
        }
      } catch (err: any) {
        console.error('Error fetching property detail:', err);
        setError('Listing could not be found or there was an error fetching details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // Fill in user details automatically if they are logged in
  useEffect(() => {
    if (user) {
      setInquiryName(user.name);
      setInquiryEmail(user.email);
    } else {
      setInquiryName('');
      setInquiryEmail('');
    }
  }, [user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || favoriteLoading) return;

    setFavoriteLoading(true);
    const previous = isFavorited;
    setIsFavorited(!previous); // optimistic
    try {
      if (previous) {
        await api.delete(`/favorites/${id}`);
      } else {
        await api.post(`/favorites/${id}`);
      }
    } catch (err: any) {
      setIsFavorited(previous); // revert on failure
      alert(err.response?.data?.message || 'Failed to update your favorites. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);
    setInquirySuccess(null);
    setSubmittingInquiry(true);

    try {
      const response = await api.post('/inquiries', {
        propertyId: id,
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        message: inquiryMessage,
      });

      setInquirySuccess(response.data.message || 'Inquiry submitted successfully!');
      setInquiryMessage('');
      setInquiryPhone('');
    } catch (err: any) {
      setInquiryError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F7F3EC] min-h-[60vh] flex flex-col items-center justify-center py-32 space-y-3 font-['Inter',sans-serif]">
        <Loader2 className="h-7 w-7 animate-spin text-[#AD4E33]" />
        <p className="text-sm text-[#83786C] font-medium">Loading property details&hellip;</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-[#F7F3EC] min-h-[60vh] font-['Inter',sans-serif]">
        <div className="max-w-xl mx-auto py-24 text-center space-y-4 px-6">
          <div className="inline-flex p-3 bg-[#F7E9E4] text-[#AD4E33] rounded-full">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="font-['Fraunces',serif] text-xl font-medium text-[#161A20]">Error loading property</h2>
          <p className="text-sm text-[#83786C]">{error || 'The requested property could not be loaded.'}</p>
          <Link
            id="btn-back-home"
            to="/"
            className="inline-block bg-[#AD4E33] hover:bg-[#943F27] text-[#F7F3EC] font-semibold py-2.5 px-6 rounded-full text-sm transition-colors"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
  const mainImage = selectedImage || (property.images && property.images.length > 0 ? property.images[0] : fallbackImage);

  return (
    <div className="bg-[#F7F3EC] font-['Inter',sans-serif]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-10 space-y-8 pb-20">

        {/* Breadcrumbs */}
        <nav className="flex text-xs text-[#83786C] space-x-1.5 items-center">
          <Link id="breadcrumb-home" to="/" className="hover:text-[#AD4E33]">Home</Link>
          <span>&bull;</span>
          <span className="capitalize hover:text-[#AD4E33]">
            {property.propertyType}
          </span>
          <span>&bull;</span>
          <span className="truncate max-w-xs text-[#3A3630]">{property.title}</span>
        </nav>

        {/* Main Grid: Images and Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Display Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#E4DED0] border border-[#E4DED0]">
              <img
                src={mainImage}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FCFAF6]/95 text-[#161A20] shadow-md backdrop-blur-xs">
                  {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#161A20]/90 backdrop-blur-xs text-[#F7F3EC] shadow-md">
                  {property.propertyType}
                </span>
              </div>

              {/* Favorite button */}
              <button
                id="btn-toggle-favorite"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                aria-pressed={isFavorited}
                aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FCFAF6]/95 backdrop-blur-xs shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer disabled:opacity-60"
              >
                {favoriteLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-[#AD4E33]" />
                ) : (
                  <Heart
                    className={`h-4.5 w-4.5 transition-colors ${
                      isFavorited ? 'fill-[#AD4E33] text-[#AD4E33]' : 'text-[#161A20]'
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {property.images && property.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {property.images.map((img, idx) => (
                  <button
                    id={`btn-thumbnail-${idx}`}
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      mainImage === img ? 'border-[#AD4E33] ring-2 ring-[#AD4E33]/10' : 'border-transparent opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications Panel */}
            <div className="bg-[#FCFAF6] rounded-2xl border border-[#E4DED0] p-6 md:p-8 space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4">
                  <h1 className="font-['Fraunces',serif] text-2xl md:text-3xl font-medium text-[#161A20] tracking-tight">
                    {property.title}
                  </h1>
                  <span className="font-mono text-2xl md:text-3xl font-medium text-[#AD4E33]">{formattedPrice}</span>
                </div>

                <div className="flex items-center text-[#83786C] text-sm gap-1 mb-4">
                  <MapPin className="h-4 w-4 text-[#83786C] shrink-0" />
                  <span>
                    {property.location.address}, {property.location.city}
                  </span>
                </div>
              </div>

              {/* Core Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-[#E4DED0] text-[#3A3630]">
                <div className="flex flex-col items-center text-center p-3 bg-[#F7F3EC] rounded-xl">
                  <BedDouble className="h-5 w-5 text-[#AD4E33] mb-1" />
                  <span className="text-sm font-semibold text-[#161A20]">{property.bedrooms}</span>
                  <span className="text-[10px] text-[#83786C] uppercase tracking-wide mt-0.5">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-[#F7F3EC] rounded-xl">
                  <Bath className="h-5 w-5 text-[#AD4E33] mb-1" />
                  <span className="text-sm font-semibold text-[#161A20]">{property.bathrooms}</span>
                  <span className="text-[10px] text-[#83786C] uppercase tracking-wide mt-0.5">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-[#F7F3EC] rounded-xl">
                  <Maximize className="h-5 w-5 text-[#AD4E33] mb-1" />
                  <span className="text-sm font-semibold text-[#161A20]">{property.area.toLocaleString()}</span>
                  <span className="text-[10px] text-[#83786C] uppercase tracking-wide mt-0.5">Sq Ft</span>
                </div>
              </div>

              {/* Property Description */}
              <div className="space-y-3">
                <h3 className="font-['Fraunces',serif] text-base font-medium text-[#161A20]">Property description</h3>
                <p className="text-sm text-[#3A3630] leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Quick Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#83786C] pt-4 border-t border-[#E4DED0]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#83786C]" />
                  <span>Listed on: {new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#83786C]" />
                  <span>Property type: <span className="capitalize font-semibold text-[#3A3630]">{property.propertyType}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Agent Form */}
          <div className="space-y-6">
            {/* Save button (secondary, mirrors the one on the image) */}
            <button
              id="btn-toggle-favorite-secondary"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`w-full rounded-2xl border p-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${
                isFavorited
                  ? 'bg-[#F7E9E4] border-[#E8B7A6] text-[#943F27]'
                  : 'bg-[#FCFAF6] border-[#E4DED0] text-[#161A20] hover:border-[#AD4E33]/40'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-[#943F27] text-[#943F27]' : ''}`} />
              {isFavorited ? 'Saved to favorites' : 'Save to favorites'}
            </button>

            {/* Agent Card */}
            {typeof property.createdBy === 'object' && (
              <div className="bg-[#FCFAF6] rounded-2xl border border-[#E4DED0] p-6 flex items-center space-x-4">
                <div className="p-3 bg-[#F7F3EC] rounded-xl text-[#AD4E33]">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-[#83786C] font-semibold uppercase tracking-wider">Listing agent</p>
                  <h4 className="text-base font-semibold text-[#161A20]">{(property.createdBy as any).name}</h4>
                  <p className="text-xs text-[#83786C]">{(property.createdBy as any).email}</p>
                </div>
              </div>
            )}

            {/* Inquiry Contact Form */}
            <div className="bg-[#FCFAF6] rounded-2xl border border-[#E4DED0] p-6 space-y-6">
              <h3 className="font-['Fraunces',serif] text-base font-medium text-[#161A20] flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#AD4E33]" />
                <span>Contact agent</span>
              </h3>

              {inquirySuccess ? (
                <div className="p-4 bg-[#EAF0EA] border border-[#C7D6C8] text-[#3B4A3C] text-xs rounded-xl flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#4C5F4E]" />
                  <span>{inquirySuccess}</span>
                </div>
              ) : (
                <form id="property-inquiry-form" onSubmit={handleInquirySubmit} className="space-y-4">
                  {inquiryError && (
                    <div className="p-3 bg-[#F7E9E4] border border-[#E8B7A6] text-[#8F3D27] text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-[#83786C] uppercase tracking-wider mb-1">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-[#E4DED0] rounded-lg text-sm bg-[#F7F3EC]/60 focus:bg-white focus:ring-2 focus:ring-[#AD4E33]/20 focus:border-[#AD4E33] outline-hidden transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#83786C] uppercase tracking-wider mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-[#E4DED0] rounded-lg text-sm bg-[#F7F3EC]/60 focus:bg-white focus:ring-2 focus:ring-[#AD4E33]/20 focus:border-[#AD4E33] outline-hidden transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#83786C] uppercase tracking-wider mb-1">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 border border-[#E4DED0] rounded-lg text-sm bg-[#F7F3EC]/60 focus:bg-white focus:ring-2 focus:ring-[#AD4E33]/20 focus:border-[#AD4E33] outline-hidden transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#83786C] uppercase tracking-wider mb-1">
                      Message
                    </label>
                    <textarea
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Hi, I am interested in this listing and would like to schedule a tour or receive additional details. Thank you!"
                      rows={4}
                      className="w-full px-3 py-2 border border-[#E4DED0] rounded-lg text-sm bg-[#F7F3EC]/60 focus:bg-white focus:ring-2 focus:ring-[#AD4E33]/20 focus:border-[#AD4E33] outline-hidden transition-all"
                      required
                    />
                  </div>

                  <button
                    id="btn-submit-inquiry"
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full bg-[#AD4E33] hover:bg-[#943F27] disabled:opacity-60 text-[#F7F3EC] font-semibold py-2.5 rounded-full text-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                  >
                    {submittingInquiry && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{submittingInquiry ? 'Sending...' : 'Send inquiry'}</span>
                  </button>
                </form>
              )}

              <div className="border-t border-[#E4DED0] pt-4 flex flex-col gap-2.5 text-xs text-[#83786C]">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#AD4E33] shrink-0" />
                  <span>Call directly: +91 (800) ESTATE-HUB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#AD4E33] shrink-0" />
                  <span>Email support: help@estatehub.co</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
