const router = require('express').Router();
const {
  signup,
  login,
  logout,
  protect,
  resetPassword,
  forgetPassword,
  changePassword
} = require('../controllers/authentication-controller');

router.post('/signup', signup);

router.post('/login', login);

router.delete('/logout', protect, logout);

router.post('/forget-password', forgetPassword);

router.patch('/change-password', protect, changePassword);

router.patch('/reset-password/:resetToken', resetPassword);

module.exports = router;
