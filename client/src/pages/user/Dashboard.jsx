import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMapPin, FiCloud, FiClock, FiHeart, FiSearch, FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import WeatherCard from '../../components/WeatherCard';
import PlanCard from '../../components/PlanCard';
import ReviewCard from '../../components/ReviewCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [weather, setWeather] = useState(null);
  const [plans, setPlans] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchWeather, setSearchWeather] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
    loadSearchHistory();
    loadFavorites();
    fetchUserReviews();
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchUserReviews = async () => {
    try {
      const response = await api.get('/reviews/user/my-reviews', { params: { limit: 5 } });
      setReviews(response.data.data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews');
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

  const loadSearchHistory = () => {
    const history = localStorage.getItem('weatherSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const loadFavorites = () => {
    const favs = localStorage.getItem('favoriteCities');
    if (favs) {
      setFavorites(JSON.parse(favs));
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get current location and weather
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lon: longitude });
            await fetchWeather(latitude, longitude);
          },
          () => {
            fetchWeather(20.5937, 78.9629);
          }
        );
      }

      // Fetch user's plans
      const plansResponse = await api.get('/plans/all');
      setPlans(plansResponse.data.data.plans);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await api.get('/weather/today', {
        params: { lat, lon },
      });
      setWeather(response.data.data.weather);
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/plans/${planId}`);
        setPlans(plans.filter(p => p._id !== planId));
        toast.success('Plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const handleExecutePlan = async (planId) => {
    try {
      await api.put(`/plans/${planId}`, { status: 'in_progress' });
      setPlans(plans.map(p => p._id === planId ? { ...p, status: 'in_progress' } : p));
      toast.success('Plan execution started!');
    } catch (error) {
      toast.error('Failed to execute plan');
    }
  };

  const handleSearchWeather = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    try {
      setSearchLoading(true);
      // Use Nominatim to get coordinates from city name
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${searchCity}&format=json&limit=1`
      );
      const geoData = await geoResponse.json();

      if (!geoData.length) {
        toast.error('City not found');
        return;
      }

      const { lat, lon } = geoData[0];

      // Fetch past 7 days weather
      const response = await api.get('/weather/past7', {
        params: { lat, lon },
      });

      setSearchWeather({
        city: searchCity,
        data: response.data.data,
        coordinates: { lat, lon },
      });

      // Add to search history
      addToSearchHistory(searchCity, lat, lon);

      toast.success('Weather data loaded');
    } catch (error) {
      toast.error('Failed to fetch weather data');
    } finally {
      setSearchLoading(false);
    }
  };

  const addToSearchHistory = (city, lat, lon) => {
    const newEntry = {
      id: Date.now(),
      city,
      lat,
      lon,
      timestamp: new Date().toLocaleString(),
    };

    const updatedHistory = [newEntry, ...searchHistory].slice(0, 10); // Keep last 10
    setSearchHistory(updatedHistory);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(updatedHistory));
  };

  const toggleFavorite = (city, lat, lon) => {
    const isFavorited = favorites.some(fav => fav.city.toLowerCase() === city.toLowerCase());
    
    if (isFavorited) {
      const updated = favorites.filter(fav => fav.city.toLowerCase() !== city.toLowerCase());
      setFavorites(updated);
      localStorage.setItem('favoriteCities', JSON.stringify(updated));
      toast.success(`Removed ${city} from favorites`);
    } else {
      const newFav = { city, lat, lon };
      const updated = [...favorites, newFav];
      setFavorites(updated);
      localStorage.setItem('favoriteCities', JSON.stringify(updated));
      toast.success(`Added ${city} to favorites`);
    }
  };

  const isFavorited = (city) => {
    return favorites.some(fav => fav.city.toLowerCase() === city.toLowerCase());
  };

  const searchFromHistory = async (entry) => {
    setSearchCity(entry.city);
    try {
      setSearchLoading(true);
      const response = await api.get('/weather/past7', {
        params: { lat: entry.lat, lon: entry.lon },
      });

      setSearchWeather({
        city: entry.city,
        data: response.data.data,
        coordinates: { lat: entry.lat, lon: entry.lon },
      });

      toast.success('Weather data loaded');
    } catch (error) {
      toast.error('Failed to fetch weather data');
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Manage your tours and explore new destinations</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Link
            to="/plan"
            className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiPlus size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Create Plan</p>
              <p className="text-sm text-gray-500">Plan a new tour</p>
            </div>
          </Link>

          <Link
            to="/history"
            className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiClock size={24} className="text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">History</p>
              <p className="text-sm text-gray-500">View searches</p>
            </div>
          </Link>

          <Link
            to="/favourites"
            className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiHeart size={24} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Favorites</p>
              <p className="text-sm text-gray-500">Saved places</p>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiMapPin size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{plans.length}</p>
              <p className="text-sm text-gray-500">Total plans</p>
            </div>
          </div>
        </div>

        {/* Weather Section */}
        {weather && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Weather</h2>
            <WeatherCard
              weather={weather}
              location={location ? `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°` : 'Your Location'}
              compact={true}
            />
          </div>
        )}

        {/* Search Weather Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Weather by City</h2>
          <form onSubmit={handleSearchWeather} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Enter city name (e.g., Paris, Tokyo, New York)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <FiSearch size={20} />
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
              {searchWeather && (
                <button
                  type="button"
                  onClick={() => toggleFavorite(searchWeather.city, searchWeather.coordinates.lat, searchWeather.coordinates.lon)}
                  className={`px-6 py-3 rounded-lg transition font-semibold flex items-center gap-2 ${
                    isFavorited(searchWeather.city)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FiHeart size={20} fill={isFavorited(searchWeather.city) ? 'currentColor' : 'none'} />
                  {isFavorited(searchWeather.city) ? 'Favorited' : 'Favorite'}
                </button>
              )}
            </div>
          </form>

          {searchWeather && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                7-Day Weather for {searchWeather.city}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {searchWeather.data.daily.time.map((date, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Max Temp</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(searchWeather.data.daily.temperature_2m_max[idx])}°C
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Min Temp</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(searchWeather.data.daily.temperature_2m_min[idx])}°C
                        </p>
                      </div>
                      {searchWeather.data.daily.precipitation_sum[idx] > 0 && (
                        <div>
                          <p className="text-xs text-gray-600">Precipitation</p>
                          <p className="text-lg font-bold text-blue-600">
                            {searchWeather.data.daily.precipitation_sum[idx]}mm
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plans Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Plans</h2>
            <Link
              to="/plan"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
            >
              <FiPlus size={20} />
              New Plan
            </Link>
          </div>

          {plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
              <FiMapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Yet</h3>
              <p className="text-gray-600 mb-6">
                Start planning your next adventure by creating a new tour plan.
              </p>
              <Link
                to="/plan"
                className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Create Your First Plan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onDelete={() => handleDeletePlan(plan._id)}
                  onEdit={() => navigate(`/plan/edit/${plan._id}`)}
                  onExecute={() => handleExecutePlan(plan._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Reviews</h2>
            <Link
              to="/plan"
              className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
            >
              View All Reviews →
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
              <FiStar size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Share your travel experiences by adding reviews to your plans.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{review.place?.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {review.place?.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {review.place && (
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(review.place.name)}/@${review.place.location?.coordinates?.[1]},${review.place.location?.coordinates?.[0]},15z`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="View place on Google Maps"
                        >
                          <FiMapPin size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete review"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.review}</p>
                </div>
              ))}
              {reviews.length > 5 && (
                <Link
                  to="/plan"
                  className="block text-center py-3 text-blue-500 hover:text-blue-600 font-semibold"
                >
                  View All {reviews.length} Reviews →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
