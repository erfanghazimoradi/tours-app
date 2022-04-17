const router = require('express').Router();
const { protect } = require('../controllers/authentication-controller');
const { accountSettings, accountPassword } = require('../controllers/views-controller');

router.use(protect);

router.get('/settings', accountSettings);

router.get('/password', accountPassword);

module.exports = router;
