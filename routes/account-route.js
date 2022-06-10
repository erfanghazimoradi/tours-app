const router = require('express').Router();
const { protect } = require('../controllers/authentication-controller');
const {
  accountSettings,
  accountPassword,
  accountReviews
} = require('../controllers/views-controller');

router.use(protect);

router.get('/settings', accountSettings);

router.get('/password', accountPassword);

router.get('/reviews', accountReviews);

module.exports = router;
