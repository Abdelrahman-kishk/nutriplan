const Recipe = require('../models/Recipe');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all recipes (search, filter, paginate, sort)
// @route   GET /api/recipes
// @access  Public
// Query params: search, category (mealType), diet, page, limit, sort
const getRecipes = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    diet,
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { 'ingredients.name': { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (category && category !== 'All Recipes') {
    query.mealType = category;
  }

  if (diet && diet !== 'All Recipes') {
    query.dietTags = diet;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'calories-asc': 'macros.calories',
    'calories-desc': '-macros.calories',
    'time-asc': 'prepTime',
    'title-asc': 'title',
  };
  const sortBy = sortMap[sort] || sort;

  const [recipes, total] = await Promise.all([
    Recipe.find(query).sort(sortBy).skip(skip).limit(limitNum),
    Recipe.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: recipes.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: recipes,
  });
});

// @desc    Get single recipe by id or slug
// @route   GET /api/recipes/:id
// @access  Public
const getRecipe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  const recipe = isObjectId
    ? await Recipe.findById(id)
    : await Recipe.findOne({ slug: id });

  if (!recipe) {
    throw new AppError('Recipe not found', 404);
  }

  res.status(200).json({ success: true, data: recipe });
});

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private/Admin
const createRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: recipe });
});

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!recipe) throw new AppError('Recipe not found', 404);
  res.status(200).json({ success: true, data: recipe });
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);
  if (!recipe) throw new AppError('Recipe not found', 404);
  res.status(200).json({ success: true, message: 'Recipe deleted' });
});

// @desc    Get recipe categories with counts (grouped by mealType)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const counts = await Recipe.aggregate([
    { $group: { _id: '$mealType', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const iconMap = {
    Breakfast: 'fa-mug-hot',
    Lunch: 'fa-bowl-food',
    Dinner: 'fa-utensils',
    Snacks: 'fa-apple-whole',
    Dessert: 'fa-ice-cream',
  };

  const categories = Recipe.MEAL_TYPES.map((type) => {
    const found = counts.find((c) => c._id === type);
    return {
      name: type,
      icon: iconMap[type] || 'fa-utensils',
      count: found ? found.count : 0,
    };
  });

  const totalRecipes = counts.reduce((sum, c) => sum + c.count, 0);

  res.status(200).json({
    success: true,
    total: totalRecipes,
    data: categories,
    dietTags: Recipe.DIET_TAGS,
  });
});

module.exports = {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories,
};
