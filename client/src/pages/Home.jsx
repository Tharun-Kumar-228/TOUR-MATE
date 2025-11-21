import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCloud, FiSearch, FiSun, FiCloudRain, FiWind, FiDroplet, FiZap } from 'react-icons/fi';
import WeatherCard from '../components/WeatherCard';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchWeather, setSearchWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [placeSearch, setPlaceSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
          fetchWeather(20.5937, 78.9629);
        }
      );
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await api.get('/weather/today', {
        params: { lat, lon },
      });
      setWeather(response.data.data.weather);
    } catch (error) {
      toast.error('Failed to fetch weather');
    } finally {
      setLoading(false);
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
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${searchCity}&format=json&limit=1`
      );
      const geoData = await geoResponse.json();

      if (!geoData.length) {
        toast.error('City not found');
        return;
      }

      const { lat, lon } = geoData[0];
      const response = await api.get('/weather/past7', {
        params: { lat, lon },
      });

      setSearchWeather({
        city: searchCity,
        data: response.data.data,
        coordinates: { lat, lon },
      });

      toast.success('Weather data loaded');
    } catch (error) {
      toast.error('Failed to fetch weather data');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchPlaces = async (e) => {
    e.preventDefault();
    if (!placeSearch.trim()) {
      toast.error('Please enter a place name');
      return;
    }

    try {
      setPlaceSearchLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${placeSearch}&format=json&limit=10`
      );
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        toast.error('No places found');
      }
    } catch (error) {
      toast.error('Failed to search places');
    } finally {
      setPlaceSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layer Cloud Background with Gradient Mesh */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-sky-100 to-indigo-100 -z-10"></div>
      
      {/* Animated Cloud Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-[600px] h-[300px] bg-gradient-to-br from-white/60 to-blue-100/40 rounded-[60%_40%_70%_30%] blur-3xl animate-cloud-drift"></div>
        <div className="absolute top-40 -right-32 w-[500px] h-[280px] bg-gradient-to-bl from-purple-100/30 to-white/50 rounded-[40%_60%_50%_70%] blur-2xl animate-cloud-drift-reverse"></div>
        <div className="absolute top-[60%] left-[10%] w-[450px] h-[250px] bg-gradient-to-tr from-cyan-100/40 to-white/60 rounded-[70%_30%_60%_40%] blur-3xl animate-cloud-float"></div>
        <div className="absolute bottom-20 right-[15%] w-[520px] h-[320px] bg-gradient-to-tl from-indigo-100/30 to-white/40 rounded-[50%_50%_80%_20%] blur-2xl animate-cloud-drift-slow"></div>
        <div className="absolute top-[30%] left-[40%] w-[380px] h-[200px] bg-gradient-to-r from-sky-100/50 to-purple-50/40 rounded-[80%_20%_70%_30%] blur-3xl animate-cloud-float-delayed"></div>
      </div>

      {/* Subtle Particles */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-cyan-400/40 rounded-full animate-particle-float"></div>
        <div className="absolute top-[50%] right-[25%] w-3 h-3 bg-sky-300/30 rounded-full animate-particle-float-delayed"></div>
        <div className="absolute bottom-[30%] left-[60%] w-2 h-2 bg-indigo-300/40 rounded-full animate-particle-float-slow"></div>
      </div>

      {/* Hero Section - Asymmetric Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Content - 7 columns */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-cyan-300/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white/70 via-white/50 to-transparent backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg animate-bounce-slow">
                    <FiCloud className="text-white" size={32} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-cyan-600 tracking-wider uppercase mb-2">Welcome to TourMate</div>
                    <h1 className="text-5xl md:text-6xl font-black leading-tight">
                      <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Discover
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Adventures
                      </span>
                    </h1>
                  </div>
                </div>
                
                <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-xl">
                  Navigate through clouds of possibilities. Experience weather-powered journey planning with real-time forecasts, interactive maps, and AI-driven recommendations.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/signup"
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-2">
                      Get Started Free
                      <FiZap size={20} className="group-hover:animate-pulse" />
                    </span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white/60 backdrop-blur-sm text-gray-800 rounded-2xl font-bold text-lg border-2 border-cyan-300/50 hover:border-cyan-400 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual - 5 columns */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-cyan-400/90 via-blue-500/90 to-indigo-600/90 rounded-[3rem] p-12 backdrop-blur-xl border border-white/40 shadow-2xl transform hover:scale-105 hover:rotate-2 transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <FiMapPin size={40} className="text-white animate-bounce" />
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <FiSun size={36} className="text-yellow-100 animate-spin-slow" />
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <FiWind size={32} className="text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="text-white space-y-3">
                    <h3 className="text-3xl font-black">Navigate the Skies</h3>
                    <p className="text-cyan-50 text-lg leading-relaxed">Explore destinations with precision weather data and real-time cloud tracking.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-white">24/7</div>
                      <div className="text-xs text-cyan-50">Support</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-white">100+</div>
                      <div className="text-xs text-cyan-50">Countries</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-white">AI</div>
                      <div className="text-xs text-cyan-50">Powered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Weather - Bento Box Style */}
      {weather && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl">
              <FiDroplet className="text-white" size={24} />
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              Live Weather
            </h2>
          </div>
          <div className="bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <WeatherCard
              weather={weather}
              location={location ? `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°` : 'Your Location'}
            />
          </div>
        </section>
      )}

      {/* Search Weather - Neumorphic Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl">
            <FiCloudRain className="text-white" size={24} />
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Weather Forecast
          </h2>
        </div>
        
        <div className="bg-gradient-to-br from-white/70 via-white/50 to-transparent backdrop-blur-xl rounded-[2rem] p-8 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-8">
          <form onSubmit={handleSearchWeather}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={22} />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Enter city name (Paris, Tokyo, New York...)"
                  className="w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-400/30 focus:border-cyan-400 text-lg transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 disabled:hover:translate-y-0"
              >
                <span className="flex items-center gap-3">
                  {searchLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      Search Sky
                      <FiSearch size={20} className="group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {searchWeather && (
          <div className="bg-gradient-to-br from-white/60 via-white/40 to-transparent backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FiCloud className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                7-Day Forecast: {searchWeather.city}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {searchWeather.data.daily.time.map((date, idx) => (
                <div 
                  key={idx} 
                  className="group bg-gradient-to-br from-white/90 to-cyan-50/70 backdrop-blur-sm rounded-3xl p-6 border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-black text-gray-900 text-lg">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <FiSun className="text-orange-400 group-hover:animate-spin-slow" size={24} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gradient-to-r from-orange-100 to-red-50 rounded-2xl p-3">
                      <span className="text-sm font-bold text-gray-700">Max</span>
                      <span className="text-3xl font-black text-orange-600">
                        {Math.round(searchWeather.data.daily.temperature_2m_max[idx])}°
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-cyan-50 rounded-2xl p-3">
                      <span className="text-sm font-bold text-gray-700">Min</span>
                      <span className="text-3xl font-black text-blue-600">
                        {Math.round(searchWeather.data.daily.temperature_2m_min[idx])}°
                      </span>
                    </div>
                    {searchWeather.data.daily.precipitation_sum[idx] > 0 && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-3">
                        <FiCloudRain className="text-indigo-600" size={20} />
                        <span className="text-sm font-bold text-gray-700">Rain:</span>
                        <span className="text-xl font-black text-indigo-600 ml-auto">
                          {searchWeather.data.daily.precipitation_sum[idx]}mm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Search Places - Card Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl">
            <FiMapPin className="text-white" size={24} />
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Explore Places
          </h2>
        </div>
        
        <div className="bg-gradient-to-br from-white/70 via-white/50 to-transparent backdrop-blur-xl rounded-[2rem] p-8 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-8">
          <form onSubmit={handleSearchPlaces}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={22} />
                <input
                  type="text"
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  placeholder="Search places (Eiffel Tower, Taj Mahal, Big Ben...)"
                  className="w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400/30 focus:border-pink-400 text-lg transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={placeSearchLoading}
                className="group px-10 py-5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 disabled:hover:translate-y-0"
              >
                <span className="flex items-center gap-3">
                  {placeSearchLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      Discover
                      <FiMapPin size={20} className="group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-gradient-to-br from-white/60 via-white/40 to-transparent backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <h3 className="text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-8">
              Found {searchResults.length} Destinations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((place, idx) => (
                <div 
                  key={idx} 
                  className="group bg-gradient-to-br from-white/90 to-pink-50/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-pink-300"
                >
                  <p className="font-black text-gray-900 mb-4 line-clamp-2 text-lg leading-tight">
                    {place.display_name}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}&zoom=15`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-bold rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <FiMapPin size={16} />
                      View Map
                    </a>
                    {place.type && (
                      <span className="px-5 py-2.5 bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-bold rounded-xl border border-pink-200">
                        {place.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Features - Modern Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Why TourMate?
          </h2>
          <p className="text-xl text-gray-600">Cloud-powered features for modern travelers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-cyan-50/90 via-white/70 to-blue-50/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <FiMapPin size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Interactive Maps</h3>
            <p className="text-gray-700 leading-relaxed">
              Navigate with precision using OpenStreetMap integration and real-time GPS tracking across the globe.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-indigo-50/90 via-white/70 to-purple-50/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <FiCloud size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Weather Intelligence</h3>
            <p className="text-gray-700 leading-relaxed">
              Access 7-day forecasts with hyperlocal accuracy powered by advanced meteorological data systems.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-pink-50/90 via-white/70 to-rose-50/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <FiSearch size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Smart Discovery</h3>
            <p className="text-gray-700 leading-relaxed">
              Intelligent search algorithms that help you discover hidden gems and popular destinations worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* CTA - Bold Gradient */}
      <section className="relative py-24 mt-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-700"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-cloud-drift"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-cloud-drift-reverse"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-8">
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl animate-bounce-slow">
              <FiCloud size={72} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Soar Above<br />The Clouds?
          </h2>
          
          <p className="text-xl md:text-2xl text-cyan-50 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of explorers using TourMate to plan unforgettable journeys with real-time weather intelligence and cloud-powered navigation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/signup"
              className="group px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2 hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Start Your Journey
                <FiZap size={24} className="group-hover:animate-pulse" />
              </span>
            </Link>
            
            <Link
              to="/login"
              className="px-12 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/40 rounded-2xl font-black text-xl hover:bg-white/20 hover:border-white/60 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Explore Features
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <FiCloud size={20} />
              <span className="font-semibold">Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin size={20} />
              <span className="font-semibold">Global Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <FiZap size={20} />
              <span className="font-semibold">Real-time Data</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes cloud-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        
        @keyframes cloud-drift-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 20px); }
        }
        
        @keyframes cloud-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-25px) scale(1.05); }
        }
        
        @keyframes cloud-drift-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -15px) rotate(5deg); }
        }
        
        @keyframes cloud-float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-60px) scale(1.2); opacity: 0.8; }
        }
        
        @keyframes particle-float-delayed {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-80px) scale(1.3); opacity: 0.7; }
        }
        
        @keyframes particle-float-slow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-50px) scale(1.1); opacity: 0.9; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-cloud-drift {
          animation: cloud-drift 20s ease-in-out infinite;
        }
        
        .animate-cloud-drift-reverse {
          animation: cloud-drift-reverse 25s ease-in-out infinite;
        }
        
        .animate-cloud-float {
          animation: cloud-float 15s ease-in-out infinite;
        }
        
        .animate-cloud-drift-slow {
          animation: cloud-drift-slow 30s ease-in-out infinite;
        }
        
        .animate-cloud-float-delayed {
          animation: cloud-float-delayed 18s ease-in-out infinite 2s;
        }
        
        .animate-particle-float {
          animation: particle-float 8s ease-in-out infinite;
        }
        
        .animate-particle-float-delayed {
          animation: particle-float-delayed 10s ease-in-out infinite 1s;
        }
        
        .animate-particle-float-slow {
          animation: particle-float-slow 12s ease-in-out infinite 3s;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}