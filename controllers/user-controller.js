const { join } = require('path');
const multer = require('multer');
const User = require('../models/user-model');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { getAll, getOne, updateOne, deleteOne } = require('./handler-controller');

const upload = multer({
  dest: (request, file, callback) => {
    callback(null, join(__dirname, '../public/img/users'));
  }
});

const sanitizingBody = (body, ...allowed) => {
  const sanitized = {};

  for (const property in body) {
    if (allowed.includes(property)) sanitized[property] = body[property];
  }

  return sanitized;
};

const userAccount = (request, response, next) => {
  request.params.id = request.user._id;

  next();
};

const editAccount = catchAsync(async (request, response, next) => {
  const { password, passwordConfirm } = request.body;

  if (!!password || !!passwordConfirm)
    return next(
      new AppError(
        400,
        'this route is not for password updates. use /auth/change-password'
      )
    );

  const sanitizedBody = sanitizingBody(
    request.body,
    'firstname',
    'lastname',
    'email',
    'gender',
    'avatar'
  );

  const updated = await User.findByIdAndUpdate(request.user._id, sanitizedBody, {
    new: true,
    runValidators: true
  });

  response.status(200).json({
    status: 'success',
    data: { updated }
  });
});

const deactivateAccount = catchAsync(async (request, response, next) => {
  const deactivate = await User.findByIdAndUpdate(request.user._id, {
    active: false
  });

  response.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true
  });

  response.status(200).json({
    status: 'success',
    data: { deactivate }
  });
});

const deleteAccount = catchAsync(async (request, response, next) => {
  await User.findByIdAndDelete(request.user._id);

  response.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true
  });

  response.status(204).json({
    status: 'success',
    data: null
  });
});

const getAllUsers = getAll(User);
const getUser = getOne(User);
const updateUser = updateOne(User);
const removeUser = deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  removeUser,
  userAccount,
  editAccount,
  deactivateAccount,
  deleteAccount,
  upload
};
