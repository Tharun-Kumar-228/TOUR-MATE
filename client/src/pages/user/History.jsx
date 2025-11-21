import { useState, useEffect } from 'react';
import { FiClock, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    try {
      setLoading(true);
      const savedHistory = localStorage.getItem('weatherSearchHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(updated));
    toast.success('Entry deleted');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      setHistory([]);
      localStorage.removeItem('weatherSearchHistory');
      toast.success('History cleared');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Search History</h1>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                <FiTrash2 size={18} />
                Clear All
              </button>
            )}
          </div>
          <p className="text-gray-600">View your search history</p>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-100">
            <FiClock size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Search History</h3>
            <p className="text-gray-600">
              Your weather search history will appear here when you search for cities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FiSearch size={20} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900 text-lg">{entry.city}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Weather
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FiClock size={14} />
                    {entry.timestamp}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    📍 {parseFloat(entry.lat).toFixed(4)}°, {parseFloat(entry.lon).toFixed(4)}°
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                  title="Delete this entry"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
