import { FiCloud, FiCloudRain, FiSun, FiWind } from 'react-icons/fi';

const weatherCodeMap = {
  0: { icon: FiSun, label: 'Clear', color: 'text-yellow-500' },
  1: { icon: FiCloud, label: 'Mainly Clear', color: 'text-gray-400' },
  2: { icon: FiCloud, label: 'Partly Cloudy', color: 'text-gray-400' },
  3: { icon: FiCloud, label: 'Overcast', color: 'text-gray-500' },
  45: { icon: FiCloud, label: 'Foggy', color: 'text-gray-400' },
  48: { icon: FiCloud, label: 'Depositing Rime Fog', color: 'text-gray-400' },
  51: { icon: FiCloudRain, label: 'Light Drizzle', color: 'text-blue-400' },
  53: { icon: FiCloudRain, label: 'Moderate Drizzle', color: 'text-blue-400' },
  55: { icon: FiCloudRain, label: 'Dense Drizzle', color: 'text-blue-500' },
  61: { icon: FiCloudRain, label: 'Slight Rain', color: 'text-blue-500' },
  63: { icon: FiCloudRain, label: 'Moderate Rain', color: 'text-blue-600' },
  65: { icon: FiCloudRain, label: 'Heavy Rain', color: 'text-blue-700' },
  80: { icon: FiCloudRain, label: 'Slight Rain Showers', color: 'text-blue-500' },
  81: { icon: FiCloudRain, label: 'Moderate Rain Showers', color: 'text-blue-600' },
  82: { icon: FiCloudRain, label: 'Violent Rain Showers', color: 'text-blue-700' },
};

export default function WeatherCard({ weather, location, compact = false }) {
  if (!weather) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  const weatherInfo = weatherCodeMap[weather.weather_code] || {
    icon: FiCloud,
    label: 'Unknown',
    color: 'text-gray-400',
  };
  const WeatherIcon = weatherInfo.icon;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{location}</p>
            <p className="text-2xl font-bold">{Math.round(weather.temperature)}°C</p>
            <p className="text-sm opacity-75">{weatherInfo.label}</p>
          </div>
          <WeatherIcon size={48} className={weatherInfo.color} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{location}</h3>
          <p className="text-sm text-gray-500">{weatherInfo.label}</p>
        </div>
        <WeatherIcon size={40} className={`${weatherInfo.color}`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Temperature</p>
          <p className="text-2xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FiWind size={14} /> Wind Speed
          </p>
          <p className="text-2xl font-bold text-gray-900">{Math.round(weather.wind_speed)} km/h</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Wind Direction</p>
          <p className="text-2xl font-bold text-gray-900">{weather.wind_direction}°</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Humidity</p>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(weather.time).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
