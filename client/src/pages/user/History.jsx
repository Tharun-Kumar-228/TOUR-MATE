import { useState, useEffect } from 'react';
import { FiClock, FiTrash2, FiSearch, FiMapPin, FiNavigation, FiCalendar, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [loadingWeather, setLoadingWeather] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    // Load weather data for recent searches
    if (history.length > 0) {
      loadRecentWeatherData();
    }
  }, [history]);

  const loadSearchHistory = () => {
    try {
      setLoading(true);
      const savedHistory = localStorage.getItem('weatherSearchHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentWeatherData = async () => {
    const recentEntries = history.slice(0, 5); // Load weather for top 5 recent searches
    const newWeatherData = { ...weatherData };
    const newLoadingWeather = { ...loadingWeather };

    for (const entry of recentEntries) {
      if (!weatherData[entry.id]) {
        newLoadingWeather[entry.id] = true;
        try {
          const response = await api.get('/weather/today', {
            params: { lat: entry.lat, lon: entry.lon },
          });
          newWeatherData[entry.id] = response.data.data.weather;
        } catch (error) {
          console.error(`Failed to fetch weather for ${entry.city}:`, error);
          newWeatherData[entry.id] = null;
        } finally {
          newLoadingWeather[entry.id] = false;
        }
      }
    }

    setWeatherData(newWeatherData);
    setLoadingWeather(newLoadingWeather);
  };

  const loadEntryWeather = async (entry) => {
    setLoadingWeather(prev => ({ ...prev, [entry.id]: true }));
    try {
      const response = await api.get('/weather/today', {
        params: { lat: entry.lat, lon: entry.lon },
      });
      setWeatherData(prev => ({
        ...prev,
        [entry.id]: response.data.data.weather
      }));
    } catch (error) {
      console.error(`Failed to fetch weather for ${entry.city}:`, error);
      toast.error(`Failed to load weather for ${entry.city}`);
    } finally {
      setLoadingWeather(prev => ({ ...prev, [entry.id]: false }));
    }
  };

  const handleDeleteEntry = (id) => {
    const entry = history.find(h => h.id === id);
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(updated));
    
    // Remove from weather data
    setWeatherData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });

    toast.success(`Deleted search for ${entry.city}`);
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('weatherSearchHistory');
      setWeatherData({});
      toast.success('All search history cleared');
    }
  };

  const handleSearchAgain = (entry) => {
    // This would typically navigate to dashboard with pre-filled search
    toast.success(`Searching for ${entry.city} again`);
    // Navigate to dashboard with search parameters
  };

  const filterHistory = (entries) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      switch (filter) {
        case 'today':
          return entryDate >= today;
        case 'week':
          return entryDate >= weekAgo;
        case 'month':
          return entryDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-cyan-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode === 0) return '☀️';
    if (weatherCode >= 1 && weatherCode <= 3) return '⛅';
    if (weatherCode >= 45 && weatherCode <= 48) return '🌫️';
    if (weatherCode >= 51 && weatherCode <= 67) return '🌧️';
    if (weatherCode >= 71 && weatherCode <= 77) return '❄️';
    if (weatherCode >= 80 && weatherCode <= 82) return '🌦️';
    if (weatherCode >= 95 && weatherCode <= 99) return '⛈️';
    return '🌤️';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredHistory = filterHistory(history);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your history...</p>
          <p className="text-gray-500 text-sm mt-2">Retrieving your search journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Search History
              </h1>
              <p className="text-gray-600 text-lg">Your weather search journey and patterns</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl text-sm font-semibold text-gray-700 border border-white/20">
                {filteredHistory.length} {filteredHistory.length === 1 ? 'Entry' : 'Entries'}
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FiTrash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiSearch className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                    <p className="text-sm text-gray-600">Total Searches</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiMapPin className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {[...new Set(history.map(h => h.city))].length}
                    </p>
                    <p className="text-sm text-gray-600">Unique Cities</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiCalendar className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {history.filter(h => new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                    </p>
                    <p className="text-sm text-gray-600">Today</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FiBarChart2 className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(weatherData).length}
                    </p>
                    <p className="text-sm text-gray-600">Live Weather</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {history.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/20 max-w-md mb-8">
              <div className="flex space-x-1">
                {['all', 'today', 'week', 'month'].map((timeFilter) => (
                  <button
                    key={timeFilter}
                    onClick={() => setFilter(timeFilter)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      filter === timeFilter
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-16 text-center border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiClock size={40} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {history.length === 0 ? 'No Search History' : 'No Matching Entries'}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {history.length === 0 
                ? 'Your weather search history will appear here when you search for cities in the dashboard.'
                : `No search history found for the selected time filter (${filter}).`
              }
            </p>
            {history.length === 0 && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <FiSearch size={20} />
                Start Searching
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((entry, index) => (
              <div
                key={entry.id}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <FiSearch size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{entry.city}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FiClock size={14} />
                            {formatTimestamp(entry.timestamp)}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FiMapPin size={14} />
                            {parseFloat(entry.lat).toFixed(4)}°, {parseFloat(entry.lon).toFixed(4)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleSearchAgain(entry)}
                      className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      title="Search again"
                    >
                      <FiRefreshCw size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                      title="Delete this entry"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Weather Information */}
                <div className="space-y-4">
                  {loadingWeather[entry.id] ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : weatherData[entry.id] ? (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getWeatherIcon(weatherData[entry.id].weathercode)}
                          </span>
                          <div>
                            <p className="text-sm text-gray-600">Current Weather</p>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                              {weatherData[entry.id].condition}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getTemperatureColor(weatherData[entry.id].temperature)}`}>
                            {Math.round(weatherData[entry.id].temperature)}°C
                          </p>
                          <p className="text-sm text-gray-600">
                            Feels like {Math.round(weatherData[entry.id].apparentTemperature)}°C
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <button
                        onClick={() => loadEntryWeather(entry)}
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
                    to={`/dashboard?search=${encodeURIComponent(entry.city)}`}
                    className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
                  >
                    View Full Forecast
                  </Link>
                  <button
                    onClick={() => loadEntryWeather(entry)}
                    className="flex-1 text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm border border-gray-200"
                  >
                    Refresh Weather
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