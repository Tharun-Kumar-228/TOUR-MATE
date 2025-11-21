import { useState, useEffect } from 'react';
import { FiHeart, FiMapPin, FiTrash2, FiSearch, FiNavigation, FiStar, FiClock, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Favourites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [loadingWeather, setLoadingWeather] = useState({});

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    // Fetch weather data for all favorites
    if (favorites.length > 0) {
      fetchAllFavoritesWeather();
    }
  }, [favorites]);

  const loadFavorites = () => {
    try {
      setLoading(true);
      const savedFavorites = localStorage.getItem('favoriteCities');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFavoritesWeather = async () => {
    const newWeatherData = { ...weatherData };
    const newLoadingWeather = { ...loadingWeather };

    for (const favorite of favorites) {
      if (!weatherData[favorite.city]) {
        newLoadingWeather[favorite.city] = true;
        try {
          const response = await api.get('/weather/today', {
            params: { lat: favorite.lat, lon: favorite.lon },
          });
          newWeatherData[favorite.city] = response.data.data.weather;
        } catch (error) {
          console.error(`Failed to fetch weather for ${favorite.city}:`, error);
          newWeatherData[favorite.city] = null;
        } finally {
          newLoadingWeather[favorite.city] = false;
        }
      }
    }

    setWeatherData(newWeatherData);
    setLoadingWeather(newLoadingWeather);
  };

  const fetchFavoriteWeather = async (favorite) => {
    setLoadingWeather(prev => ({ ...prev, [favorite.city]: true }));
    try {
      const response = await api.get('/weather/today', {
        params: { lat: favorite.lat, lon: favorite.lon },
      });
      setWeatherData(prev => ({
        ...prev,
        [favorite.city]: response.data.data.weather
      }));
    } catch (error) {
      console.error(`Failed to fetch weather for ${favorite.city}:`, error);
      toast.error(`Failed to load weather for ${favorite.city}`);
    } finally {
      setLoadingWeather(prev => ({ ...prev, [favorite.city]: false }));
    }
  };

  const handleRemoveFavorite = (city) => {
    const updated = favorites.filter(fav => fav.city !== city);
    setFavorites(updated);
    localStorage.setItem('favoriteCities', JSON.stringify(updated));
    
    // Remove from weather data
    setWeatherData(prev => {
      const newData = { ...prev };
      delete newData[city];
      return newData;
    });

    toast.success(`Removed ${city} from favorites`);
  };

  const handleRemoveAllFavorites = () => {
    if (favorites.length === 0) return;
    
    if (window.confirm('Are you sure you want to remove all favorite cities?')) {
      setFavorites([]);
      localStorage.setItem('favoriteCities', JSON.stringify([]));
      setWeatherData({});
      toast.success('All favorites removed');
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-cyan-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWeatherIcon = (weatherCode) => {
    // Simple mapping based on common weather codes
    if (weatherCode === 0) return '☀️'; // Clear sky
    if (weatherCode >= 1 && weatherCode <= 3) return '⛅'; // Partly cloudy
    if (weatherCode >= 45 && weatherCode <= 48) return '🌫️'; // Fog
    if (weatherCode >= 51 && weatherCode <= 67) return '🌧️'; // Rain
    if (weatherCode >= 71 && weatherCode <= 77) return '❄️'; // Snow
    if (weatherCode >= 80 && weatherCode <= 82) return '🌦️'; // Rain showers
    if (weatherCode >= 95 && weatherCode <= 99) return '⛈️'; // Thunderstorm
    return '🌤️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your favorites...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your special places</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Favorite Cities
              </h1>
              <p className="text-gray-600 text-lg">Your collection of special weather locations</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl text-sm font-semibold text-gray-700 border border-white/20">
                {favorites.length} {favorites.length === 1 ? 'City' : 'Cities'}
              </span>
              {favorites.length > 0 && (
                <button
                  onClick={handleRemoveAllFavorites}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FiTrash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {favorites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <FiHeart className="text-pink-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                    <p className="text-sm text-gray-600">Total Favorites</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiMapPin className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {[...new Set(favorites.map(f => f.country))].length}
                    </p>
                    <p className="text-sm text-gray-600">Countries</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiNavigation className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(weatherData).length}
                    </p>
                    <p className="text-sm text-gray-600">Weather Loaded</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-16 text-center border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiHeart size={40} className="text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Favorite Cities Yet</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Start building your collection by searching for weather in different cities and clicking the heart icon to add them to your favorites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <FiSearch size={20} />
                Search Weather
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold border border-gray-200 shadow-lg hover:shadow-xl"
              >
                <FiPlus size={20} />
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {favorites.map((favorite, index) => (
              <div
                key={favorite.city}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <FiHeart size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{favorite.city}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <FiMapPin size={14} />
                          {parseFloat(favorite.lat).toFixed(4)}°, {parseFloat(favorite.lon).toFixed(4)}°
                          {favorite.country && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {favorite.country}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.city)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Remove from favorites"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                {/* Weather Information */}
                <div className="space-y-4">
                  {loadingWeather[favorite.city] ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
                    </div>
                  ) : weatherData[favorite.city] ? (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getWeatherIcon(weatherData[favorite.city].weathercode)}
                          </span>
                          <div>
                            <p className="text-sm text-gray-600">Current Weather</p>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                              {weatherData[favorite.city].condition}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getTemperatureColor(weatherData[favorite.city].temperature)}`}>
                            {Math.round(weatherData[favorite.city].temperature)}°C
                          </p>
                          <p className="text-sm text-gray-600">
                            Feels like {Math.round(weatherData[favorite.city].apparentTemperature)}°C
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Humidity:</span>
                          <span className="font-semibold text-gray-900">{weatherData[favorite.city].humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Wind:</span>
                          <span className="font-semibold text-gray-900">{weatherData[favorite.city].windspeed} km/h</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <button
                        onClick={() => fetchFavoriteWeather(favorite)}
                        className="text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-2 justify-center w-full py-2"
                      >
                        <FiNavigation size={16} />
                        Load Current Weather
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/dashboard?search=${encodeURIComponent(favorite.city)}`}
                    className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => fetchFavoriteWeather(favorite)}
                    className="flex-1 text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm border border-gray-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State Animation */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}