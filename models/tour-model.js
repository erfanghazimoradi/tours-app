const mongoose = require('mongoose');
const slugify = require('slugify');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [3, 'A tour name must have more or equal then 3 characters'],
      maxlength: [40, 'A tour name must have less or equal then 40 characters']
    },
    slugname: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      index: -1,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      index: 1,
      required: [true, 'A tour must have a price']
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summery']
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summery']
    },
    images: [String],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: 'Start location type must be Point'
        }
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: {
            values: ['Point'],
            message: 'Locations type must be Point'
          }
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    startDates: [Date],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    secretTour: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TourSchema.index({ slugname: 1 });
TourSchema.index({ startLocation: '2dsphere' });

TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

TourSchema.virtual('tomanPrice').get(function () {
  return this.price * 42000;
});

/* Mongoose Middleware {
  1. document middleware => this = current document
  2. query middleware => this = current find
  3. aggregate middleware => this = current aggregate pipeline
  4. model middleware => this = current model
} */

// DOCUMENT MIDDLEWARE: run before .save() and .create()
TourSchema.pre('save', function (next) {
  this.slugname = slugify(this.name, { lower: true });

  next();
});

// QUERY MIDDLEWARE: this point to query
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.queryStart = Date.now();
  next();
});

TourSchema.pre(/^find/, function (next) {
  this.populate('guides', '-__v -createdAt -passwordChangedAt');

  next();
});

TourSchema.post(/^find/, function (docs, next) {
  // console.log(`[i] query took ${Date.now() - this.queryStart}ms.`);

  next();
});

// AGGREGATION MIDDLEWARE: this point to aggregate
TourSchema.pre('aggregate', function (next) {
  // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());

  this.aggregateStart = Date.now();
  next();
});

TourSchema.post('aggregate', function (docs, next) {
  // console.log(`[i] aggregation took ${Date.now() - this.aggregateStart}ms.`);

  next();
});

module.exports = mongoose.model('Tour', TourSchema);
