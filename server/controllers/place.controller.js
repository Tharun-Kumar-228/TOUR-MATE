import { StatusCodes } from 'http-status-codes';
import Place from '../models/place.model.js';
import AppError from '../middleware/error.middleware.js';

// Get all approved places for users
export const getAllPlaces = async (req, res, next) => {
  try {
    const { limit = 20, skip = 0, category, search } = req.query;

    let query = { isApproved: true, isActive: { $ne: false } };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const places = await Place.find(query)
      .sort({ averageRating: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Place.countDocuments(query);

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: places.length,
      total,
      data: {
        places,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get place by ID
export const getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id).populate('reviews');

    if (!place || !place.isApproved) {
      return next(
        new AppError('Place not found', StatusCodes.NOT_FOUND)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        place,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get nearby places by coordinates
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { longitude, latitude, distance = 5000, category, limit = 20 } = req.query;

    if (!longitude || !latitude) {
      return next(
        new AppError('Please provide longitude and latitude', StatusCodes.BAD_REQUEST)
      );
    }

    const query = {
      isApproved: true,
      isActive: { $ne: false },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(distance), // in meters
        },
      },
    };

    if (category) {
      query.category = category;
    }

    const places = await Place.find(query)
      .limit(parseInt(limit))
      .select('+isActive');

    // Calculate distance for each place
    const placesWithDistance = places.map((place) => {
      const R = 6371000; // Earth's radius in meters
      const lat1 = (parseFloat(latitude) * Math.PI) / 180;
      const lat2 = (place.location.coordinates[1] * Math.PI) / 180;
      const deltaLat = ((place.location.coordinates[1] - parseFloat(latitude)) * Math.PI) / 180;
      const deltaLon = ((place.location.coordinates[0] - parseFloat(longitude)) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // in meters

      return {
        ...place.toObject(),
        distance: Math.round(distance),
        distanceInKm: (distance / 1000).toFixed(2),
      };
    });

    // Sort by distance
    placesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: placesWithDistance.length,
      data: {
        places: placesWithDistance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get places by category
export const getPlacesByCategory = async (req, res, next) => {
  try {
    const { category, limit = 20, skip = 0 } = req.query;

    if (!category) {
      return next(
        new AppError('Please provide a category', StatusCodes.BAD_REQUEST)
      );
    }

    const places = await Place.find({ category, isApproved: true, isActive: { $ne: false } })
      .sort({ averageRating: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Place.countDocuments({ category, isApproved: true, isActive: { $ne: false } });

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: places.length,
      total,
      data: {
        places,
      },
    });
  } catch (error) {
    next(error);
  }
};
