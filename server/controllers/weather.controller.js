import { StatusCodes } from 'http-status-codes';
import fetch from 'node-fetch';
import AppError from '../middleware/error.middleware.js';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

export const getTodayWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return next(
        new AppError('Please provide latitude and longitude', StatusCodes.BAD_REQUEST)
      );
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(
        new AppError('Invalid latitude or longitude', StatusCodes.BAD_REQUEST)
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return next(
        new AppError('Latitude must be between -90 and 90, longitude between -180 and 180', StatusCodes.BAD_REQUEST)
      );
    }

    const url = `${OPEN_METEO_API}?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return next(
        new AppError('Failed to fetch weather data', StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        weather: data.current_weather,
        timezone: data.timezone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPast7DaysWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return next(
        new AppError('Please provide latitude and longitude', StatusCodes.BAD_REQUEST)
      );
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(
        new AppError('Invalid latitude or longitude', StatusCodes.BAD_REQUEST)
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return next(
        new AppError('Latitude must be between -90 and 90, longitude between -180 and 180', StatusCodes.BAD_REQUEST)
      );
    }

    const url = `${OPEN_METEO_API}?latitude=${latitude}&longitude=${longitude}&past_days=7&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return next(
        new AppError('Failed to fetch weather data', StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        daily: data.daily,
        timezone: data.timezone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getForecastWeather = async (req, res, next) => {
  try {
    const { lat, lon, days } = req.query;

    if (!lat || !lon) {
      return next(
        new AppError('Please provide latitude and longitude', StatusCodes.BAD_REQUEST)
      );
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const forecastDays = parseInt(days) || 7;

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(
        new AppError('Invalid latitude or longitude', StatusCodes.BAD_REQUEST)
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return next(
        new AppError('Latitude must be between -90 and 90, longitude between -180 and 180', StatusCodes.BAD_REQUEST)
      );
    }

    if (forecastDays < 1 || forecastDays > 16) {
      return next(
        new AppError('Forecast days must be between 1 and 16', StatusCodes.BAD_REQUEST)
      );
    }

    const url = `${OPEN_METEO_API}?latitude=${latitude}&longitude=${longitude}&forecast_days=${forecastDays}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return next(
        new AppError('Failed to fetch weather data', StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        daily: data.daily,
        timezone: data.timezone,
      },
    });
  } catch (error) {
    next(error);
  }
};
