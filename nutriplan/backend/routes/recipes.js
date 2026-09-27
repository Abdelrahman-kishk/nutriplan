const express = require('express');
const router = express.Router();
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');
const { attachUser } = require('../middleware/guestUser');

router.route('/').get(getRecipes).post(attachUser, createRecipe);

router
  .route('/:id')
  .get(getRecipe)
  .put(attachUser, updateRecipe)
  .delete(attachUser, deleteRecipe);

module.exports = router;
