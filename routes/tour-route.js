const router = require('express').Router();
const reviewRoute = require('./review-route');
const { protect, restrictTo } = require('../controllers/authentication-controller');
const {
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
} = require('../controllers/tour-controller');

router.route('/').get(getAllTours).post(protect, restrictTo('admin'), createTour);

// alias routing
router.route('/top-tours').get(topTours, getAllTours);

router
  .route('/monthly-plan')
  .get(protect, restrictTo('admin', 'lead-guide'), monthlyPlan);

router.route('/stats').get(protect, restrictTo('admin', 'lead-guide'), tourStats);

router.route('/within/:distance/center/:latlng/unit/:unit').get(toursWithin);

router.route('/distance/:latlng/unit/:unit').get(toursDistance);

router.param('tourID', checkTourID);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), removeTour);

router.use('/:id/reviews', reviewRoute);

module.exports = router;
