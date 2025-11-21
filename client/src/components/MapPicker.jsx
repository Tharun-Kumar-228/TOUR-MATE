import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin } from 'react-icons/fi';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapPicker({ onLocationSelect, initialLocation = null, height = '400px' }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const defaultCenter = initialLocation?.coordinates
      ? [initialLocation.coordinates[1], initialLocation.coordinates[0]]
      : [20.5937, 78.9629]; // India center

    map.current = L.map(mapContainer.current).setView(defaultCenter, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add initial marker if provided
    if (initialLocation?.coordinates) {
      marker.current = L.marker([initialLocation.coordinates[1], initialLocation.coordinates[0]])
        .addTo(map.current)
        .bindPopup('Selected Location');
    }

    // Handle map clicks
    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;

      // Remove existing marker
      if (marker.current) {
        map.current.removeLayer(marker.current);
      }

      // Add new marker
      marker.current = L.marker([lat, lng])
        .addTo(map.current)
        .bindPopup(`<strong>Selected</strong><br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
        .openPopup();

      const location = {
        coordinates: [lng, lat],
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };

      setSelectedLocation(location);
      onLocationSelect(location);
    };

    map.current.on('click', handleMapClick);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        ref={mapContainer}
        style={{ height }}
        className="rounded-lg shadow-md border border-gray-200"
      />
      {selectedLocation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <FiMapPin className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Selected Location</p>
              <p className="text-sm text-gray-600 mt-1">
                Latitude: {selectedLocation.coordinates[1].toFixed(4)}
              </p>
              <p className="text-sm text-gray-600">
                Longitude: {selectedLocation.coordinates[0].toFixed(4)}
              </p>
              {selectedLocation.address && (
                <p className="text-sm text-gray-600 mt-1">{selectedLocation.address}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
