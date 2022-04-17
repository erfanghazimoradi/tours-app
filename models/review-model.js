const mongoose = require('mongoose');
const Tour = require('./tour-model');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review can not be empty']
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calcAverageRatings = async function (tourID) {
  const [{ numRating = 0, avgRating = 3 } = []] = await this.aggregate([
    {
      $match: { tour: tourID }
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourID, {
    ratingsAverage: avgRating,
    ratingsQuantity: numRating
  });
};

ReviewSchema.post('save', async function (document) {
  await document.constructor.calcAverageRatings(document.tour);
});

// access reveiw doc pre query
// ReviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.reviewDoc = await this.model.findOne(this.getQuery());
//   // or
//   this.reviewDoc = await this.findOne().clone();
//   next();
// });

ReviewSchema.post(/^findOneAnd/, async function (document) {
  await document.constructor.calcAverageRatings(document.tour);
});

ReviewSchema.pre(/^find/, function (next) {
  this.populate('user', '-__v -createdAt -passwordChangedAt');

  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
