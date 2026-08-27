import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Property, Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Loader2, Mail, Phone, Calendar, Home, MessageSquare, 
  Trash2, Edit, PlusCircle, ExternalLink, Inbox, CheckCircle2 
} from 'lucide-react';

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'properties'>('inquiries');
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const propRes = await api.get('/properties');
      const allProps: Property[] = propRes.data;
      const agentProps = allProps.filter((p) => {
        const creatorId = typeof p.createdBy === 'object' ? p.createdBy._id : p.createdBy;
        return creatorId === user?._id;
      });
      setProperties(agentProps);

      // Fetch inquiries for agent's properties
      const inquiryRes = await api.get('/inquiries');
      setInquiries(inquiryRes.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not retrieve dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'agent') {
      fetchDashboardData();
    }
  }, [user]);

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      setActionSuccess('Property listing successfully deleted!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  if (!user || user.role !== 'agent') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 bg-white p-8 rounded-2xl border border-slate-200 mt-10">
        <div className="inline-flex p-3.5 bg-red-50 text-red-600 rounded-full shadow-xs">
          <Inbox className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-500">
            This dashboard is reserved for verified real estate agents. Please log in with an agent account.
          </p>
        </div>
        <Link
          id="btn-login-agent"
          to="/login"
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
        >
          <span>Go to Sign In</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-slate-950 tracking-tight">
            Agent Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your listings, review prospective buyer inquiries, and oversee active leads.
          </p>
        </div>
        <Link
          id="btn-dashboard-add-listing"
          to="/create-listing"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Listing</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm rounded-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'inquiries'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Buyer Inquiries</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-extrabold">
            {inquiries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'properties'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>My Listings</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-extrabold">
            {properties.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-semibold">Gathering command center metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium text-center">
          {error}
        </div>
      ) : activeTab === 'inquiries' ? (
        /* INQUIRIES VIEW */
        inquiries.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
            <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Inbox is empty</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                No prospective buyers have sent inquiries for your properties yet. Listings with detailed descriptions and high-quality images receive up to 5x more inquiries!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 flex items-center space-x-1.5">
              <span>Leads & Messages</span>
              <span className="text-xs font-normal text-slate-500">({inquiries.length} active)</span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {inquiries.map((inquiry) => {
                const prop = typeof inquiry.propertyId === 'object' ? inquiry.propertyId : null;
                const propImage = prop?.images && prop.images.length > 0 
                  ? prop.images[0] 
                  : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';

                return (
                  <div 
                    key={inquiry._id} 
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Left: Associated Property Mini-Banner */}
                    <div className="md:w-64 bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between shrink-0">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded tracking-wider">
                          Listing Reference
                        </span>
                        {prop ? (
                          <div className="mt-2.5 space-y-2">
                            <img src={propImage} alt={prop.title} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-blue-600">
                              <Link to={`/properties/${prop._id}`} className="flex items-center gap-1">
                                {prop.title} <ExternalLink className="h-3 w-3 shrink-0" />
                              </Link>
                            </h4>
                            <p className="text-xs font-extrabold text-blue-600">
                              {prop.status === 'for-sale' ? 'For Sale' : 'For Rent'} &bull; ${prop.price.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 mt-2 italic">Property listing deleted</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Message & Client Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-sans font-extrabold text-slate-900 text-base">{inquiry.name}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                              <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 hover:text-blue-600">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                {inquiry.email}
                              </a>
                              <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {inquiry.phone}
                              </a>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                            <Calendar className="h-3 w-3" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Message</h4>
                          <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                            {inquiry.message}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                        <a 
                          href={`mailto:${inquiry.email}?subject=Regarding inquiry on ${prop?.title || 'listing'}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          Reply via Email
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* PROPERTIES VIEW */
        properties.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
            <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No properties listed</h3>
              <p className="text-slate-500 text-xs mt-1">
                You haven't listed any properties yet. Click the button below to publish your first real estate listing!
              </p>
            </div>
            <Link
              id="btn-add-first-listing"
              to="/create-listing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all"
            >
              Add Property Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950">
              Active Listings <span className="text-xs font-normal text-slate-500">({properties.length} active)</span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => {
                const mainImg = property.images && property.images.length > 0 
                  ? property.images[0] 
                  : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';

                return (
                  <div 
                    key={property._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-slate-300 transition-colors"
                  >
                    <img 
                      src={mainImg} 
                      alt={property.title} 
                      className="w-full sm:w-28 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[9px] tracking-wider uppercase">
                          {property.status === 'for-sale' ? 'FOR SALE' : 'FOR RENT'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-extrabold text-[9px] tracking-wider uppercase">
                          {property.propertyType}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm truncate">{property.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{property.location.address}, {property.location.city}</p>
                    </div>

                    <div className="text-center sm:text-right shrink-0">
                      <p className="text-sm font-black text-blue-600">${property.price.toLocaleString()}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{property.area} sqft &bull; {property.bedrooms}b/{property.bathrooms}b</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-center">
                      <Link
                        id={`btn-dashboard-edit-${property._id}`}
                        to={`/edit-listing/${property._id}`}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Listing"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        id={`btn-dashboard-delete-${property._id}`}
                        onClick={() => handleDeleteProperty(property._id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        id={`btn-dashboard-view-${property._id}`}
                        to={`/properties/${property._id}`}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Live Listing"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AgentDashboard;
