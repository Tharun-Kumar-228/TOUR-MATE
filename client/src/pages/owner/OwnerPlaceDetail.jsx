import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiStar, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import ReviewCard from '../../components/ReviewCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function OwnerPlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPlace();
  }, [id]);

  const fetchPlace = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/owner/place/${id}`);
      setPlace(response.data.data.place);
      setFormData(response.data.data.place);

      // Fetch reviews
      const reviewsResponse = await api.get(`/owner/place/${id}/reviews`);
      setReviews(reviewsResponse.data.data.reviews);
    } catch (error) {
      toast.error('Failed to load place');
      navigate('/owner/dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(`/owner/place/${id}`, {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        contact: formData.contact,
        features: formData.features,
        priceRange: formData.priceRange,
      });
      setPlace(formData);
      setIsEditing(false);
      toast.success('Place updated successfully');
    } catch (error) {
      toast.error('Failed to update place');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Place not found</p>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{place.name}</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <FiMapPin size={18} />
              {place.address}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            {isEditing ? (
              <>
                <FiX size={18} />
                Cancel
              </>
            ) : (
              <>
                <FiEdit2 size={18} />
                Edit
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Place Information</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Place Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
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
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiSave size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{place.category}</p>
                  </div>

                  {place.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-700">{place.description}</p>
                    </div>
                  )}

                  {place.priceRange && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price Range</p>
                      <p className="font-semibold text-gray-900">{place.priceRange}</p>
                    </div>
                  )}

                  {place.features?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {place.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.contact?.phone || ''}
                      onChange={handleContactChange}
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
                      value={formData.contact?.email || ''}
                      onChange={handleContactChange}
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
                      value={formData.contact?.website || ''}
                      onChange={handleContactChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {place.contact?.phone && (
                    <a
                      href={`tel:${place.contact.phone}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <FiPhone size={20} className="text-green-500" />
                      <span className="text-gray-900">{place.contact.phone}</span>
                    </a>
                  )}

                  {place.contact?.email && (
                    <a
                      href={`mailto:${place.contact.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <FiMail size={20} className="text-green-500" />
                      <span className="text-gray-900">{place.contact.email}</span>
                    </a>
                  )}

                  {place.contact?.website && (
                    <a
                      href={place.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <FiGlobe size={20} className="text-green-500" />
                      <span className="text-gray-900">{place.contact.website}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Reviews */}
          <div>
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900">
                      {place.averageRating?.toFixed(1) || 'N/A'}
                    </p>
                    <FiStar size={24} className="text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">{place.ratingsQuantity || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review._id} className="pb-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{review.user?.name}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              size={12}
                              className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{review.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
