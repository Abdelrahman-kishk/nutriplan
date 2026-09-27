const mongoose = require('mongoose');

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const FoodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null,
    },
    customFoodName: { type: String, trim: true },
    portionSize: {
      type: Number,
      required: true,
      min: 0.1,
      default: 1, // multiplier relative to 1 serving / base unit
    },
    mealSlot: { type: String, enum: MEAL_SLOTS, required: true },
    loggedDate: {
      type: String, // stored as YYYY-MM-DD for easy day-bucket queries
      required: true,
      index: true,
    },
    macros: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0 },
      carbs: { type: Number, required: true, min: 0 },
      fats: { type: Number, required: true, min: 0 },
    },
  },
  { timestamps: true }
);

FoodLogSchema.index({ user: 1, loggedDate: 1 });

FoodLogSchema.statics.MEAL_SLOTS = MEAL_SLOTS;

module.exports = mongoose.model('FoodLog', FoodLogSchema);
