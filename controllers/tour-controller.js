const ObjectId = require('mongoose').Types.ObjectId;
const Tour = require('../models/tour-model');
const { AppError } = require('../utils/appError');
const { APIFeatures } = require('../utils/apiFeatures');
const { catchAsync } = require('../utils/catchAsync');
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne
} = require('./handler-controller');

const checkTourID = (request, response, next, value) => {
  const err = new AppError(400, `Invalid tour ID: ${value}`);

  if (!ObjectId.isValid(value)) return next(err);

  const tourID = String(new ObjectId(value));
  if (tourID === value) return next();

  next(err);
};

const getAllTours = getAll(Tour);
const getTour = getOne(Tour, { path: 'reviews' });
const createTour = createOne(Tour);
const updateTour = updateOne(Tour);
const removeTour = deleteOne(Tour);

const topTours = (request, response, next) => {
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,difficulty,ratingsAverage,price,summary';
  request.query.limit = '5';

  next();
};

const tourStats = catchAsync(async (request, response) => {
  const tours = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        total: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        numRating: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgRating: -1 }
    },
    {
      $match: { _id: { $ne: 'EASY' } }
    }
  ]);

  response.status(200).json({
    status: 'success',
    total: tours.length,
    data: { tours }
  });
});

const monthlyPlan = catchAsync(async (request, response) => {
  const currentYear = new Date().getFullYear();
  const { year = currentYear } = request.query;

  const tours = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $lte: new Date(`${year}-12-31`),
          $gte: new Date(`${year}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { month: 1 }
    },
    {
      $limit: 12
    }
  ]);

  response.status(200).json({
    status: 'success',
    total: tours.length,
    year,
    data: { tours }
  });
});

const toursWithin = catchAsync(async (request, response, next) => {
  const { distance, latlng, unit = 'km' } = request.params;

  const [latitude, longitude] = latlng.split(',');

  if (unit !== 'km' && unit !== 'mi')
    return next(new AppError(400, 'unit either: km or mi'));

  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

  if (!latitude || !longitude)
    return next(
      new AppError(400, 'provide latitute and longitude in the format: lat,lng')
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
    }
  });

  response.status(200).json({
    status: 'success',
    total: tours.length,
    center_coordinate: [Number(latitude), Number(longitude)],
    distance: Number(distance),
    distance_unit: unit,
    radius,
    radius_unit: 'radian',
    data: { tours }
  });
});

const toursDistance = catchAsync(async (request, response, next) => {
  const { latlng, unit = 'km' } = request.params;

  const [latitude, longitude] = latlng.split(',');

  if (!latitude || !longitude)
    return next(
      new AppError(400, 'provide latitute and longitude in the format: lat,lng')
    );

  if (unit !== 'km' && unit !== 'mi')
    return next(new AppError(400, 'unit either: km or mi'));

  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: { name: 1, distance: 1, startLocation: 1 }
    }
  ]);

  response.status(200).json({
    status: 'success',
    total: distances.length,
    origin_coordinate: [Number(latitude), Number(longitude)],
    distance_unit: unit,
    data: { distances }
  });
});

module.exports = {
  checkTourID,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  removeTour,
  topTours,
  tourStats,
  monthlyPlan,
  toursWithin,
  toursDistance
};
