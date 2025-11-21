import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../middleware/error.middleware.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      return next(
        new AppError('Please provide all required fields', StatusCodes.BAD_REQUEST)
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new AppError('Email already in use', StatusCodes.BAD_REQUEST)
      );
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role: role || 'user',
    });

    createSendToken(newUser, StatusCodes.CREATED, req, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(
        new AppError('Please provide email and password', StatusCodes.BAD_REQUEST)
      );
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError('Incorrect email or password', StatusCodes.UNAUTHORIZED)
      );
    }

    // If everything ok, send token to client
    createSendToken(user, StatusCodes.OK, req, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ status: 'success', message: 'Logged out successfully' });
};

export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(
        new AppError('Your current password is wrong.', StatusCodes.UNAUTHORIZED)
      );
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, StatusCodes.OK, req, res);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
