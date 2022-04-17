const router = require('express').Router();
const { protect, restrictTo } = require('../controllers/authentication-controller');
const {
  getAllUsers,
  getUser,
  updateUser,
  removeUser,
  userAccount,
  editAccount,
  deleteAccount,
  deactivateAccount
} = require('../controllers/user-controller');

// authenticate routes
router.use(protect);

router
  .route('/account')
  .get(userAccount, getUser)
  .patch(editAccount)
  .put(deactivateAccount)
  .delete(deleteAccount);

// authorized admin
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);

router.route('/:id').get(getUser).patch(updateUser).delete(removeUser);

module.exports = router;
