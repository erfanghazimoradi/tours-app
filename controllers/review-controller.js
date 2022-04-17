const Review = require('../models/review-model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const Tour = require('../models/tour-model');
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne
} = require('./handler-controller');

const reviewInitialization = catchAsync(async (request, response, next) => {
  request.body.tour ??= request.params.id;
  request.body.user = request.user._id;

  const tour = await Tour.findById(request.body.tour);

  if (!tour) return next(new AppError(404, `tour: ${request.body.tour} not found!`));

  next();
});

const getAllReviews = getAll(Review);
const getReview = getOne(Review);
const createReview = createOne(Review);
const updateReview = updateOne(Review);
const removeReview = deleteOne(Review);

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  removeReview,
  reviewInitialization
};
