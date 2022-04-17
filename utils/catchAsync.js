const catchAsync = fn => (request, response, next) => {
  fn(request, response, next).catch(next);
};

module.exports = { catchAsync };
