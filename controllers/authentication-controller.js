const { promisify } = require('util');
const { createHash } = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { sendEmail } = require('../utils/sendEmail');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const sendToken = (user, statusCode, response) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  response.cookie('jwt', token, cookieOptions);

  response.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

const signup = catchAsync(async (request, response, next) => {
  const { firstname, lastname, email, password, passwordConfirm, gender, avatar } =
    request.body;

  const user = await User.create({
    firstname,
    lastname,
    email,
    password,
    passwordConfirm,
    gender,
    avatar
  });

  // sign token sync
  sendToken(user, 201, response);
});

const login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password)
    return next(new AppError(400, 'Please provide email address and password'));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError(401, 'Incorrect email address or password'));

  // activate user
  user.active = true;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, response);
});

const logout = (request, response, next) => {
  response.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true
  });

  return response.status(204).json({
    status: 'success',
    data: null
  });
};

const protect = catchAsync(async (request, response, next) => {
  let token;

  if (
    !!request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  } else if (!!request.cookies.jwt) {
    token = request.cookies.jwt;
  }

  if (!token)
    return next(new AppError(401, 'You are not logged in! Please log in to get access'));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user)
    return next(
      new AppError(401, 'The user belonging to this token does no longer exist')
    );

  if (user.changedPassword(decoded.iat))
    return next(new AppError(401, 'User recently changed password, please log in again'));

  request.user = user;
  response.locals.user = user;
  next();
});

// views purposes
const isLoggedIn = async (request, response, next) => {
  try {
    if (!request.cookies.jwt) return next();

    const token = request.cookies.jwt;

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) return next();

    if (user.changedPassword(decoded.iat)) return next();

    response.locals.user = user;

    return next();
  } catch (err) {
    next();
  }
};

const restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(new AppError(403, 'You do not have permission to perform this action'));

    next();
  };
};

const forgetPassword = catchAsync(async (request, response, next) => {
  const { email = '' } = request.body;

  const user = await User.findOne({ email });

  if (!user) return next(new AppError(404, 'There is no user with email address'));

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${request.protocol}://${request.get(
    'host'
  )}/auth/reset-password/${resetToken}`;

  const resetUrlClient = `${request.protocol}://${request.get(
    'host'
  )}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email,
      subject: 'Tours App: Your password reset token (valid for 10 min)',
      message: `Forgot your password? \nSubmit a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email!`,
      html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 1rem">
      <h3>Hi username</h3>
      <p>We got a request to reset your Tours App password.</p>
      <a
        href="${resetUrlClient}"
        style="
          text-decoration: none;
          display: block;
          width: 200px;
          background-color: #44ad67;
          padding: 1rem;
          border-radius: 1rem;
          color: #f9f9f9;
          margin: 1rem 0;
          text-align: center;
        "
        >Reset password</a
      >
      <p>
        If you ignore this message, your password will not be change. If you didn't request a
        password reset, ignore this message.
      </p>
    </div>
    `
    });

    response.status(200).json({
      status: 'success',
      data: {
        message: 'Token sent to email, check your inbox (valid for 10 min)'
      }
    });
  } catch (err) {
    console.error('[-] send reset password email > ', err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(new AppError(500, 'There was an error sending the email, try again later'));
  }
});

const resetPassword = catchAsync(async (request, response, next) => {
  const { password = '', passwordConfirm = '' } = request.body;
  const { resetToken } = request.params;

  const hashedToken = createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError(400, 'Token is invalid or has expired'));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, response);
});

const changePassword = catchAsync(async (request, response, next) => {
  const { currentPassword = '', password = '', passwordConfirm = '' } = request.body;

  const user = await User.findById(request.user._id).select('+password');

  if (!(await user.checkPassword(currentPassword, user.password)))
    return next(new AppError(401, 'Your current password is wrong'));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  sendToken(user, 200, response);
});

module.exports = {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgetPassword,
  changePassword,
  resetPassword,
  isLoggedIn
};
