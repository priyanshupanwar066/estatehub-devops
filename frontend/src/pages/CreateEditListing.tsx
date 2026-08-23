import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Property } from '../types';
import PropertyForm from '../components/PropertyForm';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateEditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isEditMode = !!id;

  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If auth is done loading and user is not an agent, we block them
    if (!authLoading && (!user || user.role !== 'agent')) {
      return;
    }

    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/properties/${id}`);
        // Verify current user is the owner of the listing
        const creatorId = typeof response.data.createdBy === 'object' ? response.data.createdBy._id : response.data.createdBy;
        if (user && user._id !== creatorId) {
          setError('You are not authorized to edit this listing.');
          return;
        }
        setProperty(response.data);
      } catch (err: any) {
        console.error('Error fetching property details for editing:', err);
        setError('Failed to fetch property details. The listing might not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user, authLoading]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/properties/${id}`, formData);
      } else {
        await api.post('/properties', formData);
      }
      navigate('/');
    } catch (err) {
      setIsSubmitting(false);
      throw err; // Form component will catch and show error
    }
  };

  if (authLoading || (loading && isEditMode)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">
          {isEditMode ? 'Loading listing details...' : 'Verifying agent credentials...'}
        </p>
      </div>
    );
  }

  // Route protection
  if (!user || user.role !== 'agent') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="inline-flex p-3.5 bg-red-50 text-red-500 rounded-full shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Only registered real estate agents are authorized to create and manage property listings on EstateHub.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Link
            id="btn-unauthorized-home"
            to="/"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            Back to Listings
          </Link>
          <Link
            id="btn-unauthorized-auth"
            to="/login?mode=register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
          >
            Register as Agent
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="inline-flex p-3 bg-red-50 text-red-500 rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Error Accessing Listing</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link
          id="btn-error-redirect"
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PropertyForm
        initialData={property}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        titleText={isEditMode ? 'Edit Property Listing' : 'List a New Property'}
      />
    </div>
  );
};

export default CreateEditListing;
