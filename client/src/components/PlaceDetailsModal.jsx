import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiPhone, FiMail, FiGlobe, FiStar } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PlaceDetailsModal({ place, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (place) {
      fetchReviews();
    }
  }, [place]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/place/${place._id}`, {
        params: { limit: 10 }
      });
      setReviews(response.data.data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{place.name}</h2>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {place.category}
              </span>
              {place.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={i < Math.round(place.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {place.averageRating} ({place.ratingsQuantity} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {place.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600">{place.description}</p>
            </div>
          )}

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
            <div className="flex items-start gap-3">
              <FiMapPin size={20} className="text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 font-medium">{place.address}</p>
                <p className="text-sm text-gray-500">
                  {place.location?.coordinates?.[1]}, {place.location?.coordinates?.[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(place.contact?.phone || place.contact?.email || place.contact?.website) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
              <div className="space-y-2">
                {place.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <FiPhone size={18} className="text-blue-500" />
                    <a href={`tel:${place.contact.phone}`} className="text-blue-600 hover:underline">
                      {place.contact.phone}
                    </a>
                  </div>
                )}
                {place.contact?.email && (
                  <div className="flex items-center gap-3">
                    <FiMail size={18} className="text-blue-500" />
                    <a href={`mailto:${place.contact.email}`} className="text-blue-600 hover:underline">
                      {place.contact.email}
                    </a>
                  </div>
                )}
                {place.contact?.website && (
                  <div className="flex items-center gap-3">
                    <FiGlobe size={18} className="text-blue-500" />
                    <a href={place.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {place.contact.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {place.features && place.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {place.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          {place.priceRange && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Range</h3>
              <p className="text-gray-600 text-lg">{place.priceRange}</p>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reviews ({reviews.length})
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={14}
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
