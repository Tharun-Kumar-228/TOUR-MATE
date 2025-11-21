import { StatusCodes } from 'http-status-codes';
import SearchHistory from '../models/searchHistory.model.js';
import AppError from '../middleware/error.middleware.js';

export const addSearchHistory = async (req, res, next) => {
  try {
    const { query, type, results, location } = req.body;
    const userId = req.user.id;

    if (!query) {
      return next(
        new AppError('Please provide a search query', StatusCodes.BAD_REQUEST)
      );
    }

    const searchEntry = await SearchHistory.create({
      user: userId,
      query,
      type: type || 'place',
      results: results || 0,
      location: location || undefined,
    });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        searchHistory: searchEntry,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;

    const searchHistory = await SearchHistory.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SearchHistory.countDocuments({ user: userId });

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: searchHistory.length,
      total,
      data: {
        searchHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const clearSearchHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await SearchHistory.deleteMany({ user: userId });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Search history cleared',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSearchHistoryEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const searchEntry = await SearchHistory.findOne({ _id: id, user: userId });

    if (!searchEntry) {
      return next(
        new AppError('Search history entry not found', StatusCodes.NOT_FOUND)
      );
    }

    await SearchHistory.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Search history entry deleted',
    });
  } catch (error) {
    next(error);
  }
};
