import { StatusCodes } from 'http-status-codes';
import Place from '../models/place.model.js';
import Review from '../models/review.model.js';
import AppError from '../middleware/error.middleware.js';

export const addPlace = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      address,
      location,
      contact,
      openingHours,
      features,
      priceRange,
      socialMedia,
    } = req.body;

    // Validation
    if (!name || !category || !address || !location) {
      return next(
        new AppError('Please provide all required fields', StatusCodes.BAD_REQUEST)
      );
    }

    // Validate location coordinates
    if (!location.coordinates || location.coordinates.length !== 2) {
      return next(
        new AppError('Please provide valid location coordinates [longitude, latitude]', StatusCodes.BAD_REQUEST)
      );
    }

    const place = await Place.create({
      owner: req.user.id,
      name,
      category,
      description: description || '',
      address,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || address,
      },
      contact: contact || {},
      openingHours: openingHours || [],
      features: features || [],
      priceRange: priceRange || undefined,
      socialMedia: socialMedia || {},
      isApproved: true, // Auto-approve owner-added places
    });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        place,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPlaces = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { limit = 10, skip = 0 } = req.query;

    const places = await Place.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Place.countDocuments({ owner: ownerId });

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

export const getPlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const place = await Place.findOne({ _id: id, owner: ownerId }).populate('reviews');

    if (!place) {
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

export const updatePlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const {
      name,
      category,
      description,
      address,
      location,
      contact,
      openingHours,
      features,
      priceRange,
      socialMedia,
    } = req.body;

    const place = await Place.findOne({ _id: id, owner: ownerId });

    if (!place) {
      return next(
        new AppError('Place not found', StatusCodes.NOT_FOUND)
      );
    }

    // Update fields
    if (name) place.name = name;
    if (category) place.category = category;
    if (description) place.description = description;
    if (address) place.address = address;
    if (location) {
      if (location.coordinates && location.coordinates.length === 2) {
        place.location = {
          type: 'Point',
          coordinates: location.coordinates,
          address: location.address || address || place.address,
        };
      }
    }
    if (contact) place.contact = { ...place.contact, ...contact };
    if (openingHours) place.openingHours = openingHours;
    if (features) place.features = features;
    if (priceRange) place.priceRange = priceRange;
    if (socialMedia) place.socialMedia = { ...place.socialMedia, ...socialMedia };

    await place.save();

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

export const deletePlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const place = await Place.findOne({ _id: id, owner: ownerId });

    if (!place) {
      return next(
        new AppError('Place not found', StatusCodes.NOT_FOUND)
      );
    }

    await Place.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Place deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPlaceReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { limit = 10, skip = 0 } = req.query;

    // Verify place belongs to owner
    const place = await Place.findOne({ _id: id, owner: ownerId });

    if (!place) {
      return next(
        new AppError('Place not found', StatusCodes.NOT_FOUND)
      );
    }

    const reviews = await Review.find({ place: id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({ place: id });

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: reviews.length,
      total,
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
