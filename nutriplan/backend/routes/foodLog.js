const express = require('express');
const router = express.Router();
const { getTodayLog, addLogEntry, deleteLogEntry } = require('../controllers/foodLogController');
const { attachUser } = require('../middleware/guestUser');

router.use(attachUser);

router.get('/today', getTodayLog);
router.post('/', addLogEntry);
router.delete('/:id', deleteLogEntry);

module.exports = router;
