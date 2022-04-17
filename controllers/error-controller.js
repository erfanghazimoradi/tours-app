const { join } = require('path');
const { AppError } = require('../utils/appError');

const errStatusCode = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  429: 'Too Many Requests'
};

const developError = (err, request, response) => {
  if (request.originalUrl.startsWith('/api'))
    return response.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });

  console.log('[-] development error > ', err);

  response.status(err.statusCode).render(join(__dirname, '../views/error.pug'), {
    title: 'Development Error',
    message: err.message
  });
};

const productionError = (err, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return response.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });

    console.error('[-] internal server error > ', err);

    return response.status(500).json({
      status: 'error',
      message: `Something went wrong but it's not your fault!`
    });
  }

  if (err.isOperational)
    return response.status(err.statusCode).render(join(__dirname, '../views/error.pug'), {
      title: `${err.statusCode}: ${errStatusCode[err.statusCode]}`,
      message: err.message
    });

  console.error('[-] internal server error > ', err);

  return response.status(500).json({
    title: `Something went wrong but it's not your fault!`,
    message: 'Please try again later.'
  });
};

const castErrorDB = err => {
  const errMessage = `Invalid ${err.path}: ${err.value}`;

  return new AppError(400, errMessage);
};

const duplicateErrorDB = err => {
  const duplicate = err.message.match(/(["'])(\\?.)*?\1/)[0];

  const errMessage = `Duplicate field value: ${duplicate}. Please use another value!`;

  return new AppError(400, errMessage);
};

const validationErrorDB = err => {
  const errors = Object.values(err.errors)
    .map(item => item.message)
    .join(' - ');

  const errMessage = `Invalid input data: ${errors}`;

  return new AppError(400, errMessage);
};

// const MongoServerError = err => {
//   if (err.code === 2 && err.message.includes('geo near query: type'))
//     return new AppError(400, 'Provide valid and real coordinates in format: lat,lng');

//   return err;
// };

const jwtError = () => new AppError(401, 'Invalid token, Please log in again');

const jwtExpiredError = () =>
  new AppError(401, 'Your token has expired, Please log in again.');

const globalErrorHandler = (error, request, response, next) => {
  error.statusCode ??= 500;
  error.status ??= 'error';

  if (process.env.NODE_ENV === 'development')
    return developError(error, request, response);

  if (process.env.NODE_ENV === 'production') {
    // error deep copy
    let err = JSON.parse(JSON.stringify(error));
    err.message = error.message;

    if (error.code === 11000) err = duplicateErrorDB(error);
    if (error.name === 'CastError') err = castErrorDB(error);
    if (error.name === 'ValidationError') err = validationErrorDB(error);
    if (error.name === 'JsonWebTokenError') err = jwtError();
    if (error.name === 'TokenExpiredError') err = jwtExpiredError();
    // if (error.name === 'MongoServerError') err = MongoServerError(error);

    return productionError(err, request, response);
  }
};

module.exports = { globalErrorHandler };
