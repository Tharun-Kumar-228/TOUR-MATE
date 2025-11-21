import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiSearch, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
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
    };
    
    setFormData({
      ...formData,
      activities: [...formData.activities, activity],
    });
    toast.success(`Added "${place.name}" to plan`);
  };

  const handleRemoveActivity = (index) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index),
    });
  };

  const handleUpdateActivity = (index, field, value) => {
    const updatedActivities = [...formData.activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setFormData({
      ...formData,
      activities: updatedActivities,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate || !formData.destination.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.destination.location.coordinates || formData.destination.location.coordinates.length === 0) {
      toast.error('Please select a location on the map');
      return;
    }

    if (formData.activities.length === 0) {
      toast.error('Please add at least one activity');
      return;
    }

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
      toast.success('Plan created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
      console.error('Plan creation error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Plan Your Tour</h1>
          <p className="text-gray-600">Create a detailed itinerary for your next adventure</p>
        </div>

        {/* Steps */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                step === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Step {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Europe Trip 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your tour plan..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Next: Location
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Location on Map</h2>
              <p className="text-gray-600">Click on the map to select your destination location</p>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation}
                height="500px"
              />

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Next: Activities
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Activities */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Activities</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="hotel">Hotels</option>
                    <option value="restaurant">Restaurants</option>
                    <option value="tourist_place">Tourist Places</option>
                    <option value="shop">Shops</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearchPlaces();
                  }}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search Nearby Places'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((place, idx) => (
                    <div
                      key={idx}
                      onDoubleClick={() => setSelectedPlace(place)}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition"
                      title="Double-click to view details"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{place.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{place.address}</p>
                          <div className="flex gap-2 items-center mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {place.category}
                            </span>
                            {place.distanceInKm && (
                              <span className="text-xs text-gray-600">
                                📍 {place.distanceInKm} km away
                              </span>
                            )}
                          </div>
                          {place.averageRating > 0 && (
                            <p className="text-xs text-yellow-600">⭐ {place.averageRating} ({place.ratingsQuantity} reviews)</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddActivity(place)}
                        className="w-full mt-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                      >
                        <FiPlus size={18} />
                        Add to Plan
                      </button>
                    </div>
                  ))}
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Activities ({formData.activities.length})
                </h3>
                {formData.activities.length === 0 ? (
                  <p className="text-gray-500">No activities added yet</p>
                ) : (
                  <div className="space-y-3">
                    {formData.activities.map((activity, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="font-semibold text-gray-900">{activity.name}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Date
                            </label>
                            <input
                              type="date"
                              value={activity.date}
                              onChange={(e) => handleUpdateActivity(idx, 'date', e.target.value)}
                              min={formData.startDate}
                              max={formData.endDate}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={activity.startTime}
                              onChange={(e) => handleUpdateActivity(idx, 'startTime', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={activity.endTime}
                              onChange={(e) => handleUpdateActivity(idx, 'endTime', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
