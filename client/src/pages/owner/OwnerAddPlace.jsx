import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiSearch, FiPlus } from 'react-icons/fi';
import MapPicker from '../../components/MapPicker';
import PlaceDetailsModal from '../../components/PlaceDetailsModal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function OwnerAddPlace() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'tourist_place',
    description: '',
    address: '',
    location: { coordinates: [] },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    features: [],
    priceRange: '',
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchTab, setShowSearchTab] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      contact: { ...formData.contact, [name]: value },
    });
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      location,
    });
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSearchPlaces = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!searchQuery.trim()) {
      toast.error('Please enter a place name');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=10`
      );
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        toast.error('No places found');
      } else {
        toast.success(`Found ${data.length} places`);
      }
    } catch (error) {
      toast.error('Failed to search places');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (place) => {
    setFormData({
      ...formData,
      name: formData.name || place.display_name.split(',')[0],
      address: place.display_name,
      location: {
        coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
      },
    });
    setSelectedLocation({
      coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
    });
    setSearchResults([]);
    setSearchQuery('');
    setShowSearchTab(false);
    toast.success('Location selected! You can edit the name if needed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.location.coordinates.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/owner/add-place', {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        location: formData.location,
        contact: formData.contact,
        features: formData.features,
        priceRange: formData.priceRange || undefined,
      });
      toast.success('Place added successfully!');
      navigate('/owner/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add place');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Place</h1>
          <p className="text-gray-600">Register your business on TourMate</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 border border-gray-100 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Eiffel Tower, Taj Mahal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="tourist_place">Tourist Place</option>
                    <option value="shop">Shop</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select price range</option>
                    <option value="$">$ (Budget)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Expensive)</option>
                    <option value="$$$$">$$$$ (Very Expensive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your place..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setShowSearchTab(false)}
                className={`px-4 py-2 font-semibold transition ${
                  !showSearchTab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiMapPin className="inline mr-2" size={18} />
                Pick on Map
              </button>
              <button
                type="button"
                onClick={() => setShowSearchTab(true)}
                className={`px-4 py-2 font-semibold transition ${
                  showSearchTab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiSearch className="inline mr-2" size={18} />
                Search Place
              </button>
            </div>

            {/* Map Picker Tab */}
            {!showSearchTab && (
              <div>
                <p className="text-gray-600 mb-4">Click on the map to select your place location</p>
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={selectedLocation}
                  height="400px"
                />
              </div>
            )}

            {/* Search Tab */}
            {showSearchTab && (
              <div className="space-y-4">
                <p className="text-gray-600">Search for your place location</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchPlaces(e);
                      }
                    }}
                    placeholder="Search for a place (e.g., Eiffel Tower, Times Square)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSearchPlaces(e);
                    }}
                    disabled={searchLoading}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiSearch size={18} />
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="p-4 space-y-2">
                      {searchResults.map((place, idx) => (
                        <div
                          key={idx}
                          onDoubleClick={() => setSelectedPlace(place)}
                          onClick={() => handleSelectSearchResult(place)}
                          className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition cursor-pointer"
                          title="Double-click to view details or click to select"
                        >
                          <p className="font-semibold text-gray-900">{place.display_name.split(',')[0]}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">{place.display_name}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {place.type}
                            </span>
                            <span className="text-xs text-gray-600">
                              📍 {place.lat}, {place.lon}
                            </span>
                          </div>
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
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.contact.phone}
                  onChange={handleContactChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.contact.email}
                  onChange={handleContactChange}
                  placeholder="contact@place.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.contact.website}
                  onChange={handleContactChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="e.g., WiFi, Parking, Air Conditioning"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
              >
                Add
              </button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/owner/dashboard')}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding Place...' : 'Add Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
