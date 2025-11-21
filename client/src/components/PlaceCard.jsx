import { FiMapPin, FiStar, FiExternalLink } from 'react-icons/fi';

export default function PlaceCard({ place, onSelect, onViewMap, compact = false }) {
  const handleViewOnMap = () => {
    const lat = place.location?.coordinates[1];
    const lon = place.location?.coordinates[0];
    if (lat && lon) {
      window.open(
        `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`,
        '_blank'
      );
    }
  };

  if (compact) {
    return (
      <div
        onClick={onSelect}
        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition border border-gray-100"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2">{place.name}</h3>
          {place.averageRating > 0 && (
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <FiStar size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">
                {place.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{place.address}</p>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded">{place.category}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
      {place.images?.[0] && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={place.images[0]}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 flex-1">{place.name}</h3>
          {place.averageRating > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <FiStar size={18} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900">
                {place.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({place.ratingsQuantity})</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 flex items-start gap-2">
          <FiMapPin size={16} className="flex-shrink-0 mt-0.5" />
          <span>{place.address}</span>
        </p>

        {place.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{place.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            {place.category}
          </span>
          {place.priceRange && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              {place.priceRange}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {onSelect && (
            <button
              onClick={onSelect}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
            >
              Select
            </button>
          )}
          <button
            onClick={handleViewOnMap}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <FiExternalLink size={16} />
            View Map
          </button>
        </div>
      </div>
    </div>
  );
}
