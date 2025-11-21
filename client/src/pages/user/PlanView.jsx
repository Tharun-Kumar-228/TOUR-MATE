import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiTrash2, FiEdit2, FiExternalLink, FiStar, FiClock, FiNavigation, FiHeart, FiShare2, FiUsers, FiActivity, FiCheck } from 'react-icons/fi';
import ReviewCard from '../../components/ReviewCard';
import TravelChatbot from '../../components/TravelChatbot';
import TravelIndex from '../../components/TravelIndex';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Enhanced Cloud Background Component
const CloudBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Cloud 1 */}
      <div className="absolute top-10 left-5 animate-float-slow">
        <div className="w-32 h-12 bg-white/25 backdrop-blur-sm rounded-full shadow-2xl relative">
          <div className="absolute -top-4 left-3 w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-5 left-8 w-16 h-16 bg-white/25 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-4 left-16 w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full"></div>
        </div>
      </div>

      {/* Animated Cloud 2 */}
      <div className="absolute top-32 right-16 animate-float-medium">
        <div className="w-48 h-16 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl relative">
          <div className="absolute -top-6 left-4 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-8 left-12 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-6 left-24 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full"></div>
        </div>
      </div>

      {/* Animated Cloud 3 */}
      <div className="absolute bottom-48 left-20 animate-float-slow">
        <div className="w-40 h-14 bg-white/15 backdrop-blur-sm rounded-full shadow-2xl relative">
          <div className="absolute -top-5 left-4 w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-6 left-12 w-16 h-16 bg-white/15 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-5 left-22 w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full"></div>
        </div>
      </div>

      {/* Animated Cloud 4 */}
      <div className="absolute top-64 left-1/3 animate-float-very-slow">
        <div className="w-36 h-12 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl relative">
          <div className="absolute -top-4 left-2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-5 left-8 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full"></div>
          <div className="absolute -top-4 left-16 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/10 rounded-full animate-float-particles"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${12 + Math.random() * 15}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchPlan();
    fetchAllPlaces();
    checkIfFavorite();
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/plans/${id}`);
      setPlan(response.data.data.plan);
      // Fetch reviews for this plan
      if (response.data.data.plan.reviews) {
        setReviews(response.data.data.plan.reviews);
      }
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
      const validPlaces = places.filter(p => p._id && typeof p._id === 'string');
      setAllPlaces(validPlaces);
    } catch (error) {
      console.error('Failed to load places:', error);
    }
  };

  const checkIfFavorite = () => {
    const favoritePlans = JSON.parse(localStorage.getItem('favoritePlans') || '[]');
    setIsFavorite(favoritePlans.includes(id));
  };

  const toggleFavorite = () => {
    const favoritePlans = JSON.parse(localStorage.getItem('favoritePlans') || '[]');
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favoritePlans.filter(favId => favId !== id);
      toast.success('Removed from favorites');
    } else {
      updatedFavorites = [...favoritePlans, id];
      toast.success('Added to favorites');
    }
    
    localStorage.setItem('favoritePlans', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

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
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await api.delete(`/plans/${id}`);
        toast.success('Plan deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const handleExecutePlan = async () => {
    try {
      await api.put(`/plans/${id}`, { status: 'in_progress' });
      setPlan({ ...plan, status: 'in_progress' });
      toast.success('Plan execution started!');
    } catch (error) {
      toast.error('Failed to execute plan');
    }
  };

  const handleCompletePlan = async () => {
    try {
      await api.put(`/plans/${id}`, { status: 'completed' });
      setPlan({ ...plan, status: 'completed' });
      toast.success('Plan marked as completed!');
    } catch (error) {
      toast.error('Failed to complete plan');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.placeId || !reviewForm.review) {
      toast.error('Please select a place and write a review');
      return;
    }

    try {
      const placeId = String(reviewForm.placeId).trim();
      
      if (!placeId) {
        toast.error('Invalid place selected');
        return;
      }

      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, {
          place: placeId,
          rating: reviewForm.rating,
          review: reviewForm.review,
        });
        toast.success('Review updated successfully');
        setEditingReviewId(null);
      } else {
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

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: '📋',
      in_progress: '🚀',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[status] || '📁';
  };

  const sharePlan = async () => {
    const shareUrl = `${window.location.origin}/plan/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan.title,
          text: plan.description,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Plan link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        <CloudBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your plan...</p>
          <p className="text-gray-500 text-sm mt-2">Getting everything ready</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        <CloudBackground />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="text-blue-500" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Plan Not Found</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            The plan you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
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
  const today = new Date();
  const isUpcoming = startDate > today;
  const isActive = plan.status === 'in_progress';
  const isCompleted = plan.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 relative overflow-hidden">
      {/* Enhanced Cloud Background */}
      <CloudBackground />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getStatusIcon(plan.status)}</span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(plan.status)}`}>
                  {plan.status.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isFavorite 
                      ? 'text-red-500 bg-red-50' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {plan.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">{plan.description}</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => navigate(`/plan/edit/${id}`)}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                title="Edit plan"
              >
                <FiEdit2 size={20} />
              </button>
              <button
                onClick={sharePlan}
                className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                title="Share plan"
              >
                <FiShare2 size={20} />
              </button>
              <button
                onClick={handleDeletePlan}
                className="p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                title="Delete plan"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                <FiMapPin className="text-blue-600" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Destination</p>
              <p className="font-bold text-gray-900">{plan.destination.name}</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                <FiCalendar className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-bold text-gray-900">{daysCount} days</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                <FiActivity className="text-purple-600" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Activities</p>
              <p className="font-bold text-gray-900">{plan.activities?.length || 0}</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                <FiClock className="text-orange-600" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="font-bold text-gray-900 capitalize">{plan.status.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            {plan.status === 'planning' && (
              <button
                onClick={handleExecutePlan}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 backdrop-blur-sm group"
              >
                <FiNavigation size={20} className="group-hover:animate-pulse" />
                Start Journey
                <span className="text-lg">🚀</span>
              </button>
            )}
            {plan.status === 'in_progress' && (
              <button
                onClick={handleCompletePlan}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 backdrop-blur-sm group"
              >
                <FiCheck size={20} className="group-hover:scale-110 transition-transform" />
                Mark Complete
                <span className="text-lg">🎉</span>
              </button>
            )}
            <button 
              onClick={sharePlan}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 backdrop-blur-sm group"
            >
              <FiShare2 size={20} className="group-hover:scale-110 transition-transform" />
              Share Plan
              <span className="text-lg">📤</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/20 mb-8">
          <div className="flex space-x-1">
            {['overview', 'activities', 'reviews', 'weather'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Travel Index */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FiActivity className="text-blue-500" />
                Travel Comfort Index
              </h2>
              <TravelIndex 
                weather={plan.weather?.condition || 'Clear'}
                rainProbability={plan.weather?.rainProbability || 10}
                comfort={plan.weather?.temperature ? Math.min(10, Math.max(1, (plan.weather.temperature - 10) / 3)) : 8}
              />
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FiCalendar className="text-green-500" />
                  Trip Dates
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-semibold text-gray-900">
                      {startDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-semibold text-gray-900">
                      {endDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-semibold text-gray-900">{daysCount} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FiMapPin className="text-red-500" />
                  Destination Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Location</span>
                    <span className="font-semibold text-gray-900">{plan.destination.name}</span>
                  </div>
                  {plan.destination.location?.coordinates && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Coordinates</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {plan.destination.location.coordinates[1].toFixed(4)}°, {plan.destination.location.coordinates[0].toFixed(4)}°
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Activities Planned</span>
                    <span className="font-semibold text-gray-900">{plan.activities?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FiActivity className="text-blue-500" />
              Itinerary ({plan.activities?.length || 0} activities)
            </h2>
            {plan.activities && plan.activities.length > 0 ? (
              <div className="space-y-4">
                {plan.activities.map((activity, idx) => (
                  <div 
                    key={idx} 
                    className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <h3 className="font-bold text-gray-900 text-xl">{activity.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{activity.location?.address}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <FiCalendar size={14} />
                            {new Date(activity.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="flex items-center gap-2">
                            <FiClock size={14} />
                            {activity.startTime} - {activity.endTime}
                          </span>
                        </div>
                      </div>
                      {activity.location?.coordinates && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${activity.location.coordinates[1]},${activity.location.coordinates[0]}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                          title="Get directions on Google Maps"
                        >
                          <FiExternalLink size={18} />
                        </a>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3 border border-white/50 backdrop-blur-sm">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Activities Yet</h3>
                <p className="text-gray-600 mb-6">Add some activities to make your plan complete!</p>
                <button
                  onClick={() => navigate(`/plan/edit/${id}`)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  Edit Plan to Add Activities
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingReviewId ? 'Edit Review' : 'Add New Review'}
                </h3>
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Place *
                    </label>
                    <select
                      value={reviewForm.placeId}
                      onChange={(e) => setReviewForm({ ...reviewForm, placeId: String(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200 backdrop-blur-sm"
                    >
                      <option value="">Choose a place to review...</option>
                      {plan.activities?.filter(a => a.place).length > 0 && (
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
                      )}
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`text-2xl transition-all duration-200 transform hover:scale-110 ${
                            star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <FiStar size={24} fill={star <= reviewForm.rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Review *
                    </label>
                    <textarea
                      value={reviewForm.review}
                      onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                      placeholder="Share your experience about this place..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200 resize-none backdrop-blur-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    >
                      {editingReviewId ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setEditingReviewId(null);
                        setReviewForm({ placeId: '', rating: 5, review: '' });
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FiStar className="text-yellow-500" />
                  Reviews
                </h2>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 backdrop-blur-sm"
                  >
                    <FiEdit2 size={18} />
                    Add Review
                  </button>
                )}
              </div>

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
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiStar className="text-yellow-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FiActivity className="text-blue-500" />
              Weather Forecast
            </h2>
            <TravelIndex 
              weather={plan.weather?.condition || 'Clear'}
              rainProbability={plan.weather?.rainProbability || 10}
              comfort={plan.weather?.temperature ? Math.min(10, Math.max(1, (plan.weather.temperature - 10) / 3)) : 8}
            />
          </div>
        )}

        {/* Travel Chatbot */}
        <div className="mt-8">
          <TravelChatbot 
            planId={id}
            location={plan.destination?.location?.coordinates ? {
              lat: plan.destination.location.coordinates[1],
              lon: plan.destination.location.coordinates[0]
            } : null}
          />
        </div>
      </div>

      {/* Add CSS animations for clouds */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(8px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(-12px); }
        }
        @keyframes float-very-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(4px); }
        }
        @keyframes float-particles {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
          50% { transform: translateY(-15px) translateX(-20px); opacity: 0.8; }
          75% { transform: translateY(-45px) translateX(-8px); opacity: 0.5; }
        }
        .animate-float-slow {
          animation: float-slow 9s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 7s ease-in-out infinite;
        }
        .animate-float-very-slow {
          animation: float-very-slow 11s ease-in-out infinite;
        }
        .animate-float-particles {
          animation: float-particles linear infinite;
        }
      `}</style>
    </div>
  );
}