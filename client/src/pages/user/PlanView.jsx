import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiTrash2, FiEdit2, FiExternalLink, FiStar } from 'react-icons/fi';
import ReviewCard from '../../components/ReviewCard';
import TravelChatbot from '../../components/TravelChatbot';
import TravelIndex from '../../components/TravelIndex';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PlanView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPlaces, setAllPlaces] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    placeId: '',
    rating: 5,
    review: '',
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchPlan();
    fetchAllPlaces();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/plans/${id}`);
      setPlan(response.data.data.plan);
    } catch (error) {
      toast.error('Failed to load plan');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPlaces = async () => {
    try {
      const response = await api.get('/places', { params: { limit: 100 } });
      const places = response.data.data.places || [];
      // Ensure all places have valid _id strings
      const validPlaces = places.filter(p => p._id && typeof p._id === 'string');
      setAllPlaces(validPlaces);
    } catch (error) {
      console.error('Failed to load places:', error);
    }
  };

  useEffect(() => {
    // Get current user from localStorage or API
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({
      placeId: review.place._id,
      rating: review.rating,
      review: review.review,
    });
    setShowReviewForm(true);
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

  const handleDeletePlan = async () => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/plans/${id}`);
        toast.success('Plan deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.placeId || !reviewForm.review) {
      toast.error('Please select a place and write a review');
      return;
    }

    try {
      // Ensure placeId is a string
      const placeId = String(reviewForm.placeId).trim();
      
      if (!placeId) {
        toast.error('Invalid place selected');
        return;
      }

      if (editingReviewId) {
        // Update existing review
        await api.put(`/reviews/${editingReviewId}`, {
          place: placeId,
          rating: reviewForm.rating,
          review: reviewForm.review,
        });
        toast.success('Review updated successfully');
        setEditingReviewId(null);
      } else {
        // Create new review
        await api.post('/reviews/add', {
          place: placeId,
          rating: reviewForm.rating,
          review: reviewForm.review,
          plan: id,
        });
        toast.success('Review added successfully');
      }
      
      setReviewForm({ placeId: '', rating: 5, review: '' });
      setShowReviewForm(false);
      fetchPlan();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Plan not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              <p className="text-gray-600">{plan.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeletePlan}
                className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Destination</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin size={18} />
                {plan.destination.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <FiCalendar size={18} />
                {daysCount} days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                plan.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                plan.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {plan.status}
              </span>
            </div>
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Activities ({plan.activities?.length || 0})</h2>
          {plan.activities && plan.activities.length > 0 ? (
            <div className="space-y-4">
              {plan.activities.map((activity, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                    {activity.location?.coordinates && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activity.location.coordinates[1]},${activity.location.coordinates[0]}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
                        title="Get directions on Google Maps"
                      >
                        <FiExternalLink size={14} />
                        Directions
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(activity.date).toLocaleDateString()} • {activity.startTime} - {activity.endTime}
                  </p>
                  {activity.notes && (
                    <p className="text-sm text-gray-600">{activity.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No activities added yet</p>
          )}
        </div>

        {/* Travel Index */}
        <div className="mb-8">
          <TravelIndex 
            weather={plan.weather?.condition || 'Clear'}
            rainProbability={plan.weather?.rainProbability || 10}
            comfort={plan.weather?.temperature ? Math.min(10, Math.max(1, (plan.weather.temperature - 10) / 3)) : 8}
          />
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Add Review
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleAddReview} className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Place *
                </label>
                <select
                  value={reviewForm.placeId}
                  onChange={(e) => setReviewForm({ ...reviewForm, placeId: String(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a place to review...</option>
                  
                  {/* Show activities with place references first */}
                  {plan.activities?.filter(a => a.place).length > 0 && (
                    <>
                      <optgroup label="Plan Activities">
                        {plan.activities?.map((activity, idx) => {
                          if (!activity.place) return null;
                          const placeId = typeof activity.place === 'object' ? activity.place._id : activity.place;
                          return (
                            <option key={`activity-${idx}`} value={String(placeId)}>
                              {activity.name}
                            </option>
                          );
                        })}
                      </optgroup>
                    </>
                  )}
                  
                  {/* Show all available places */}
                  {allPlaces.length > 0 && (
                    <optgroup label="All Available Places">
                      {allPlaces.map((place) => (
                        <option key={`place-${place._id}`} value={String(place._id)}>
                          {place.name} ({place.category})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                
                {allPlaces.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Loading places...</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl transition ${
                        star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <FiStar size={24} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review *
                </label>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  placeholder="Share your experience..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard 
                  key={review._id} 
                  review={review}
                  isOwn={currentUser?._id === review.user?._id}
                  onEdit={() => handleEditReview(review)}
                  onDelete={() => handleDeleteReview(review._id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          )}
        </div>

        {/* Travel Chatbot */}
        <TravelChatbot 
          planId={id}
          location={plan.destination?.location?.coordinates ? {
            lat: plan.destination.location.coordinates[1],
            lon: plan.destination.location.coordinates[0]
          } : null}
        />
      </div>
    </div>
  );
}
