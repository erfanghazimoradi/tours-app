const router = require('express').Router();
const tourRoute = require('./tour-route');
const userRoute = require('./user-route');
const authRoute = require('./authentication-route');
const reviewRoute = require('./review-route');
const bookingRoute = require('./booking-route');

router.get('/', (request, response) => response.redirect('/tours'));

router.use('/auth', authRoute);

router.use('/tours', tourRoute);

router.use('/users', userRoute);

router.use('/reviews', reviewRoute);

router.use('/bookings', bookingRoute);

module.exports = router;
