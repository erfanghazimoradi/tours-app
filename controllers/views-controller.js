const { join } = require('path');
const Tour = require('../models/tour-model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const homePage = catchAsync(async (request, response, next) => {
  const tours = await Tour.find({});

  response.render(join(__dirname, '../views/home.pug'), { title: 'All Tours', tours });
});

const tourPage = catchAsync(async (request, response, next) => {
  const { slugname } = request.params;

  const tour = await Tour.findOne({ slugname }).populate('reviews');

  if (!tour) return next(new AppError(404, 'Tour not exist, use tours page!'));

  response.render(join(__dirname, '../views/tour.pug'), { title: tour.name, tour });
});

const loginPage = (request, response) => {
  if (!!response.locals.user) return response.redirect('/');

  response.render(join(__dirname, '../views/login.pug'), {
    title: 'Log into tours app'
  });
};

const signupPage = (request, response) => {
  if (!!response.locals.user) return response.redirect('/');

  response.render(join(__dirname, '../views/signup.pug'), {
    title: 'Join tours app'
  });
};

const accountSettings = (request, response) => {
  response.render(join(__dirname, '../views/_settings.pug'), {
    title: 'Account settings'
  });
};

const accountPassword = (request, response) => {
  response.render(join(__dirname, '../views/_password.pug'), {
    title: 'Account password'
  });
};

const resetPassword = (request, response) => {
  response.render(join(__dirname, '../views/resetPassword.pug'), {
    title: 'Reset password'
  });
};

module.exports = {
  homePage,
  tourPage,
  loginPage,
  signupPage,
  accountSettings,
  accountPassword,
  resetPassword
};
