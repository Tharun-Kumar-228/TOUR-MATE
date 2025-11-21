import { FiCloud, FiWind, FiSmile, FiTrendingUp } from 'react-icons/fi';

export default function TravelIndex({ weather, rainProbability, comfort = 8 }) {
  // Calculate Travel Index Score (0-100)
  // Weather: 0-30 points (clear=30, cloudy=20, rainy=10)
  // Rain Probability: 0-30 points (0%=30, 50%=15, 100%=0)
  // Comfort: 0-40 points (based on temperature and conditions)

  const calculateWeatherScore = () => {
    if (!weather) return 15;
    
    const condition = weather.toLowerCase();
    if (condition.includes('clear') || condition.includes('sunny')) return 30;
    if (condition.includes('cloud')) return 20;
    if (condition.includes('rain') || condition.includes('drizzle')) return 10;
    if (condition.includes('storm')) return 5;
    return 15;
  };

  const calculateRainScore = () => {
    if (rainProbability === undefined) return 15;
    
    const rainProb = Math.min(100, Math.max(0, rainProbability));
    return Math.max(0, 30 - (rainProb * 0.3));
  };

  const calculateComfortScore = () => {
    // Comfort score based on provided value (0-40)
    return Math.min(40, Math.max(0, comfort * 4));
  };

  const weatherScore = calculateWeatherScore();
  const rainScore = calculateRainScore();
  const comfortScore = calculateComfortScore();
  const totalScore = Math.round(weatherScore + rainScore + comfortScore);

  // Determine quality level
  const getQualityLevel = (score) => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const quality = getQualityLevel(totalScore);

  return (
    <div className={`${quality.bg} border ${quality.border} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiTrendingUp size={20} />
          Travel Index
        </h3>
        <div className={`text-3xl font-bold ${quality.color}`}>
          {totalScore}
          <span className="text-sm text-gray-600 ml-1">/100</span>
        </div>
      </div>

      <p className={`text-sm font-medium ${quality.color} mb-4`}>
        Condition: {quality.level}
      </p>

      {/* Score Breakdown */}
      <div className="space-y-3">
        {/* Weather Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiCloud size={16} />
              Weather Conditions
            </label>
            <span className="text-sm font-semibold text-gray-900">{Math.round(weatherScore)}/30</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(weatherScore / 30) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {weather || 'No weather data'}
          </p>
        </div>

        {/* Rain Probability Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiWind size={16} />
              Rain Probability
            </label>
            <span className="text-sm font-semibold text-gray-900">{Math.round(rainScore)}/30</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${(rainScore / 30) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {rainProbability !== undefined ? `${rainProbability}% chance of rain` : 'No rain data'}
          </p>
        </div>

        {/* Comfort Score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiSmile size={16} />
              Comfort Level
            </label>
            <span className="text-sm font-semibold text-gray-900">{Math.round(comfortScore)}/40</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(comfortScore / 40) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Based on temperature and conditions
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Recommendation: </span>
          {totalScore >= 85
            ? '✅ Perfect day for travel! All conditions are ideal.'
            : totalScore >= 70
            ? '👍 Good conditions for travel. Minor weather concerns.'
            : totalScore >= 50
            ? '⚠️ Fair conditions. Be prepared for weather changes.'
            : '❌ Poor conditions. Consider rescheduling or bringing protective gear.'}
        </p>
      </div>
    </div>
  );
}
