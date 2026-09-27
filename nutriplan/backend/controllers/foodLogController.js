const FoodLog = require('../models/FoodLog');
const Recipe = require('../models/Recipe');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// @desc    Get today's food log entries + aggregated totals
// @route   GET /api/food-log/today
// @access  Private
const getTodayLog = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();

  const entries = await FoodLog.find({ user: req.user._id, loggedDate: date })
    .populate('recipe', 'title imageUrl')
    .sort('createdAt');

  const totals = entries.reduce(
    (acc, e) => {
      acc.calories += e.macros.calories;
      acc.protein += e.macros.protein;
      acc.carbs += e.macros.carbs;
      acc.fats += e.macros.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
  entries.forEach((e) => {
    if (grouped[e.mealSlot]) grouped[e.mealSlot].push(e);
  });

  res.status(200).json({
    success: true,
    date,
    entries,
    grouped,
    totals,
    targets: req.user.dailyTargets,
  });
});

// @desc    Add entry to today's (or specified date) food log
// @route   POST /api/food-log
// @access  Private
const addLogEntry = asyncHandler(async (req, res) => {
  const {
    recipeId,
    customFoodName,
    portionSize = 1,
    mealSlot,
    loggedDate,
    macros: manualMacros,
  } = req.body;

  if (!mealSlot || !FoodLog.MEAL_SLOTS.includes(mealSlot)) {
    throw new AppError(
      `mealSlot is required and must be one of: ${FoodLog.MEAL_SLOTS.join(', ')}`,
      400
    );
  }

  let macros;
  let recipe = null;

  if (recipeId) {
    recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new AppError('Recipe not found', 404);
    macros = {
      calories: Math.round(recipe.macros.calories * portionSize),
      protein: Math.round(recipe.macros.protein * portionSize),
      carbs: Math.round(recipe.macros.carbs * portionSize),
      fats: Math.round(recipe.macros.fats * portionSize),
    };
  } else if (customFoodName && manualMacros) {
    macros = {
      calories: Math.round(manualMacros.calories * portionSize) || 0,
      protein: Math.round(manualMacros.protein * portionSize) || 0,
      carbs: Math.round(manualMacros.carbs * portionSize) || 0,
      fats: Math.round(manualMacros.fats * portionSize) || 0,
    };
  } else {
    throw new AppError(
      'Provide either a recipeId or a customFoodName with macros',
      400
    );
  }

  const entry = await FoodLog.create({
    user: req.user._id,
    recipe: recipe ? recipe._id : null,
    customFoodName: recipe ? recipe.title : customFoodName,
    portionSize,
    mealSlot,
    loggedDate: loggedDate || todayStr(),
    macros,
  });

  await entry.populate('recipe', 'title imageUrl');

  res.status(201).json({ success: true, data: entry });
});

// @desc    Delete a food log entry
// @route   DELETE /api/food-log/:id
// @access  Private
const deleteLogEntry = asyncHandler(async (req, res) => {
  const entry = await FoodLog.findOne({ _id: req.params.id, user: req.user._id });
  if (!entry) throw new AppError('Log entry not found', 404);
  await entry.deleteOne();
  res.status(200).json({ success: true, message: 'Entry removed from log' });
});

module.exports = { getTodayLog, addLogEntry, deleteLogEntry };
