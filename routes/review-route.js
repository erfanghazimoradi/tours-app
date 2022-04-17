const router = require('express').Router({ mergeParams: true });
const { protect, restrictTo } = require('../controllers/authentication-controller');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  removeReview,
  reviewInitialization
} = require('../controllers/review-controller');

// authenticate routes
router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), reviewInitialization, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), removeReview);

module.exports = router;
