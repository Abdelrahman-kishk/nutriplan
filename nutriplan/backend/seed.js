require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Recipe = require('./models/Recipe');
const User = require('./models/User');

const recipes = [
  {
    title: 'Greek Yogurt Protein Bowl',
    description: 'Creamy Greek yogurt topped with berries, honey and crunchy granola.',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    mealType: 'Breakfast',
    dietTags: ['High Protein', 'Quick Meals', 'Gluten-Free'],
    ingredients: [
      { name: 'Greek yogurt', quantity: '1 cup' },
      { name: 'Mixed berries', quantity: '1/2 cup' },
      { name: 'Honey', quantity: '1 tbsp' },
      { name: 'Granola', quantity: '1/4 cup' },
    ],
    instructions: [
      'Spoon the Greek yogurt into a bowl.',
      'Top with mixed berries and granola.',
      'Drizzle honey over the top and serve immediately.',
    ],
    macros: { calories: 320, protein: 24, carbs: 38, fats: 8 },
  },
  {
    title: 'Veggie & Egg White Omelette',
    description: 'Fluffy egg white omelette packed with spinach, bell peppers and onions.',
    imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800',
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    mealType: 'Breakfast',
    dietTags: ['High Protein', 'Low Carb', 'Gluten-Free'],
    ingredients: [
      { name: 'Egg whites', quantity: '5' },
      { name: 'Spinach', quantity: '1 cup' },
      { name: 'Bell pepper, diced', quantity: '1/2' },
      { name: 'Onion, diced', quantity: '1/4' },
      { name: 'Olive oil', quantity: '1 tsp' },
    ],
    instructions: [
      'Heat olive oil in a nonstick pan over medium heat.',
      'Sauté onions and peppers until soft, then add spinach until wilted.',
      'Pour in egg whites and cook, folding gently, until set.',
      'Fold the omelette in half and serve warm.',
    ],
    macros: { calories: 210, protein: 26, carbs: 9, fats: 6 },
  },
  {
    title: 'Overnight Oats with Almond Butter',
    description: 'No-cook oats soaked overnight with almond butter and banana slices.',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    mealType: 'Breakfast',
    dietTags: ['Quick Meals', 'Vegan'],
    ingredients: [
      { name: 'Rolled oats', quantity: '1/2 cup' },
      { name: 'Almond milk', quantity: '3/4 cup' },
      { name: 'Almond butter', quantity: '1 tbsp' },
      { name: 'Banana, sliced', quantity: '1/2' },
      { name: 'Chia seeds', quantity: '1 tsp' },
    ],
    instructions: [
      'Combine oats, almond milk, chia seeds and almond butter in a jar.',
      'Stir well, cover, and refrigerate overnight.',
      'Top with banana slices before serving.',
    ],
    macros: { calories: 340, protein: 11, carbs: 48, fats: 12 },
  },
  {
    title: 'Grilled Chicken Caesar Salad',
    description: 'Crisp romaine, shaved parmesan and grilled chicken breast in a light Caesar dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
    prepTime: 15,
    cookTime: 12,
    servings: 2,
    mealType: 'Lunch',
    dietTags: ['High Protein', 'Low Carb'],
    ingredients: [
      { name: 'Chicken breast', quantity: '2 pieces' },
      { name: 'Romaine lettuce', quantity: '1 head' },
      { name: 'Parmesan, shaved', quantity: '1/4 cup' },
      { name: 'Caesar dressing (light)', quantity: '3 tbsp' },
      { name: 'Croutons', quantity: '1/2 cup' },
    ],
    instructions: [
      'Season chicken breast and grill 5-6 minutes per side until cooked through.',
      'Slice chicken and set aside to rest.',
      'Toss romaine with dressing and parmesan.',
      'Top salad with sliced chicken and croutons.',
    ],
    macros: { calories: 410, protein: 38, carbs: 14, fats: 22 },
  },
  {
    title: 'Quinoa Chickpea Power Bowl',
    description: 'A hearty plant-based bowl of quinoa, roasted chickpeas, avocado and tahini drizzle.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    mealType: 'Lunch',
    dietTags: ['Vegan', 'High Protein', 'Gluten-Free'],
    ingredients: [
      { name: 'Quinoa', quantity: '1 cup' },
      { name: 'Chickpeas, roasted', quantity: '1 can' },
      { name: 'Avocado', quantity: '1' },
      { name: 'Cherry tomatoes', quantity: '1 cup' },
      { name: 'Tahini', quantity: '2 tbsp' },
    ],
    instructions: [
      'Cook quinoa according to package instructions and let cool slightly.',
      'Roast chickpeas at 400°F for 20 minutes until crisp.',
      'Assemble bowls with quinoa, chickpeas, tomatoes and sliced avocado.',
      'Drizzle with tahini and serve.',
    ],
    macros: { calories: 520, protein: 19, carbs: 61, fats: 22 },
  },
  {
    title: 'Turkey & Avocado Wrap',
    description: 'A quick whole-wheat wrap loaded with lean turkey, avocado and fresh veggies.',
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    mealType: 'Lunch',
    dietTags: ['Quick Meals', 'High Protein'],
    ingredients: [
      { name: 'Whole-wheat tortilla', quantity: '1' },
      { name: 'Turkey breast, sliced', quantity: '4 oz' },
      { name: 'Avocado', quantity: '1/2' },
      { name: 'Lettuce', quantity: '2 leaves' },
      { name: 'Tomato, sliced', quantity: '1/2' },
    ],
    instructions: [
      'Lay the tortilla flat and spread mashed avocado evenly.',
      'Layer turkey, lettuce and tomato on top.',
      'Roll tightly, slice in half, and serve.',
    ],
    macros: { calories: 380, protein: 28, carbs: 34, fats: 15 },
  },
  {
    title: 'Baked Salmon with Asparagus',
    description: 'Oven-roasted salmon fillet with garlic asparagus and a lemon butter glaze.',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    mealType: 'Dinner',
    dietTags: ['High Protein', 'Low Carb', 'Gluten-Free', 'Keto'],
    ingredients: [
      { name: 'Salmon fillets', quantity: '2' },
      { name: 'Asparagus', quantity: '1 bunch' },
      { name: 'Garlic, minced', quantity: '2 cloves' },
      { name: 'Butter', quantity: '2 tbsp' },
      { name: 'Lemon', quantity: '1' },
    ],
    instructions: [
      'Preheat oven to 400°F (200°C).',
      'Arrange salmon and asparagus on a baking sheet, season generously.',
      'Melt butter with garlic and lemon juice, drizzle over salmon.',
      'Bake for 18-20 minutes until salmon flakes easily.',
    ],
    macros: { calories: 460, protein: 42, carbs: 8, fats: 28 },
  },
  {
    title: 'Beef & Broccoli Stir-Fry',
    description: 'Tender strips of beef stir-fried with broccoli in a savory garlic-ginger sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
    prepTime: 15,
    cookTime: 15,
    servings: 3,
    mealType: 'Dinner',
    dietTags: ['High Protein', 'Quick Meals'],
    ingredients: [
      { name: 'Flank steak, sliced thin', quantity: '1 lb' },
      { name: 'Broccoli florets', quantity: '3 cups' },
      { name: 'Soy sauce', quantity: '3 tbsp' },
      { name: 'Garlic, minced', quantity: '3 cloves' },
      { name: 'Ginger, minced', quantity: '1 tbsp' },
    ],
    instructions: [
      'Sear beef in a hot wok until browned, remove and set aside.',
      'Stir-fry broccoli, garlic and ginger for 3-4 minutes.',
      'Return beef to the wok, add soy sauce and toss to combine.',
      'Cook another 2 minutes and serve hot.',
    ],
    macros: { calories: 390, protein: 36, carbs: 16, fats: 20 },
  },
  {
    title: 'Vegan Lentil Shepherd\u2019s Pie',
    description: 'A comforting plant-based twist on the classic, with a creamy mashed potato topping.',
    imageUrl: 'https://images.unsplash.com/photo-1605349740074-6ea60bcf3e0d?w=800',
    prepTime: 20,
    cookTime: 40,
    servings: 4,
    mealType: 'Dinner',
    dietTags: ['Vegan', 'Gluten-Free'],
    ingredients: [
      { name: 'Green lentils, cooked', quantity: '2 cups' },
      { name: 'Carrots, diced', quantity: '1 cup' },
      { name: 'Peas', quantity: '1 cup' },
      { name: 'Potatoes, mashed', quantity: '4 cups' },
      { name: 'Vegetable broth', quantity: '1 cup' },
    ],
    instructions: [
      'Simmer lentils, carrots, peas and broth until thickened.',
      'Spread lentil mixture in a baking dish.',
      'Top evenly with mashed potatoes.',
      'Bake at 375°F for 25 minutes until golden on top.',
    ],
    macros: { calories: 340, protein: 15, carbs: 58, fats: 5 },
  },
  {
    title: 'Almond & Dark Chocolate Bites',
    description: 'No-bake energy bites with almonds, oats and dark chocolate chips.',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa419d6da3?w=800',
    prepTime: 15,
    cookTime: 0,
    servings: 6,
    mealType: 'Snacks',
    dietTags: ['Vegan', 'Quick Meals'],
    ingredients: [
      { name: 'Rolled oats', quantity: '1 cup' },
      { name: 'Almond butter', quantity: '1/2 cup' },
      { name: 'Dark chocolate chips', quantity: '1/3 cup' },
      { name: 'Honey or maple syrup', quantity: '1/4 cup' },
      { name: 'Chopped almonds', quantity: '2 tbsp' },
    ],
    instructions: [
      'Mix all ingredients together in a bowl until combined.',
      'Roll into small bite-sized balls.',
      'Refrigerate for at least 30 minutes before serving.',
    ],
    macros: { calories: 150, protein: 4, carbs: 16, fats: 8 },
  },
  {
    title: 'Crispy Baked Kale Chips',
    description: 'Crunchy, savory kale chips baked with a touch of olive oil and sea salt.',
    imageUrl: 'https://images.unsplash.com/photo-1615486511262-c7e0c0898d0f?w=800',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    mealType: 'Snacks',
    dietTags: ['Vegan', 'Low Carb', 'Gluten-Free', 'Keto'],
    ingredients: [
      { name: 'Kale leaves', quantity: '1 bunch' },
      { name: 'Olive oil', quantity: '1 tbsp' },
      { name: 'Sea salt', quantity: '1/2 tsp' },
    ],
    instructions: [
      'Preheat oven to 300°F (150°C).',
      'Toss torn kale leaves with olive oil and salt.',
      'Spread on a baking sheet in a single layer.',
      'Bake 12-15 minutes until crisp, watching closely to avoid burning.',
    ],
    macros: { calories: 90, protein: 3, carbs: 8, fats: 6 },
  },
  {
    title: 'Cottage Cheese & Pineapple Cup',
    description: 'A refreshing high-protein snack combining creamy cottage cheese and sweet pineapple.',
    imageUrl: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    mealType: 'Snacks',
    dietTags: ['High Protein', 'Quick Meals', 'Gluten-Free'],
    ingredients: [
      { name: 'Cottage cheese', quantity: '1 cup' },
      { name: 'Pineapple chunks', quantity: '1/2 cup' },
      { name: 'Mint leaves (optional)', quantity: 'a few' },
    ],
    instructions: [
      'Spoon cottage cheese into a bowl or cup.',
      'Top with fresh pineapple chunks.',
      'Garnish with mint leaves if desired and serve chilled.',
    ],
    macros: { calories: 180, protein: 22, carbs: 15, fats: 3 },
  },
  {
    title: 'Flourless Dark Chocolate Avocado Mousse',
    description: 'A silky, rich chocolate mousse made creamy with ripe avocado instead of cream.',
    imageUrl: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=800',
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    mealType: 'Dessert',
    dietTags: ['Vegan', 'Gluten-Free'],
    ingredients: [
      { name: 'Ripe avocados', quantity: '2' },
      { name: 'Cocoa powder', quantity: '1/3 cup' },
      { name: 'Maple syrup', quantity: '1/3 cup' },
      { name: 'Vanilla extract', quantity: '1 tsp' },
      { name: 'Almond milk', quantity: '2 tbsp' },
    ],
    instructions: [
      'Blend avocado, cocoa powder, maple syrup, vanilla and almond milk until smooth.',
      'Taste and adjust sweetness if needed.',
      'Chill for at least 20 minutes before serving.',
    ],
    macros: { calories: 210, protein: 3, carbs: 24, fats: 13 },
  },
  {
    title: 'Keto Peanut Butter Fat Bombs',
    description: 'Rich, no-bake peanut butter and coconut oil bites perfect for a keto treat.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
    prepTime: 10,
    cookTime: 0,
    servings: 8,
    mealType: 'Dessert',
    dietTags: ['Keto', 'Low Carb', 'Gluten-Free', 'Quick Meals'],
    ingredients: [
      { name: 'Peanut butter, natural', quantity: '1/2 cup' },
      { name: 'Coconut oil', quantity: '1/4 cup' },
      { name: 'Stevia or monk fruit sweetener', quantity: '2 tbsp' },
      { name: 'Vanilla extract', quantity: '1/2 tsp' },
    ],
    instructions: [
      'Melt coconut oil and mix with peanut butter, sweetener and vanilla.',
      'Pour into a silicone mold or mini muffin tin.',
      'Freeze for 30 minutes until solid, then store chilled.',
    ],
    macros: { calories: 160, protein: 4, carbs: 3, fats: 16 },
  },
];

const seed = async () => {
  try {
    await connectDB();

    if (process.argv.includes('--destroy')) {
      await Recipe.deleteMany();
      console.log('[Seed] All recipes destroyed.');
      process.exit(0);
    }

    // No login in this app — attribute seeded recipes to the single auto-created Guest user.
    let guest = await User.findOne({ email: 'guest@nutriplan.local' });
    if (!guest) {
      guest = await User.create({
        fullName: 'Guest User',
        email: 'guest@nutriplan.local',
        password: `guest-${Math.random().toString(36).slice(2)}A1!`,
        role: 'admin',
        subscription: 'Premium',
      });
      console.log('[Seed] Guest user created.');
    }

    await Recipe.deleteMany();
    const withAuthor = recipes.map((r) => ({ ...r, createdBy: guest._id }));
    await Recipe.insertMany(withAuthor);

    console.log(`[Seed] Successfully seeded ${recipes.length} recipes.`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seed();
