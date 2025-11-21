import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiMapPin, FiCloud, FiClock, FiHeart, FiSearch, FiStar, FiEdit2, FiTrash2, FiNavigation, FiCalendar, FiUser, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import WeatherCard from '../../components/WeatherCard';
import PlanCard from '../../components/PlanCard';
import ReviewCard from '../../components/ReviewCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Chart component for weather visualization
const WeatherChart = ({ weatherData, city }) => {
  const [activeChart, setActiveChart] = useState('temperature');
  
  if (!weatherData) return null;

  const { daily } = weatherData;
  const days = daily.time.map(date => 
    new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
  );

  // Calculate chart dimensions and scales
  const maxTemp = Math.max(...daily.temperature_2m_max);
  const minTemp = Math.min(...daily.temperature_2m_min);
  const maxPrecip = Math.max(...daily.precipitation_sum);
  
  const tempRange = maxTemp - minTemp;
  const chartHeight = 200;

  const getTempY = (temp) => {
    return chartHeight - ((temp - minTemp) / tempRange) * chartHeight;
  };

  const getPrecipY = (precip) => {
    return chartHeight - (precip / maxPrecip) * chartHeight * 0.8;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Weather Analysis for {city}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('temperature')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeChart === 'temperature'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveChart('precipitation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeChart === 'precipitation'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Precipitation
          </button>
        </div>
      </div>

      {activeChart === 'temperature' && (
        <div className="space-y-6">
          {/* Temperature Chart */}
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{Math.ceil(maxTemp)}°C</span>
              <span>{Math.ceil((maxTemp + minTemp) / 2)}°C</span>
              <span>{Math.floor(minTemp)}°C</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-12 relative" style={{ height: `${chartHeight}px` }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 0.5, 1].map((pos) => (
                  <div key={pos} className="border-t border-gray-200" />
                ))}
              </div>

              {/* Temperature lines */}
              <svg width="100%" height={chartHeight} className="overflow-visible">
                {/* Max temperature line */}
                <path
                  d={`M0,${getTempY(daily.temperature_2m_max[0])} ${daily.temperature_2m_max.map((temp, i) => 
                    `L${i * 80},${getTempY(temp)}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="url(#maxTempGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* Min temperature line */}
                <path
                  d={`M0,${getTempY(daily.temperature_2m_min[0])} ${daily.temperature_2m_min.map((temp, i) => 
                    `L${i * 80},${getTempY(temp)}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="url(#minTempGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data points for max temp */}
                {daily.temperature_2m_max.map((temp, i) => (
                  <g key={`max-${i}`}>
                    <circle
                      cx={i * 80}
                      cy={getTempY(temp)}
                      r="4"
                      fill="url(#maxTempGradient)"
                    />
                    <text
                      x={i * 80}
                      y={getTempY(temp) - 10}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-orange-600"
                    >
                      {Math.round(temp)}°
                    </text>
                  </g>
                ))}

                {/* Data points for min temp */}
                {daily.temperature_2m_min.map((temp, i) => (
                  <g key={`min-${i}`}>
                    <circle
                      cx={i * 80}
                      cy={getTempY(temp)}
                      r="4"
                      fill="url(#minTempGradient)"
                    />
                    <text
                      x={i * 80}
                      y={getTempY(temp) + 15}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-blue-600"
                    >
                      {Math.round(temp)}°
                    </text>
                  </g>
                ))}

                <defs>
                  <linearGradient id="maxTempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="minTempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
                {days.map((day, i) => (
                  <div key={i} className="text-center w-16">
                    <div className="text-sm font-semibold text-gray-900">{day}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(daily.time[i]).getDate()}/{new Date(daily.time[i]).getMonth() + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Temperature Legend */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              <span className="text-gray-700">Max Temperature</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              <span className="text-gray-700">Min Temperature</span>
            </div>
          </div>

          {/* Temperature Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(Math.max(...daily.temperature_2m_max))}°C
              </div>
              <div className="text-sm text-orange-700">Highest Temp</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(Math.min(...daily.temperature_2m_min))}°C
              </div>
              <div className="text-sm text-blue-700">Lowest Temp</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(daily.temperature_2m_max.reduce((a, b) => a + b, 0) / daily.temperature_2m_max.length)}°C
              </div>
              <div className="text-sm text-purple-700">Avg High</div>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-xl border border-cyan-100">
              <div className="text-2xl font-bold text-cyan-600">
                {Math.round(daily.temperature_2m_min.reduce((a, b) => a + b, 0) / daily.temperature_2m_min.length)}°C
              </div>
              <div className="text-sm text-cyan-700">Avg Low</div>
            </div>
          </div>
        </div>
      )}

      {activeChart === 'precipitation' && (
        <div className="space-y-6">
          {/* Precipitation Chart */}
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{maxPrecip.toFixed(1)}mm</span>
              <span>{(maxPrecip / 2).toFixed(1)}mm</span>
              <span>0mm</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-12 relative" style={{ height: `${chartHeight}px` }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 0.5, 1].map((pos) => (
                  <div key={pos} className="border-t border-gray-200" />
                ))}
              </div>

              {/* Precipitation bars */}
              <svg width="100%" height={chartHeight} className="overflow-visible">
                {daily.precipitation_sum.map((precip, i) => (
                  <g key={i}>
                    {/* Bar */}
                    <rect
                      x={i * 80 + 20}
                      y={getPrecipY(precip)}
                      width="40"
                      height={chartHeight - getPrecipY(precip)}
                      fill="url(#precipGradient)"
                      rx="4"
                    />
                    {/* Value label */}
                    {precip > 0 && (
                      <text
                        x={i * 80 + 40}
                        y={getPrecipY(precip) - 5}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-blue-600"
                      >
                        {precip.toFixed(1)}mm
                      </text>
                    )}
                  </g>
                ))}

                <defs>
                  <linearGradient id="precipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
                {days.map((day, i) => (
                  <div key={i} className="text-center w-16">
                    <div className="text-sm font-semibold text-gray-900">{day}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(daily.time[i]).getDate()}/{new Date(daily.time[i]).getMonth() + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Precipitation Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {daily.precipitation_sum.reduce((a, b) => a + b, 0).toFixed(1)}mm
              </div>
              <div className="text-sm text-blue-700">Total Rainfall</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {daily.precipitation_sum.filter(p => p > 0).length}
              </div>
              <div className="text-sm text-green-700">Rainy Days</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-2xl font-bold text-red-600">
                {Math.max(...daily.precipitation_sum).toFixed(1)}mm
              </div>
              <div className="text-sm text-red-700">Heaviest Rain</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="text-2xl font-bold text-indigo-600">
                {(daily.precipitation_sum.reduce((a, b) => a + b, 0) / daily.precipitation_sum.length).toFixed(1)}mm
              </div>
              <div className="text-sm text-indigo-700">Daily Average</div>
            </div>
          </div>

          {/* Weather Recommendations */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              Travel Recommendations
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              {daily.precipitation_sum.filter(p => p > 5).length >= 3 ? (
                <p>🌧️ Heavy rainfall expected - Consider indoor activities and waterproof gear</p>
              ) : daily.precipitation_sum.filter(p => p > 0).length >= 2 ? (
                <p>🌦️ Light showers expected - Carry an umbrella and plan flexible outdoor activities</p>
              ) : (
                <p>☀️ Mostly dry weather - Perfect for outdoor activities and sightseeing</p>
              )}
              
              {Math.max(...daily.temperature_2m_max) > 30 ? (
                <p>🔥 Hot temperatures - Stay hydrated and plan activities during cooler hours</p>
              ) : Math.min(...daily.temperature_2m_min) < 10 ? (
                <p>❄️ Cool temperatures - Pack warm clothing for mornings and evenings</p>
              ) : (
                <p>🌡️ Mild temperatures - Comfortable weather for all types of activities</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Weather Summary Component
const WeatherSummary = ({ weatherData, city }) => {
  if (!weatherData) return null;

  const { daily } = weatherData;
  const avgHigh = daily.temperature_2m_max.reduce((a, b) => a + b, 0) / daily.temperature_2m_max.length;
  const avgLow = daily.temperature_2m_min.reduce((a, b) => a + b, 0) / daily.temperature_2m_min.length;
  const totalRainfall = daily.precipitation_sum.reduce((a, b) => a + b, 0);
  const rainyDays = daily.precipitation_sum.filter(p => p > 0).length;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">7-Day Summary</h3>
        <FiBarChart2 size={20} />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-blue-100">Avg High</p>
          <p className="text-xl font-bold">{Math.round(avgHigh)}°C</p>
        </div>
        <div>
          <p className="text-blue-100">Avg Low</p>
          <p className="text-xl font-bold">{Math.round(avgLow)}°C</p>
        </div>
        <div>
          <p className="text-blue-100">Total Rain</p>
          <p className="text-xl font-bold">{totalRainfall.toFixed(1)}mm</p>
        </div>
        <div>
          <p className="text-blue-100">Rainy Days</p>
          <p className="text-xl font-bold">{rainyDays}</p>
        </div>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('overview');
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your travel experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with User Welcome */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back{currentUser?.name ? `, ${currentUser.name}` : ''}!
              </h1>
              <p className="text-gray-600 text-lg">Manage your tours and explore new destinations</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <FiUser className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentUser?.name || 'Traveler'}</p>
                  <p className="text-xs text-gray-500">Ready to explore</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/20 max-w-md">
            <div className="flex space-x-1">
              {['overview', 'plans', 'weather', 'reviews'].map((tab) => (
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            to="/plan"
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiPlus size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Create Plan</p>
                <p className="text-sm text-gray-500 mt-1">Plan a new tour</p>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></div>
          </Link>

          <Link
            to="/history"
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiClock size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">History</p>
                <p className="text-sm text-gray-500 mt-1">View searches</p>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></div>
          </Link>

          <Link
            to="/favourites"
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiHeart size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Favorites</p>
                <p className="text-sm text-gray-500 mt-1">Saved places</p>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></div>
          </Link>

          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiMapPin size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{plans.length}</p>
                <p className="text-sm text-gray-500 mt-1">Total plans</p>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></div>
          </div>
        </div>

        {/* Weather Section */}
        {weather && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiCloud className="text-blue-500" size={18} />
                </div>
                Current Weather
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiNavigation size={16} />
                <span>{location ? `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°` : 'Your Location'}</span>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <WeatherCard
                weather={weather}
                location={location ? `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°` : 'Your Location'}
                compact={true}
              />
            </div>
          </div>
        )}

        {/* Search Weather Section with Enhanced Chart */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FiSearch className="text-green-500" size={18} />
              </div>
              Search Weather by City
            </h2>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <form onSubmit={handleSearchWeather} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter city name (e.g., Paris, Tokyo, New York)"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <FiSearch size={20} />
                  {searchLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    'Search Weather'
                  )}
                </button>
                {searchWeather && (
                  <button
                    type="button"
                    onClick={() => toggleFavorite(searchWeather.city, searchWeather.coordinates.lat, searchWeather.coordinates.lon)}
                    className={`px-6 py-4 rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      isFavorited(searchWeather.city)
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <FiHeart size={20} fill={isFavorited(searchWeather.city) ? 'currentColor' : 'none'} />
                    {isFavorited(searchWeather.city) ? 'Favorited' : 'Favorite'}
                  </button>
                )}
              </div>
            </form>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 5).map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => searchFromHistory(entry)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <FiClock size={14} />
                      {entry.city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchWeather && (
              <div className="space-y-6">
                {/* Chart Toggle */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <WeatherSummary weatherData={searchWeather.data} city={searchWeather.city} />
                  <button
                    onClick={() => setShowChart(!showChart)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl w-full lg:w-auto justify-center"
                  >
                    <FiBarChart2 size={20} />
                    {showChart ? 'Hide Analysis' : 'Show Analysis'}
                  </button>
                </div>

                {/* Weather Chart */}
                {showChart && (
                  <WeatherChart weatherData={searchWeather.data} city={searchWeather.city} />
                )}

                {/* Original Weather Cards */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <FiMapPin className="text-red-500" size={24} />
                      7-Day Weather for {searchWeather.city}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar size={16} />
                      <span>Past 7 days</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {searchWeather.data.daily.time.map((date, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white rounded-xl p-4 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <p className="font-bold text-gray-900 mb-3 text-center">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="space-y-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 uppercase tracking-wide">Max Temp</p>
                            <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                              {Math.round(searchWeather.data.daily.temperature_2m_max[idx])}°C
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 uppercase tracking-wide">Min Temp</p>
                            <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                              {Math.round(searchWeather.data.daily.temperature_2m_min[idx])}°C
                            </p>
                          </div>
                          {searchWeather.data.daily.precipitation_sum[idx] > 0 && (
                            <div className="text-center">
                              <p className="text-xs text-gray-600 uppercase tracking-wide">Precipitation</p>
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
              </div>
            )}
          </div>
        </div>

        {/* Plans Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMapPin className="text-purple-500" size={18} />
              </div>
              Your Travel Plans
            </h2>
            <Link
              to="/plan"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl w-fit"
            >
              <FiPlus size={20} />
              New Plan
            </Link>
          </div>

          {plans.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiMapPin size={32} className="text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Plans Yet</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                Start planning your next adventure by creating a new tour plan. Discover amazing destinations and create unforgettable memories.
              </p>
              <Link
                to="/plan"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiStar className="text-yellow-500" size={18} />
              </div>
              Your Reviews
            </h2>
            <Link
              to="/plan"
              className="text-blue-500 hover:text-blue-600 text-sm font-semibold flex items-center gap-2 group"
            >
              View All Reviews 
              <FiPlus size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiStar size={32} className="text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reviews Yet</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Share your travel experiences by adding reviews to your plans. Help other travelers discover amazing places!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div 
                  key={review._id} 
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h4 className="font-bold text-gray-900 text-lg">{review.place?.name}</h4>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm rounded-full font-medium w-fit">
                          {review.place?.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-3">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {review.place && (
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(review.place.name)}/@${review.place.location?.coordinates?.[1]},${review.place.location?.coordinates?.[0]},15z`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View place on Google Maps"
                        >
                          <FiMapPin size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete review"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>
                </div>
              ))}
              {reviews.length > 5 && (
                <Link
                  to="/plan"
                  className="block text-center py-4 text-blue-500 hover:text-blue-600 font-semibold text-lg bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-200"
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