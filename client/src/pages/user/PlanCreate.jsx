import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiSearch, FiPlus, FiTrash2, FiEdit2, FiCalendar, FiClock, FiNavigation, FiArrowRight, FiCheck, FiInfo } from 'react-icons/fi';
import MapPicker from '../../components/MapPicker';
import PlaceDetailsModal from '../../components/PlaceDetailsModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PlanCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    destination: { name: '', location: { coordinates: [] } },
    activities: [],
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapError, setMapError] = useState('');

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Plan overview and dates' },
    { number: 2, title: 'Location', description: 'Choose your destination' },
    { number: 3, title: 'Activities', description: 'Build your itinerary' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      destination: {
        ...formData.destination,
        location,
      },
    });
    setMapError('');
  };

  const handleSearchPlaces = async () => {
    if (!searchQuery.trim() && !searchCategory) {
      toast.error('Please enter a search query or select a category');
      return;
    }

    if (!formData.destination.location.coordinates || formData.destination.location.coordinates.length === 0) {
      toast.error('Please select a location on map first');
      return;
    }

    try {
      setLoading(true);
      const [lon, lat] = formData.destination.location.coordinates;
      const params = {
        longitude: lon,
        latitude: lat,
        distance: 50000, // 50km
        limit: 20,
      };

      if (searchCategory) {
        params.category = searchCategory;
      }
      if (searchQuery.trim()) {
        params.name = searchQuery;
      }

      const response = await api.get('/places/nearby', { params });
      setSearchResults(response.data.data.places);
      
      if (response.data.data.places.length === 0) {
        toast.error('No places found nearby');
      } else {
        toast.success(`Found ${response.data.data.places.length} places`);
      }
    } catch (error) {
      toast.error('Failed to search places');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = (place) => {
    if (!formData.startDate) {
      toast.error('Please go to Step 1 and set a start date first');
      return;
    }

    if (!place || !place._id) {
      toast.error('Invalid place selected');
      return;
    }

    if (!place.location || !place.location.coordinates) {
      toast.error('Place location is missing');
      return;
    }

    // Check if activity already exists
    const existingActivity = formData.activities.find(activity => activity.place === place._id);
    if (existingActivity) {
      toast.error('This place is already in your plan');
      return;
    }

    const activity = {
      name: place.name,
      location: {
        coordinates: place.location.coordinates,
        address: place.address || 'Unknown address',
      },
      date: formData.startDate,
      startTime: '09:00',
      endTime: '17:00',
      place: place._id,
      category: place.category,
    };
    
    setFormData({
      ...formData,
      activities: [...formData.activities, activity],
    });
    toast.success(`Added "${place.name}" to plan`);
  };

  const handleRemoveActivity = (index) => {
    const activity = formData.activities[index];
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index),
    });
    toast.success(`Removed "${activity.name}" from plan`);
  };

  const handleUpdateActivity = (index, field, value) => {
    const updatedActivities = [...formData.activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setFormData({
      ...formData,
      activities: updatedActivities,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a plan title');
      return false;
    }
    if (!formData.startDate) {
      toast.error('Please select a start date');
      return false;
    }
    if (!formData.endDate) {
      toast.error('Please select an end date');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date cannot be before start date');
      return false;
    }
    if (!formData.destination.name.trim()) {
      toast.error('Please enter a destination name');
      return false;
    }
    if (!formData.destination.location.coordinates || formData.destination.location.coordinates.length === 0) {
      toast.error('Please select a location on the map');
      return false;
    }
    if (formData.activities.length === 0) {
      toast.error('Please add at least one activity');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Format dates and activities properly
      const formattedActivities = formData.activities.map(activity => ({
        ...activity,
        date: new Date(activity.date).toISOString(),
      }));

      await api.post('/plans/create', {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        destination: {
          name: formData.destination.name,
          location: {
            type: 'Point',
            coordinates: formData.destination.location.coordinates,
          },
        },
        activities: formattedActivities,
      });
      toast.success('🎉 Plan created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
      console.error('Plan creation error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      hotel: 'bg-purple-100 text-purple-700',
      restaurant: 'bg-red-100 text-red-700',
      tourist_place: 'bg-blue-100 text-blue-700',
      shop: 'bg-green-100 text-green-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create Your Travel Plan
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Design your perfect itinerary with our step-by-step planning tool
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${
                      step === stepItem.number
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                        : step > stepItem.number
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white text-gray-400 border-2 border-gray-300'
                    }`}
                  >
                    {step > stepItem.number ? <FiCheck size={20} /> : stepItem.number}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-semibold ${
                      step >= stepItem.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {stepItem.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">{stepItem.description}</p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                      step > stepItem.number
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Tell us about your travel plan</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiEdit2 className="text-blue-500" />
                      Plan Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Summer Europe Trip 2024"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiMapPin className="text-blue-500" />
                      Destination Name *
                    </label>
                    <input
                      type="text"
                      value={formData.destination.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: { ...formData.destination, name: e.target.value },
                        })
                      }
                      placeholder="e.g., Paris, France"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FiCalendar className="text-blue-500" />
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FiCalendar className="text-blue-500" />
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FiInfo className="text-blue-500" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your tour plan, interests, and any special requirements..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Next: Location
                  <FiArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Destination</h2>
                <p className="text-gray-600">Choose your destination location on the map</p>
              </div>

              {mapError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  {mapError}
                </div>
              )}

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-1 border border-blue-100/50">
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={selectedLocation}
                  height="500px"
                  className="rounded-xl"
                />
              </div>

              {selectedLocation && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-green-500" size={20} />
                    <div>
                      <p className="font-semibold text-green-800">Location Selected</p>
                      <p className="text-sm text-green-600">
                        {selectedLocation.coordinates[1].toFixed(4)}°, {selectedLocation.coordinates[0].toFixed(4)}°
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedLocation) {
                      setMapError('Please select a location on the map before proceeding');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Next: Activities
                  <FiArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Activities */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Build Your Itinerary</h2>
                <p className="text-gray-600">Search and add activities to your travel plan</p>
              </div>

              {/* Search Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FiSearch className="text-blue-500" />
                      Search Places
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchPlaces();
                        }
                      }}
                      placeholder="Search for places (e.g., hotel, restaurant, museum)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                    >
                      <option value="">All Categories</option>
                      <option value="hotel">Hotels</option>
                      <option value="restaurant">Restaurants</option>
                      <option value="tourist_place">Tourist Places</option>
                      <option value="shop">Shops</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearchPlaces();
                  }}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch size={20} />
                      Search Nearby Places
                    </>
                  )}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiNavigation className="text-blue-500" />
                    Found {searchResults.length} Places
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((place, idx) => (
                      <div
                        key={idx}
                        onDoubleClick={() => setSelectedPlace(place)}
                        className="group bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
                        title="Double-click to view details"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg mb-1">{place.name}</p>
                            <p className="text-sm text-gray-500 mb-2">{place.address}</p>
                            <div className="flex gap-2 items-center mb-2">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(place.category)}`}>
                                {place.category.replace('_', ' ')}
                              </span>
                              {place.distanceInKm && (
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <FiMapPin size={12} />
                                  {place.distanceInKm} km away
                                </span>
                              )}
                            </div>
                            {place.averageRating > 0 && (
                              <p className="text-sm text-yellow-600 flex items-center gap-1">
                                ⭐ {place.averageRating} ({place.ratingsQuantity} reviews)
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddActivity(place)}
                          className="w-full mt-2 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <FiPlus size={18} />
                          Add to Plan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Place Details Modal */}
              {selectedPlace && (
                <PlaceDetailsModal
                  place={selectedPlace}
                  onClose={() => setSelectedPlace(null)}
                />
              )}

              {/* Selected Activities */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  Your Itinerary ({formData.activities.length} activities)
                </h3>
                {formData.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <FiInfo className="text-gray-400 mx-auto mb-3" size={32} />
                    <p className="text-gray-500">No activities added yet. Search and add places to build your itinerary.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.activities.map((activity, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-gray-900 text-lg">{activity.name}</p>
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(activity.category)}`}>
                                {activity.category.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{activity.location.address}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">
                              Date
                            </label>
                            <input
                              type="date"
                              value={activity.date}
                              onChange={(e) => handleUpdateActivity(idx, 'date', e.target.value)}
                              min={formData.startDate}
                              max={formData.endDate}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                              <FiClock size={12} />
                              Start
                            </label>
                            <input
                              type="time"
                              value={activity.startTime}
                              onChange={(e) => handleUpdateActivity(idx, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                              <FiClock size={12} />
                              End
                            </label>
                            <input
                              type="time"
                              value={activity.endTime}
                              onChange={(e) => handleUpdateActivity(idx, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">
                              Duration
                            </label>
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                              {(() => {
                                const start = new Date(`2000-01-01T${activity.startTime}`);
                                const end = new Date(`2000-01-01T${activity.endTime}`);
                                const diff = (end - start) / (1000 * 60 * 60);
                                return `${diff.toFixed(1)} hours`;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <FiCheck size={20} />
                      Create Travel Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}