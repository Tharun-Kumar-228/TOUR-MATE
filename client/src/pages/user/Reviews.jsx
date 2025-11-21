import { useState, useEffect } from 'react';
import { FiStar, FiTrash2, FiMapPin, FiCalendar, FiAlertCircle, FiEdit2, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, recent, highest, lowest
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    review: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/user/my-reviews', { 
        params: { limit: 100 } 
      });
      let reviewsList = response.data.data.reviews || [];

      // Sort based on filter
      if (filter === 'highest') {
        reviewsList.sort((a, b) => b.rating - a.rating);
      } else if (filter === 'lowest') {
        reviewsList.sort((a, b) => a.rating - b.rating);
      } else if (filter === 'recent') {
        reviewsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setReviews(reviewsList);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        setReviews(reviews.filter(r => r._id !== reviewId));
        toast.success('Review deleted successfully');
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingId(review._id);
    setEditForm({
      rating: review.rating,
      review: review.review,
    });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editForm.review.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      await api.put(`/reviews/${editingId}`, {
        rating: editForm.rating,
        review: editForm.review,
      });

      // Update local state
      setReviews(reviews.map(r => 
        r._id === editingId 
          ? { ...r, rating: editForm.rating, review: editForm.review }
          : r
      ));

      setEditingId(null);
      setEditForm({ rating: 5, review: '' });
      toast.success('Review updated successfully');
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const isPlanDeleted = (review) => {
    return !review.plan || review.plan === null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Reviews</h1>
          <p className="text-gray-600">Manage and view all your travel reviews</p>
        </div>

        {/* Filter Buttons */}
        {reviews.length > 0 && (
          <div className="mb-8 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'recent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
              }`}
            >
              Most Recent
            </button>
            <button
              onClick={() => setFilter('highest')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'highest'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
              }`}
            >
              Highest Rated
            </button>
            <button
              onClick={() => setFilter('lowest')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'lowest'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
              }`}
            >
              Lowest Rated
            </button>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
            <FiStar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">
              Start sharing your travel experiences by adding reviews to your plans.
            </p>
            <Link
              to="/plan"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Create a Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id}>
                {editingId === review._id ? (
                  // Edit Form
                  <form onSubmit={handleUpdateReview} className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Review - {review.place?.name}</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, rating: star })}
                            className={`text-2xl transition ${
                              star <= editForm.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            <FiStar size={24} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                      <textarea
                        value={editForm.review}
                        onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
                        placeholder="Update your review..."
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Review Display
                  <div
                    className={`bg-white rounded-lg shadow-md p-6 border ${
                      isPlanDeleted(review) ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'
                    } hover:shadow-lg transition`}
                  >
                    {/* Plan Deleted Warning */}
                    {isPlanDeleted(review) && (
                      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-start gap-3">
                        <FiAlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900">Plan Deleted</p>
                          <p className="text-sm text-yellow-800">
                            The plan associated with this review has been deleted. You can still view and manage this review.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {/* Place Info */}
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {review.place?.name || 'Unknown Place'}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {review.place?.category && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {review.place.category}
                              </span>
                            )}
                            {review.place?.address && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <FiMapPin size={12} />
                                {review.place.address}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating and Date */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                            <span className="ml-2 font-semibold text-gray-900">{review.rating}/5</span>
                          </div>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <FiCalendar size={14} />
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-700 leading-relaxed">{review.review}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-4 flex gap-2 flex-shrink-0">
                        {review.place && (
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(review.place.name)}/@${review.place.location?.coordinates?.[1]},${review.place.location?.coordinates?.[0]},15z`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="View place on Google Maps"
                          >
                            <FiMapPin size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Edit review"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete review"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
