
import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import {
  Plus,
  Trash,
  ArrowLeft,
  Loader2,
  FileText,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  ImagePlus,
  Home,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
  titleText: string;
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

const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  titleText,
}) => {
  useFonts();

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

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const previewImage = formData.images.find((img) => img.trim() !== '');
  const formattedPrice = formData.price
    ? Number(formData.price).toLocaleString('en-US', { maximumFractionDigits: 0 })
    : null;

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-8"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <Link
          id="btn-back-to-listings"
          to="/"
          className="p-2.5 border border-stone-300 rounded-full text-stone-500 hover:text-stone-900 hover:bg-white hover:border-stone-400 transition-colors bg-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-amber-700/80">
            Listing editor
          </p>
          <h1
            className="text-3xl text-stone-900 -mt-0.5"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            {titleText}
          </h1>
        </div>
      </div>

      {formError && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Form column */}
        <form id="property-editor-form" onSubmit={handleFormSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <FormSection icon={<FileText className="h-4 w-4" />} title="Basic information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <FieldLabel required>Property title</FieldLabel>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleNestedChange}
                  placeholder="Modern 2-bedroom condo in downtown"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <FieldLabel required>Price (USD)</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNestedChange}
                    placeholder="450,000"
                    min="0"
                    className={`${inputClass} pl-7`}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleNestedChange}
                  placeholder="Describe the property highlights, neighborhood details, and what makes it stand out."
                  rows={4}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* Section 2: Property Specifications */}
          <FormSection icon={<Home className="h-4 w-4" />} title="Specifications">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <FieldLabel required>Property type</FieldLabel>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleNestedChange}
                  className={selectClass}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                </select>
              </div>

              <div>
                <FieldLabel required>Bedrooms</FieldLabel>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleNestedChange}
                  className={selectClass}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num === 0 ? 'Studio / none' : `${num} bedroom${num > 1 ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel required>Bathrooms</FieldLabel>
                <select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleNestedChange}
                  className={selectClass}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num === 0 ? 'None' : `${num} bathroom${num > 1 ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel required>Area (sq ft)</FieldLabel>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleNestedChange}
                  placeholder="1,200"
                  min="1"
                  className={inputClass}
                  required
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <FieldLabel required>Listing status</FieldLabel>
                <div className="flex gap-3">
                  {(['for-sale', 'for-rent'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                        formData.status === status
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'bg-white border-stone-300 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {status === 'for-sale' ? 'For sale' : 'For rent'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section 3: Location Details */}
          <FormSection icon={<MapPin className="h-4 w-4" />} title="Location">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <FieldLabel required>City</FieldLabel>
                <select
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleNestedChange}
                  className={selectClass}
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
                <FieldLabel required>Full street address</FieldLabel>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleNestedChange}
                  placeholder="123 Emerald Ave, Apt 4B"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* Section 4: Property Images */}
          <FormSection
            icon={<ImagePlus className="h-4 w-4" />}
            title="Photos"
            action={
              <button
                id="btn-add-img"
                type="button"
                onClick={addImageField}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add photo
              </button>
            }
          >
            <p className="text-xs text-stone-400 mb-4 -mt-2">
              Paste public image URLs. Leave empty to use a placeholder image on the listing.
            </p>

            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-lg border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center">
                    {image.trim() ? (
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImagePlus className="h-4 w-4 text-stone-300" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className={`${inputClass} flex-1`}
                  />
                  {formData.images.length > 1 && (
                    <button
                      id={`btn-del-img-${index}`}
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2.5 border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              id="btn-cancel-editor"
              to="/"
              className="px-5 py-2.5 border border-stone-300 rounded-full text-sm font-semibold text-stone-600 hover:bg-white transition-colors"
            >
              Cancel
            </Link>
            <button
              id="btn-submit-editor"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-semibold rounded-full text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save property'}
            </button>
          </div>
        </form>

        {/* Live preview column */}
        <div className="lg:sticky lg:top-8">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-stone-400 mb-3 px-1">
            Preview
          </p>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-[0_1px_2px_rgba(28,36,49,0.04)]">
            <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <Home className="h-10 w-10" strokeWidth={1.2} />
                </div>
              )}
              <span
                className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  formData.status === 'for-rent'
                    ? 'bg-teal-800 text-teal-50'
                    : 'bg-stone-900 text-white'
                }`}
              >
                {formData.status === 'for-rent' ? 'For rent' : 'For sale'}
              </span>
            </div>

            <div className="p-4">
              <p
                className="text-2xl text-stone-900 leading-tight"
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
              >
                {formattedPrice ? `$${formattedPrice}` : '$—'}
              </p>

              <p className="text-sm font-medium text-stone-800 mt-2 line-clamp-2">
                {formData.title || 'Untitled property'}
              </p>

              <p className="flex items-center gap-1 text-xs text-stone-400 mt-1">
                <MapPin className="h-3 w-3" />
                {formData.location.city
                  ? `${formData.location.address ? formData.location.address + ', ' : ''}${formData.location.city}`
                  : 'Location not set'}
              </p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5" />
                  {formData.bedrooms}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5" />
                  {formData.bathrooms}
                </span>
                <span className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5" />
                  {formData.area ? `${formData.area} sqft` : '—'}
                </span>
                <span className="flex items-center gap-1.5 ml-auto capitalize">
                  <Tag className="h-3.5 w-3.5" />
                  {formData.propertyType}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-3 px-1">This is how the card will appear on the listings page.</p>
        </div>
      </div>
    </div>
  );
};

const inputClass =
  'w-full px-4 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-600/15 focus:border-amber-600/60 outline-none transition-all placeholder:text-stone-300';

const selectClass =
  'w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-600/15 focus:border-amber-600/60 outline-none transition-all cursor-pointer';

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-sm font-medium text-stone-600 mb-1.5">
    {children}
    {required && <span className="text-amber-700/70 ml-0.5">*</span>}
  </label>
);

const FormSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, title, action, children }) => (
  <div className="bg-white/70 border border-stone-200 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
          {icon}
        </span>
        <h2
          className="text-base text-stone-800"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
    {children}
  </div>
);

export default PropertyForm;
