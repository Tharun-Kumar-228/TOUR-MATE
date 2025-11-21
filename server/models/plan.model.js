import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A plan must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'A plan must have a title'],
      trim: true,
      maxlength: [100, 'A plan title must have less or equal than 100 characters'],
      minlength: [3, 'A plan title must have more or equal than 3 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'A plan must have a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'A plan must have an end date'],
      validate: {
        validator: function (val) {
          return val > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed', 'cancelled'],
      default: 'planning',
    },
    destination: {
      name: {
        type: String,
        required: [true, 'A plan must have a destination name'],
      },
      location: {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
      },
    },
    activities: [
      {
        place: {
          type: mongoose.Schema.ObjectId,
          ref: 'Place',
        },
        name: {
          type: String,
          required: [true, 'An activity must have a name'],
        },
        date: {
          type: Date,
          required: [true, 'An activity must have a date'],
        },
        startTime: {
          type: String, // Format: "09:00"
          required: [true, 'An activity must have a start time'],
        },
        endTime: {
          type: String, // Format: "17:00"
          required: [true, 'An activity must have an end time'],
          validate: {
            validator: function (val) {
              return val > this.startTime;
            },
            message: 'End time must be after start time',
          },
        },
        notes: String,
        location: {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
          },
          coordinates: [Number],
          address: String,
        },
        isFlexible: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'completed', 'cancelled'],
          default: 'pending',
        },
      },
    ],
    budget: {
      currency: {
        type: String,
        default: 'USD',
      },
      amount: {
        type: Number,
        min: 0,
      },
      estimatedCost: {
        type: Number,
        min: 0,
      },
      actualCost: {
        type: Number,
        min: 0,
      },
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['viewer', 'editor', 'admin'],
          default: 'viewer',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    coverImage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
planSchema.index({ user: 1 });
planSchema.index({ 'destination.location': '2dsphere' });
planSchema.index({ startDate: 1, endDate: 1 });

// Query middleware
planSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Virtual populate reviews
planSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'plan',
  localField: '_id',
});

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
