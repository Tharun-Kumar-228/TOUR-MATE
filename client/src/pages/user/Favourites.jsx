import { useState, useEffect } from 'react';
import { FiHeart, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Favourites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

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

  const handleRemoveFavorite = (city) => {
    const updated = favorites.filter(fav => fav.city !== city);
    setFavorites(updated);
    localStorage.setItem('favoriteCities', JSON.stringify(updated));
    toast.success(`Removed ${city} from favorites`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Favorite Cities</h1>
          <p className="text-gray-600">Your collection of favorite weather search locations</p>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
            <FiHeart size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorite Cities Yet</h3>
            <p className="text-gray-600">
              Start adding cities to your favorites by searching for weather and clicking the heart icon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.city}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FiHeart size={20} className="text-red-500" fill="currentColor" />
                    <h3 className="font-semibold text-gray-900 text-lg">{favorite.city}</h3>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiMapPin size={14} />
                    📍 {parseFloat(favorite.lat).toFixed(4)}°, {parseFloat(favorite.lon).toFixed(4)}°
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.city)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                  title="Remove from favorites"
                >
                  <FiHeart size={18} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
