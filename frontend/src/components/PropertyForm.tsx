import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { Plus, Trash, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
  titleText: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  titleText,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: {
      city: '',
      address: '',
    },
    propertyType: 'apartment',
    bedrooms: '0',
    bathrooms: '0',
    area: '',
    status: 'for-sale',
    images: [''],
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        location: {
          city: initialData.location?.city || '',
          address: initialData.location?.address || '',
        },
        propertyType: initialData.propertyType || 'apartment',
        bedrooms: initialData.bedrooms?.toString() || '0',
        bathrooms: initialData.bathrooms?.toString() || '0',
        area: initialData.area?.toString() || '',
        status: initialData.status || 'for-sale',
        images: initialData.images && initialData.images.length > 0 ? [...initialData.images] : [''],
      });
    }
  }, [initialData]);

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');

    if (parent === 'location') {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: updatedImages.length === 0 ? [''] : updatedImages,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.location.city.trim() ||
      !formData.location.address.trim() ||
      !formData.area
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const cleanImages = formData.images.map((img) => img.trim()).filter((img) => img !== '');

    const submissionData = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseInt(formData.bathrooms, 10),
      area: parseFloat(formData.area),
      images: cleanImages,
    };

    try {
      await onSubmit(submissionData);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit form. Please check your details.');
    }
  };

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'San Francisco', 'Seattle', 'Austin'];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <Link
          id="btn-back-to-listings"
          to="/"
          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{titleText}</h1>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {formError}
        </div>
      )}

      <form id="property-editor-form" onSubmit={handleFormSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleNestedChange}
                placeholder="e.g. Modern 2-Bedroom Condo in Downtown"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNestedChange}
                placeholder="e.g. 450000"
                min="0"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleNestedChange}
                placeholder="Describe the property highlights, neighborhood details, etc."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Property Specifications */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            Property Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleNestedChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleNestedChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num === 0 ? 'Studio / None' : `${num} Bedrooms`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleNestedChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num === 0 ? 'None' : `${num} Bathrooms`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Area (sq ft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleNestedChange}
                placeholder="e.g. 1200"
                min="1"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Listing Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleNestedChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
              >
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Location Details */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            Location Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="location.city"
                value={formData.location.city}
                onChange={handleNestedChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all cursor-pointer"
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleNestedChange}
                placeholder="e.g. 123 Emerald Ave Apt 4B"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Property Images */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Property Images (URLs)
            </h2>
            <button
              id="btn-add-img"
              type="button"
              onClick={addImageField}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Image</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 font-medium">
            Provide public image web URLs (e.g., Unsplash, Imgur). If empty, a beautiful real estate placeholder will be used.
          </p>

          <div className="space-y-3">
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all"
                />
                {formData.images.length > 1 && (
                  <button
                    id={`btn-del-img-${index}`}
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-2 border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end space-x-3">
          <Link
            id="btn-cancel-editor"
            to="/"
            className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            id="btn-submit-editor"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg text-sm flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-colors"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Saving...' : 'Save Property'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
