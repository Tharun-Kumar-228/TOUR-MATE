import mongoose from 'mongoose';
import Place from './place.model.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      maxlength: [1000, 'Review must be less than 1000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating between 1 and 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    place: {
      type: mongoose.Schema.ObjectId,
      ref: 'Place',
      required: [true, 'Review must belong to a place'],
    },
    plan: {
      type: mongoose.Schema.ObjectId,
      ref: 'Plan',
    },
    helpful: {
      type: Number,
      default: 0,
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews - a user can only review a place once
reviewSchema.index({ place: 1, user: 1 }, { unique: true });

// Populate user data
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Static method to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function (placeId) {
  const stats = await this.aggregate([
    {
      $match: { place: placeId },
    },
    {
      $group: {
        _id: '$place',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      ratingsQuantity: stats[0].nRating,
      averageRating: stats[0].avgRating,
    });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      ratingsQuantity: 0,
      averageRating: 0,
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.place);
});

// Call calcAverageRatings after findByIdAndUpdate
reviewSchema.post(/^findByIdAndUpdate/, async function () {
  await this.model.calcAverageRatings(this.getFilter()._id);
});

// Call calcAverageRatings after findByIdAndDelete
reviewSchema.post(/^findByIdAndDelete/, async function () {
  await this.model.calcAverageRatings(this.getFilter()._id);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
