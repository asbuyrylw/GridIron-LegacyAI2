import { Router } from 'express';
import { nutritionixService } from '../nutritionix-service';

const router = Router();

/**
 * Search for foods using natural language
 * Example: "2 eggs and toast with 1 tbsp of butter"
 */
router.post('/search/natural', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    const results = await nutritionixService.searchFoodByNaturalLanguage(query);
    res.json(results);
  } catch (error) {
    console.error('Error searching food by natural language:', error);
    res.status(500).json({ message: 'Failed to search foods' });
  }
});

/**
 * Search for foods by keyword
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    const results = await nutritionixService.searchFoodByKeyword(query);
    res.json(results);
  } catch (error) {
    console.error('Error searching food by keyword:', error);
    res.status(500).json({ message: 'Failed to search foods' });
  }
});

/**
 * Get detailed food information by ID
 */
router.get('/food/:type/:id', async (req, res) => {
  try {
    const { id, type } = req.params;
    
    if (!id || !type) {
      return res.status(400).json({ message: 'ID and type are required' });
    }
    
    if (type !== 'common' && type !== 'branded') {
      return res.status(400).json({ message: 'Type must be common or branded' });
    }
    
    const foodDetails = await nutritionixService.getFoodDetails(id, type as 'common' | 'branded');
    res.json(foodDetails);
  } catch (error) {
    console.error('Error getting food details:', error);
    res.status(500).json({ message: 'Failed to get food details' });
  }
});

/**
 * Generate a shopping list based on a meal plan
 */
router.post('/shopping-list', async (req, res) => {
  try {
    const { mealPlanItems } = req.body;
    
    if (!mealPlanItems || !Array.isArray(mealPlanItems)) {
      return res.status(400).json({ message: 'Meal plan items are required' });
    }
    
    const shoppingList = await nutritionixService.generateShoppingList(mealPlanItems);
    res.json(shoppingList);
  } catch (error) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({ message: 'Failed to generate shopping list' });
  }
});

/**
 * Suggest meal plans based on athlete's nutritional needs
 */
router.post('/suggest-meal-plan', async (req, res) => {
  try {
    const { calories, proteinTarget, carbTarget, fatTarget, dietaryPreferences } = req.body;
    
    if (!calories || !proteinTarget || !carbTarget || !fatTarget) {
      return res.status(400).json({ message: 'Nutritional targets are required' });
    }
    
    const mealPlan = await nutritionixService.suggestMealPlan(
      calories, 
      proteinTarget, 
      carbTarget, 
      fatTarget, 
      dietaryPreferences || []
    );
    
    res.json(mealPlan);
  } catch (error) {
    console.error('Error suggesting meal plan:', error);
    res.status(500).json({ message: 'Failed to suggest meal plan' });
  }
});

export default router;