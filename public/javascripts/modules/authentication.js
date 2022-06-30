import axios from 'axios';
import { showAlert, elementContent } from './alerts';
import { baseUrl } from './locationUtils';

const signup = async e => {
  e.preventDefault();

  try {
    const data = {
      firstname: document.getElementById('firstname').value,
      lastname: document.getElementById('lastname').value,
      gender: document.getElementById('gender').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      passwordConfirm: document.getElementById('passwordConfirm').value
    };

    elementContent('#signupForm button', 'loading...');

    const response = await axios.post(`${baseUrl}/api/auth/signup`, data);

    elementContent('#signupForm button', 'sign up');

    if (response.data.status === 'success') {
      await showAlert(response.data.status, 'Your account created successfully');

      location.href = `${baseUrl}/`;
    }
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  } finally {
    elementContent('#signupForm button', 'sign up');
  }
};

const login = async e => {
  e.preventDefault();

  const data = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await axios.post(`${baseUrl}/api/auth/login`, data);

    if (response.data.status === 'success') {
      await showAlert(response.data.status, 'Logged in successfully');

      location.href = `${baseUrl}/`;
    }
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  }
};

const logout = async () => {
  try {
    await axios.delete(`${baseUrl}/api/auth/logout`);

    await showAlert('success', 'Logged out successfully');

    // reload from server for cache
    location.reload(true);

    location.href = `${baseUrl}/`;
  } catch (err) {
    showAlert('error', 'Log out failed! Try again.', 3000);
  }
};

const changePassword = async e => {
  e.preventDefault();

  const data = {
    currentPassword: document.getElementById('currentPassword').value,
    password: document.getElementById('password').value,
    passwordConfirm: document.getElementById('passwordConfirm').value
  };

  try {
    elementContent('#changePasswordForm button', 'loading...');

    const response = await axios.patch(`${baseUrl}/api/auth/change-password`, data);

    elementContent('#changePasswordForm button', 'change password');

    await showAlert(response.data.status, 'Password changed successfully');
    location.reload(true);
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  } finally {
    elementContent('#changePasswordForm button', 'change password');
  }
};

const resetPasswordToken = async e => {
  e.preventDefault();

  const data = { email: document.getElementById('resetPasswordEmail').value };

  try {
    elementContent('#accountResetPassword button', 'loading...');

    const response = await axios.post(`${baseUrl}/api/auth/forget-password`, data);

    elementContent('#accountResetPassword button', 'send token');

    showAlert(response.data.status, response.data.data.message, 4000);
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  } finally {
    elementContent('#accountResetPassword button', 'send token');
  }
};

const forgetPasswordToken = async e => {
  e.preventDefault();

  const data = { email: document.getElementById('forgetPasswordEmail').value };

  try {
    elementContent('#forgetPasswordForm button', 'loading...');

    const response = await axios.post(`${baseUrl}/api/auth/forget-password`, data);

    elementContent('#forgetPasswordForm button', 'Send login link');

    showAlert(response.data.status, response.data.data.message, 4000);
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  } finally {
    elementContent('#accountResetPassword button', 'Send login link');
  }
};

const resetPassword = async e => {
  e.preventDefault();

  const resetUrl = location.href.replace(`${baseUrl}/`, '').replace('?', '');

  const data = {
    password: document.getElementById('newPassword').value,
    passwordConfirm: document.getElementById('newPasswordConfirm').value
  };

  try {
    elementContent('#resetPasswordForm button', 'loading...');

    const response = await axios.patch(`${baseUrl}/api/auth/${resetUrl}`, data);

    elementContent('#resetPasswordForm button', 'reset password');

    await showAlert(response.data.status, 'Your password reset successfully');

    location.reload(true);
    location.href = `${baseUrl}/`;
  } catch (err) {
    await showAlert(err.response.data.status, err.response.data.message, 5000);
  } finally {
    elementContent('#resetPasswordForm button', 'reset password');
  }
};

export {
  signup,
  login,
  logout,
  changePassword,
  resetPassword,
  resetPasswordToken,
  forgetPasswordToken
};
