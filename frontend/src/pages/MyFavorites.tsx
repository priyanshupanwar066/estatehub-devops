import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Loader2, Heart, AlertCircle, LogIn, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Design tokens (shared with HomeListings / PropertyDetail):
 * ink #161A20   paper #F7F3EC   brick #AD4E33   moss #4C5F4E   stone #83786C   line #E4DED0
 *
 * NOTE ON BEHAVIOR: the previous version of this page called
 * `api.delete('/properties/:id')` for the card's remove action, which deletes
 * the *listing itself* rather than unfavoriting it — dangerous on a favorites
 * page. This version calls `api.delete('/favorites/:id')` instead, which only
 * removes the property from this user's saved list. Adjust the endpoint below
 * if your backend names the favorites route differently.
 */

const MyFavorites: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError('Could not fetch your favorite listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (id: string) => {
    setRemovingId(id);
    const previous = favorites;
    setFavorites((prev) => prev.filter((p) => p._id !== id)); // optimistic
    try {
      await api.delete(`/favorites/${id}`);
    } catch (err: any) {
      setFavorites(previous); // revert on failure
      alert(err.response?.data?.message || 'Failed to remove this property from favorites.');
    } finally {
      setRemovingId(null);
    }
  };

  // If not logged in, render call to action
  if (!user) {
    return (
      <div className="bg-[#F7F3EC] font-['Inter',sans-serif] min-h-[70vh]">
        <div className="max-w-md mx-auto text-center py-24 space-y-6 px-6">
          <div className="inline-flex p-3.5 bg-[#F7E9E4] text-[#AD4E33] rounded-full">
            <Heart className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="font-['Fraunces',serif] text-xl font-medium text-[#161A20]">Your saved properties</h2>
            <p className="text-sm text-[#83786C] leading-relaxed">
              Keep track of the properties you love. Log in or create an account to start saving listings.
            </p>
          </div>
          <Link
            id="btn-login-fav-prompt"
            to="/login"
            className="inline-flex items-center space-x-1.5 bg-[#AD4E33] hover:bg-[#943F27] text-[#F7F3EC] font-semibold py-2.5 px-6 rounded-full text-sm transition-colors cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign in to save favorites</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F3EC] font-['Inter',sans-serif] min-h-[70vh]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-10 space-y-8 pb-20">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#AD4E33] tracking-wide">Saved listings</span>
            <h1 className="font-['Fraunces',serif] text-2xl md:text-3xl font-medium text-[#161A20] tracking-tight mt-1">
              My saved properties
            </h1>
            <p className="text-sm text-[#83786C] mt-1">
              {favorites.length > 0
                ? `${favorites.length} ${favorites.length === 1 ? 'property' : 'properties'} you've favorited.`
                : "A collection of properties you've favorited."}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#AD4E33] hover:text-[#943F27] shrink-0"
          >
            <Search className="h-3.5 w-3.5" /> Browse more listings
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#FCFAF6] border border-[#E4DED0] rounded-2xl space-y-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#AD4E33]" />
            <p className="text-sm text-[#83786C] font-medium">Fetching your favorites&hellip;</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-[#F7E9E4] border border-[#E8B7A6] rounded-2xl flex items-center gap-3 text-[#8F3D27]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-[#FCFAF6] border border-[#E4DED0] rounded-2xl p-6 max-w-xl mx-auto space-y-4">
            <div className="inline-flex p-3 bg-[#F7F3EC] text-[#83786C] rounded-full">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-['Fraunces',serif] text-base font-medium text-[#161A20]">No saved properties yet</h3>
              <p className="text-xs text-[#83786C] mt-1">
                Browse listings and tap the heart icon on any property to save it here.
              </p>
            </div>
            <Link
              id="btn-start-browsing"
              to="/"
              className="inline-block bg-[#AD4E33] hover:bg-[#943F27] text-[#F7F3EC] font-semibold py-2.5 px-6 rounded-full text-sm transition-colors cursor-pointer"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <div key={property._id} className={removingId === property._id ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                <PropertyCard
                  property={property}
                  onDelete={handleRemoveFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;