const router = require('express').Router();
const { getCheckoutSession } = require('../controllers/booking-controller');
const { protect } = require('../controllers/authentication-controller');

router.get('/checkout-session/:tourID', protect, getCheckoutSession);

module.exports = router;
