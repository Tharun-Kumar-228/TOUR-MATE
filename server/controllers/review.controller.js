import { StatusCodes } from 'http-status-codes';
import Review from '../models/review.model.js';
import Place from '../models/place.model.js';
import AppError from '../middleware/error.middleware.js';
import User from '../models/user.model.js';

export const addReview = async (req, res, next) => {
  try {
    let { place, review, rating, plan } = req.body;

    if (!place || !review || !rating) {
      return next(
        new AppError('Please provide place, review, and rating', StatusCodes.BAD_REQUEST)
      );
    }

    // Handle case where place might be an object
    if (typeof place === 'object' && place._id) {
      place = place._id;
    }

    // Ensure place is a string
    place = String(place).trim();

    if (!place) {
      return next(
        new AppError('Invalid place ID', StatusCodes.BAD_REQUEST)
      );
    }

    if (rating < 1 || rating > 5) {
      return next(
        new AppError('Rating must be between 1 and 5', StatusCodes.BAD_REQUEST)
      );
    }

    // Check if place exists
    const placeExists = await Place.findById(place);
    if (!placeExists) {
      return next(
        new AppError('Place not found', StatusCodes.NOT_FOUND)
      );
    }

    // Check if user already reviewed this place
    const existingReview = await Review.findOne({
      user: req.user.id,
      place,
    });

    if (existingReview) {
      return next(
        new AppError('You have already reviewed this place', StatusCodes.BAD_REQUEST)
      );
    }

    const newReview = await Review.create({
      user: req.user.id,
      place,
      review,
      rating,
      plan: plan || undefined,
    });

    // Recalculate average ratings
    await Review.calcAverageRatings(place);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByPlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const reviews = await Review.find({ place: placeId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({ place: placeId });

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

export const getReviewsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10, skip = 0 } = req.query;

    const reviews = await Review.find({ user: userId })
      .populate({
        path: 'place',
        select: 'name category location address owner',
        model: Place,
      })
      .populate({
        path: 'plan',
        select: '_id title',
        model: 'Plan',
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({ user: userId });

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

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { review, rating } = req.body;

    const existingReview = await Review.findOne({ _id: id, user: req.user.id });

    if (!existingReview) {
      return next(
        new AppError('Review not found', StatusCodes.NOT_FOUND)
      );
    }

    if (review) existingReview.review = review;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return next(
          new AppError('Rating must be between 1 and 5', StatusCodes.BAD_REQUEST)
        );
      }
      existingReview.rating = rating;
    }

    await existingReview.save();

    // Recalculate average ratings
    await Review.calcAverageRatings(existingReview.place);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        review: existingReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({ _id: id, user: req.user.id });

    if (!review) {
      return next(
        new AppError('Review not found', StatusCodes.NOT_FOUND)
      );
    }

    const placeId = review.place;

    await Review.findByIdAndDelete(id);

    // Recalculate average ratings
    await Review.calcAverageRatings(placeId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerReviews = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    // Get all places owned by this user
    const ownerPlaces = await Place.find({ owner: ownerId }).select('_id');
    const placeIds = ownerPlaces.map(p => p._id);

    if (placeIds.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: 'success',
        results: 0,
        total: 0,
        data: {
          reviews: [],
        },
      });
    }

    // Get reviews for those places
    const reviews = await Review.find({ place: { $in: placeIds } })
      .populate({
        path: 'user',
        select: 'name email',
        model: User,
      })
      .populate({
        path: 'place',
        select: 'name category',
        model: Place,
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({ place: { $in: placeIds } });

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
