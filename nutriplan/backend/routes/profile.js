const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { attachUser } = require('../middleware/guestUser');

router.use(attachUser);

router.get('/', getProfile);
router.patch('/', updateProfile);

module.exports = router;
