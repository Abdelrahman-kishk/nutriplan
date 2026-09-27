const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/recipeController');

router.get('/', getCategories);

module.exports = router;
