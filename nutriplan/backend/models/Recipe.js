const mongoose = require('mongoose');
const slugify = require('slugify');

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];
const DIET_TAGS = [
  'High Protein',
  'Low Carb',
  'Vegan',
  'Gluten-Free',
  'Quick Meals',
  'Keto',
];

const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    imageUrl: { type: String, required: true },
    prepTime: { type: Number, required: true, min: 0 }, // minutes
    cookTime: { type: Number, required: true, min: 0 }, // minutes
    servings: { type: Number, required: true, min: 1 },
    mealType: { type: String, enum: MEAL_TYPES, required: true, index: true },
    dietTags: [{ type: String, enum: DIET_TAGS }],
    ingredients: {
      type: [IngredientSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    instructions: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    macros: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0 },
      carbs: { type: Number, required: true, min: 0 },
      fats: { type: Number, required: true, min: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

RecipeSchema.index({ title: 'text', description: 'text', 'ingredients.name': 'text' });

RecipeSchema.pre('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(`${this.title}-${Date.now().toString().slice(-5)}`, {
      lower: true,
      strict: true,
    });
  }
  next();
});

RecipeSchema.statics.MEAL_TYPES = MEAL_TYPES;
RecipeSchema.statics.DIET_TAGS = DIET_TAGS;

module.exports = mongoose.model('Recipe', RecipeSchema);
