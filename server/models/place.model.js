import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A place must belong to an owner'],
    },
    name: {
      type: String,
      required: [true, 'A place must have a name'],
      trim: true,
      maxlength: [100, 'A place name must have less or equal than 100 characters'],
      minlength: [3, 'A place name must have more or equal than 3 characters'],
    },
    category: {
      type: String,
      required: [true, 'A place must have a category'],
      enum: {
        values: ['tourist_place', 'shop', 'hotel', 'restaurant', 'other'],
        message: 'Category is either: tourist_place, shop, hotel, restaurant, other',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
    address: {
      type: String,
      required: [true, 'A place must have an address'],
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    images: [String],
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    openingHours: [
      {
        day: {
          type: Number, // 0-6 (Sunday-Saturday)
          min: 0,
          max: 6,
        },
        open: String, // Format: "09:00"
        close: String, // Format: "17:00"
        closed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above or equal to 0'],
      max: [5, 'Rating must be below or equal to 5'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    features: [String],
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
placeSchema.index({ location: '2dsphere' });
placeSchema.index({ name: 'text', description: 'text', address: 'text' });

// Virtual populate reviews
placeSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'place',
  localField: '_id',
});

// Query middleware
placeSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Populate owner data when querying
placeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'name email photo',
  });
  next();
});

// Calculate average ratings when a review is saved/updated/deleted
placeSchema.statics.calcAverageRatings = async function (placeId) {
  const stats = await this.model('Review').aggregate([
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
    await this.findByIdAndUpdate(placeId, {
      ratingsQuantity: stats[0].nRating,
      averageRating: stats[0].avgRating,
    });
  } else {
    await this.findByIdAndUpdate(placeId, {
      ratingsQuantity: 0,
      averageRating: 0,
    });
  }
};

const Place = mongoose.model('Place', placeSchema);

export default Place;
