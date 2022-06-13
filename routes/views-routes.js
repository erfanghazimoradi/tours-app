const router = require('express').Router();
const accountRoute = require('./account-route');
const { isLoggedIn } = require('../controllers/authentication-controller');
const {
  homePage,
  tourPage,
  loginPage,
  signupPage,
  resetPassword,
  forgetPassword
} = require('../controllers/views-controller');

router.use('/account', accountRoute);

router.use(isLoggedIn);

router.get('/', homePage);

router.get('/tours', homePage);

router.get('/tours/:slugname', tourPage);

router.get('/signup', signupPage);

router.get('/login', loginPage);

router.get('/reset-password/:token', resetPassword);

router.get('/forget-password', forgetPassword);

module.exports = router;
