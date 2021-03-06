import { displayMap } from '../modules/mapbox';
import { deactiveAccount, editAccount, deleteAccount } from '../modules/settings';
import { bookTour } from '../modules/bookings';
import {
  signup,
  login,
  logout,
  changePassword,
  resetPassword,
  resetPasswordToken,
  forgetPasswordToken
} from '../modules/authentication';

const mapbox = document.getElementById('map');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.querySelector('.nav__el--logout');
const genderInput = document.getElementById('gender');
const editAccountForm = document.getElementById('editAccountForm');
const deactiveAccountBtn = document.getElementById('deactiveAccountBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const changePasswordForm = document.getElementById('changePasswordForm');
const accountResetPassword = document.getElementById('accountResetPassword');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const forgetPasswordForm = document.getElementById('forgetPasswordForm');
const bookTourBtn = document.getElementById('bookTourBtn');

console.log(!!bookTourBtn);

// mapbox
if (!!mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

// authentication
if (!!signupForm) signupForm.addEventListener('submit', signup);

if (!!loginForm) loginForm.addEventListener('submit', login);

if (!!logoutBtn) logoutBtn.addEventListener('click', logout);

// account
if (!!genderInput && !!genderInput?.dataset.gender) {
  [...genderInput.children].forEach(option => {
    option.selected = option.value === genderInput?.dataset.gender;
  });
}

if (!!editAccountForm) editAccountForm.addEventListener('submit', editAccount);

if (!!deactiveAccountBtn) deactiveAccountBtn.addEventListener('click', deactiveAccount);

if (!!deleteAccountBtn) deleteAccountBtn.addEventListener('click', deleteAccount);

if (!!changePasswordForm) changePasswordForm.addEventListener('submit', changePassword);

if (!!accountResetPassword)
  accountResetPassword.addEventListener('submit', resetPasswordToken);

if (!!resetPasswordForm) resetPasswordForm.addEventListener('submit', resetPassword);

if (!!forgetPasswordForm)
  forgetPasswordForm.addEventListener('submit', forgetPasswordToken);

if (!!bookTourBtn) bookTourBtn.addEventListener('click', bookTour);
