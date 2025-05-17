import { Router } from "express";
import { nutritionixService } from "../nutritionix-service";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// Food search endpoint
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.query as string;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    
    const results = await nutritionixService.searchFoods(query);
    res.json(results);
  } catch (error) {
    console.error("Error searching foods:", error);
    if (error.message === "Nutritionix API credentials are not configured") {
      return res.status(503).json({ 
        message: "Nutrition API temporarily unavailable. Please check API credentials."
      });
    }
    res.status(500).json({ 
      message: "Error searching foods",
      error: error.message 
    });
  }
});

// Nutrition data endpoint
router.post("/nutrients", async (req, res, next) => {
  try {
    const querySchema = z.object({
      query: z.string().min(1, "Query is required")
    });
    
    const validated = querySchema.parse(req.body);
    const results = await nutritionixService.getNutrients(validated.query);
    
    res.json(results);
  } catch (error) {
    console.error("Error getting nutrients:", error);
    
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: validationError.message
      });
    }
    
    if (error.message === "Nutritionix API credentials are not configured") {
      return res.status(503).json({ 
        message: "Nutrition API temporarily unavailable. Please check API credentials."
      });
    }
    
    res.status(500).json({ 
      message: "Error getting nutrients",
      error: error.message 
    });
  }
});

// Exercise data endpoint
router.post("/exercise", async (req, res, next) => {
  try {
    const exerciseSchema = z.object({
      query: z.string().min(1, "Query is required"),
      gender: z.string().optional(),
      weight_kg: z.number().positive().optional(),
      height_cm: z.number().positive().optional(),
      age: z.number().positive().optional()
    });
    
    const validated = exerciseSchema.parse(req.body);
    
    const results = await nutritionixService.getExercise(
      validated.query,
      validated.gender,
      validated.weight_kg,
      validated.height_cm,
      validated.age
    );
    
    res.json(results);
  } catch (error) {
    console.error("Error getting exercise data:", error);
    
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: validationError.message
      });
    }
    
    if (error.message === "Nutritionix API credentials are not configured") {
      return res.status(503).json({ 
        message: "Nutrition API temporarily unavailable. Please check API credentials."
      });
    }
    
    res.status(500).json({ 
      message: "Error getting exercise data",
      error: error.message 
    });
  }
});

// Shopping list generation endpoint
router.post("/shopping-list", async (req, res, next) => {
  try {
    const shoppingListSchema = z.object({
      mealPlanItems: z.array(
        z.object({
          food_name: z.string(),
          servings: z.number().positive()
        })
      ).min(1, "Meal plan items are required")
    });
    
    const validated = shoppingListSchema.parse(req.body);
    const shoppingList = await nutritionixService.generateShoppingList(validated.mealPlanItems);
    
    res.json(shoppingList);
  } catch (error) {
    console.error("Error generating shopping list:", error);
    
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: validationError.message
      });
    }
    
    res.status(500).json({ 
      message: "Error generating shopping list",
      error: error.message 
    });
  }
});

// Meal suggestions endpoint
router.post("/suggest-meal-plan", async (req, res, next) => {
  try {
    const mealPlanSchema = z.object({
      calories: z.number().positive(),
      proteinTarget: z.number().nonnegative(),
      carbTarget: z.number().nonnegative(),
      fatTarget: z.number().nonnegative(),
      dietaryPreferences: z.array(z.string()).optional()
    });
    
    const validated = mealPlanSchema.parse(req.body);
    
    const suggestions = await nutritionixService.suggestMealPlan(
      validated.calories,
      validated.proteinTarget,
      validated.carbTarget,
      validated.fatTarget,
      validated.dietaryPreferences || []
    );
    
    res.json(suggestions);
  } catch (error) {
    console.error("Error generating meal suggestions:", error);
    
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: validationError.message
      });
    }
    
    res.status(500).json({ 
      message: "Error generating meal suggestions",
      error: error.message 
    });
  }
});

export default router;