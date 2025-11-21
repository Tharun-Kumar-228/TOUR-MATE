import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Search history must belong to a user'],
    },
    query: {
      type: String,
      required: [true, 'Search query is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['place', 'city', 'weather'],
      default: 'place',
    },
    results: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
searchHistorySchema.index({ user: 1, timestamp: -1 });
searchHistorySchema.index({ timestamp: -1 });

// Populate user data
searchHistorySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
