import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMapPin, FiStar, FiTrash2, FiEdit2, FiExternalLink } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const [places, setPlaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalReviews: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchPlaces();
    fetchReviews();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/owner/my-places');
      setPlaces(response.data.data.places);

      // Calculate stats
      const totalReviews = response.data.data.places.reduce(
        (sum, place) => sum + (place.ratingsQuantity || 0),
        0
      );
      const avgRating =
        response.data.data.places.length > 0
          ? response.data.data.places.reduce((sum, place) => sum + (place.averageRating || 0), 0) /
            response.data.data.places.length
          : 0;

      setStats({
        totalPlaces: response.data.data.places.length,
        totalReviews,
        averageRating: avgRating.toFixed(1),
      });
    } catch (error) {
      toast.error('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get('/reviews/owner/my-reviews', { params: { limit: 50 } });
      console.log('Reviews response:', response.data);
      setReviews(response.data.data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await api.delete(`/owner/place/${placeId}`);
        setPlaces(places.filter(p => p._id !== placeId));
        toast.success('Place deleted successfully');
      } catch (error) {
        toast.error('Failed to delete place');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
          <p className="text-gray-600">Manage your places and reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm mb-2">Total Places</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalPlaces}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm mb-2">Total Reviews</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalReviews}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm mb-2">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold text-gray-900">{stats.averageRating}</p>
              <FiStar size={24} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <Link
            to="/owner/add-place"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            <FiPlus size={20} />
            Add New Place
          </Link>
        </div>

        {/* Places Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Places</h2>
          {places.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
              <FiMapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Places Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first place to TourMate.
              </p>
              <Link
                to="/owner/add-place"
                className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
              >
                Add Your First Place
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div
                  key={place._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
                >
                  {place.images?.[0] && (
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {place.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 flex items-start gap-2">
                      <FiMapPin size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{place.address}</span>
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {place.category}
                      </span>
                      {place.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <FiStar size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            {place.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({place.ratingsQuantity})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/owner/places/${place._id}`}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </Link>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${place.location?.coordinates[1]}&mlon=${place.location?.coordinates[0]}&zoom=15`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <FiExternalLink size={16} />
                        Map
                      </a>
                      <button
                        onClick={() => handleDeletePlace(place._id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
              <FiStar size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Reviews from users will appear here once they start reviewing your places.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {review.place?.name || 'Unknown Place'}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {review.place?.category || 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        By {review.user?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
