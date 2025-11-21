import { StatusCodes } from 'http-status-codes';
import Plan from '../models/plan.model.js';
import AppError from '../middleware/error.middleware.js';

export const createPlan = async (req, res, next) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      destination,
      activities,
      budget,
      tags,
      isPublic,
    } = req.body;

    // Validation
    if (!title || !startDate || !endDate || !destination) {
      return next(
        new AppError('Please provide all required fields', StatusCodes.BAD_REQUEST)
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return next(
        new AppError('End date must be after start date', StatusCodes.BAD_REQUEST)
      );
    }

    // Validate activities dates and prepare activities
    let preparedActivities = [];
    if (activities && activities.length > 0) {
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const activityDate = new Date(activity.date);
        
        // Set time to start of day for comparison
        activityDate.setHours(0, 0, 0, 0);
        const startDateOnly = new Date(start);
        startDateOnly.setHours(0, 0, 0, 0);
        const endDateOnly = new Date(end);
        endDateOnly.setHours(0, 0, 0, 0);

        if (activityDate < startDateOnly || activityDate > endDateOnly) {
          return next(
            new AppError(
              `Activity ${i + 1} date must be within the plan date range (${startDate} to ${endDate})`,
              StatusCodes.BAD_REQUEST
            )
          );
        }

        // Prepare activity with all fields including place
        preparedActivities.push({
          place: activity.place || undefined,
          name: activity.name,
          date: activityDate,
          startTime: activity.startTime,
          endTime: activity.endTime,
          notes: activity.notes || undefined,
          location: activity.location,
        });
      }
    }

    const plan = await Plan.create({
      user: req.user.id,
      title,
      description,
      startDate: start,
      endDate: end,
      destination,
      activities: preparedActivities,
      budget: budget || {},
      tags: tags || [],
      isPublic: isPublic !== false,
    });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPlans = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10, skip = 0, status } = req.query;

    let query = { user: userId };

    if (status) {
      query.status = status;
    }

    const plans = await Plan.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Plan.countDocuments(query);

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: plans.length,
      total,
      data: {
        plans,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await Plan.findOne({ _id: id, user: userId }).populate('activities.place');

    if (!plan) {
      return next(
        new AppError('Plan not found', StatusCodes.NOT_FOUND)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      startDate,
      endDate,
      destination,
      activities,
      budget,
      tags,
      status,
      isPublic,
    } = req.body;

    const plan = await Plan.findOne({ _id: id, user: userId });

    if (!plan) {
      return next(
        new AppError('Plan not found', StatusCodes.NOT_FOUND)
      );
    }

    // Update fields
    if (title) plan.title = title;
    if (description) plan.description = description;
    if (startDate) plan.startDate = new Date(startDate);
    if (endDate) plan.endDate = new Date(endDate);
    if (destination) plan.destination = destination;
    if (activities) {
      // Prepare activities with all fields including place
      plan.activities = activities.map(activity => ({
        place: activity.place || undefined,
        name: activity.name,
        date: new Date(activity.date),
        startTime: activity.startTime,
        endTime: activity.endTime,
        notes: activity.notes || undefined,
        location: activity.location,
      }));
    }
    if (budget) plan.budget = budget;
    if (tags) plan.tags = tags;
    if (status) plan.status = status;
    if (isPublic !== undefined) plan.isPublic = isPublic;

    await plan.save();

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await Plan.findOne({ _id: id, user: userId });

    if (!plan) {
      return next(
        new AppError('Plan not found', StatusCodes.NOT_FOUND)
      );
    }

    await Plan.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addActivityToPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, date, startTime, endTime, location, notes, isFlexible } = req.body;

    if (!name || !date || !startTime || !endTime) {
      return next(
        new AppError('Please provide all required fields', StatusCodes.BAD_REQUEST)
      );
    }

    const plan = await Plan.findOne({ _id: id, user: userId });

    if (!plan) {
      return next(
        new AppError('Plan not found', StatusCodes.NOT_FOUND)
      );
    }

    const activity = {
      name,
      date: new Date(date),
      startTime,
      endTime,
      location: location || {},
      notes: notes || '',
      isFlexible: isFlexible || false,
    };

    plan.activities.push(activity);
    await plan.save();

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeActivityFromPlan = async (req, res, next) => {
  try {
    const { id, activityId } = req.params;
    const userId = req.user.id;

    const plan = await Plan.findOne({ _id: id, user: userId });

    if (!plan) {
      return next(
        new AppError('Plan not found', StatusCodes.NOT_FOUND)
      );
    }

    plan.activities = plan.activities.filter(
      (activity) => activity._id.toString() !== activityId
    );

    await plan.save();

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    next(error);
  }
};
