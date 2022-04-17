const { randomBytes, createHash } = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'please tell us your firstname'],
    maxlength: [30, 'A firstname must have less or equal then 30 characters'],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, 'please tell us your lastname'],
    maxlength: [30, 'A lastname must have less or equal then 30 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'please provide your password'],
    select: false,
    minlength: [8, 'a password must have more or equal then 8 characters'],
    validate: {
      validator: function (value) {
        return /^((?=.*\d)|(?=.*\W)|(?=.*_))(?=.*[a-zA-Z]).{8,}$/.test(value);
      },
      message: 'a password must have at least one letter and one digit'
    }
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please provide password confirm'],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'password and password confirm are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'invalid role: ({VALUE})'
    },
    default: 'user'
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other', 'not-set'],
      message: 'gender is either: male, female, other'
    },
    default: 'not-set'
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

// update password status
UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// exclude not active users
UserSchema.pre(/^find/, function (next) {
  const projection = this._userProvidedFields && Object.keys(this._userProvidedFields)[0];

  const queryFilter = this._conditions && Object.keys(this._conditions)[0];

  // activate account by login
  if (projection === '+password' && queryFilter === 'email') return next();

  // deactive account
  this.find({ active: { $ne: false } });

  next();
});

// compare encrypted password
UserSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check for password changes
UserSchema.methods.changedPassword = function (jwtTimestamp) {
  if (!!this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }

  return false;
};

// generate password reset token
UserSchema.methods.generateResetPasswordToken = function () {
  const resetToken = randomBytes(32).toString('hex');

  this.passwordResetToken = createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
