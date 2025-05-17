import axios from 'axios';

interface NutritionixConfig {
  appId: string;
  apiKey: string;
  baseUrl: string;
}

interface NutritionixSearchResponse {
  common: any[];
  branded: any[];
}

interface NutritionixNutrientsResponse {
  foods: any[];
}

class NutritionixService {
  private config: NutritionixConfig;

  constructor() {
    // Initialize with environment variables
    this.config = {
      appId: process.env.NUTRITIONIX_APP_ID || '',
      apiKey: process.env.NUTRITIONIX_API_KEY || '',
      baseUrl: 'https://trackapi.nutritionix.com/v2'
    };
  }

  /**
   * Search for foods by natural language query
   * @param query - Natural language query like "1 apple and 2 bananas"
   */
  async searchFoods(query: string): Promise<NutritionixSearchResponse> {
    try {
      if (!this.config.appId || !this.config.apiKey) {
        throw new Error("Nutritionix API credentials are not configured");
      }

      const response = await axios.get(`${this.config.baseUrl}/search/instant`, {
        params: {
          query
        },
        headers: {
          'x-app-id': this.config.appId,
          'x-app-key': this.config.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error searching foods: ${error.message}`);
      if (error.response) {
        console.error(`Nutritionix API error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Get detailed nutrition information from natural language query
   * @param query - Natural language query like "1 apple and 2 bananas"
   */
  async getNutrients(query: string): Promise<NutritionixNutrientsResponse> {
    try {
      if (!this.config.appId || !this.config.apiKey) {
        throw new Error("Nutritionix API credentials are not configured");
      }

      const response = await axios.post(
        `${this.config.baseUrl}/natural/nutrients`,
        { query },
        {
          headers: {
            'x-app-id': this.config.appId,
            'x-app-key': this.config.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error getting nutrients: ${error.message}`);
      if (error.response) {
        console.error(`Nutritionix API error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Search for exercise information by natural language query
   * @param query - Natural language query like "ran 3 miles"
   * @param gender - User's gender (optional)
   * @param weight_kg - User's weight in kg (optional)
   * @param height_cm - User's height in cm (optional)
   * @param age - User's age (optional)
   */
  async getExercise(
    query: string,
    gender?: string,
    weight_kg?: number,
    height_cm?: number,
    age?: number
  ): Promise<any> {
    try {
      if (!this.config.appId || !this.config.apiKey) {
        throw new Error("Nutritionix API credentials are not configured");
      }

      const payload: any = { query };
      
      // Add optional parameters if provided
      if (gender) payload.gender = gender;
      if (weight_kg) payload.weight_kg = weight_kg;
      if (height_cm) payload.height_cm = height_cm;
      if (age) payload.age = age;

      const response = await axios.post(
        `${this.config.baseUrl}/natural/exercise`,
        payload,
        {
          headers: {
            'x-app-id': this.config.appId,
            'x-app-key': this.config.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error getting exercise data: ${error.message}`);
      if (error.response) {
        console.error(`Nutritionix API error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Generate a shopping list based on a meal plan
   * @param mealPlanItems - List of foods from the meal plan
   */
  async generateShoppingList(mealPlanItems: { food_name: string; servings: number }[]): Promise<any> {
    try {
      // Simulate shopping list generation since Nutritionix doesn't have a direct endpoint for this
      // In a real application, this would use Nutritionix data to build proper shopping lists
      
      // Extract unique ingredients from meal plan items
      const ingredients = mealPlanItems.map(item => item.food_name);
      
      // Group by basic food categories (simplified for demo)
      const categories: Record<string, { name: string; quantity: number; unit: string; category: string }[]> = {
        "produce": [],
        "proteins": [],
        "grains": [],
        "dairy": [],
        "spices": [],
        "other": []
      };
      
      // Categorize items (very basic logic for demo)
      ingredients.forEach(ingredient => {
        let category = "other";
        let unit = "item";
        let quantity = 1;
        
        // Very simplified categorization
        if (/apple|banana|berr|fruit|vegetable|lettuce|spinach|kale|carrot|tomato|potato|onion|garlic|pepper|corn/.test(ingredient.toLowerCase())) {
          category = "produce";
        } else if (/chicken|beef|fish|salmon|tuna|tofu|seitan|turkey|meat|steak|pork|lamb/.test(ingredient.toLowerCase())) {
          category = "proteins";
        } else if (/rice|bread|pasta|oat|cereal|grain|quinoa|flour|wheat|rye|barley/.test(ingredient.toLowerCase())) {
          category = "grains";
        } else if (/milk|cheese|yogurt|cream|butter|dairy/.test(ingredient.toLowerCase())) {
          category = "dairy";
        } else if (/salt|pepper|spice|herb|oregano|basil|thyme|cinnamon|cumin|paprika/.test(ingredient.toLowerCase())) {
          category = "spices";
        }
        
        // Quantity and unit guessing (simplified for demo)
        if (/milk|water|juice|oil/.test(ingredient.toLowerCase())) {
          unit = "cup";
        } else if (/spice|salt|pepper|powder/.test(ingredient.toLowerCase())) {
          unit = "tsp";
          quantity = 2;
        } else if (/rice|grain|sugar|flour/.test(ingredient.toLowerCase())) {
          unit = "cup";
          quantity = 1.5;
        }
        
        categories[category].push({
          name: ingredient,
          quantity,
          unit,
          category
        });
      });
      
      // Flatten into a single items array
      const items = Object.values(categories).flat();
      
      return {
        items,
        categories
      };
    } catch (error) {
      console.error(`Error generating shopping list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate meal suggestions based on nutritional requirements and preferences
   * @param calories - Target daily calories
   * @param proteinTarget - Target protein in grams
   * @param carbTarget - Target carbs in grams
   * @param fatTarget - Target fat in grams
   * @param preferences - Array of dietary preferences like "vegetarian", "high-protein", etc.
   */
  async suggestMealPlan(
    calories: number,
    proteinTarget: number,
    carbTarget: number,
    fatTarget: number,
    preferences: string[] = []
  ): Promise<any> {
    try {
      // This is a simplified demo version that doesn't use the real API
      // In a real implementation, you might use Nutritionix data combined with OpenAI
      // to generate personalized meal plans
      
      // Basic meal plan template with macros
      const breakfastOptions = [
        {
          name: "Greek Yogurt Protein Bowl",
          calories: 420,
          protein: 32,
          carbs: 45,
          fat: 12,
          mealType: "breakfast",
          ingredients: ["Greek yogurt", "Protein powder", "Granola", "Mixed berries", "Honey"],
          preparationTime: 5
        },
        {
          name: "Veggie Protein Omelette",
          calories: 380,
          protein: 28,
          carbs: 20,
          fat: 22,
          mealType: "breakfast",
          ingredients: ["Eggs", "Bell peppers", "Spinach", "Mushrooms", "Cheddar cheese", "Olive oil"],
          preparationTime: 15
        },
        {
          name: "Whole Grain Protein Pancakes",
          calories: 450,
          protein: 25,
          carbs: 60,
          fat: 15,
          mealType: "breakfast",
          ingredients: ["Whole wheat flour", "Protein powder", "Eggs", "Milk", "Maple syrup", "Banana"],
          preparationTime: 20
        }
      ];
      
      const lunchOptions = [
        {
          name: "Grilled Chicken & Quinoa Salad",
          calories: 580,
          protein: 42,
          carbs: 65,
          fat: 18,
          mealType: "lunch",
          ingredients: ["Chicken breast", "Quinoa", "Mixed greens", "Cherry tomatoes", "Olive oil", "Lemon"],
          preparationTime: 25
        },
        {
          name: "Tuna & White Bean Wrap",
          calories: 540,
          protein: 35,
          carbs: 55,
          fat: 22,
          mealType: "lunch",
          ingredients: ["Tuna", "White beans", "Whole wheat wrap", "Greek yogurt", "Lettuce", "Tomato"],
          preparationTime: 10
        },
        {
          name: "Turkey & Avocado Sandwich",
          calories: 520,
          protein: 30,
          carbs: 45,
          fat: 25,
          mealType: "lunch",
          ingredients: ["Turkey breast", "Whole grain bread", "Avocado", "Spinach", "Tomato", "Mustard"],
          preparationTime: 10
        }
      ];
      
      const dinnerOptions = [
        {
          name: "Baked Salmon with Sweet Potato",
          calories: 650,
          protein: 38,
          carbs: 40,
          fat: 25,
          mealType: "dinner",
          ingredients: ["Salmon fillet", "Sweet potato", "Asparagus", "Olive oil", "Herbs"],
          preparationTime: 30
        },
        {
          name: "Lean Beef Stir Fry",
          calories: 620,
          protein: 45,
          carbs: 50,
          fat: 20,
          mealType: "dinner",
          ingredients: ["Lean beef", "Brown rice", "Broccoli", "Bell peppers", "Soy sauce", "Ginger"],
          preparationTime: 25
        },
        {
          name: "Vegetarian Chickpea Curry",
          calories: 580,
          protein: 22,
          carbs: 70,
          fat: 22,
          mealType: "dinner",
          ingredients: ["Chickpeas", "Coconut milk", "Tomatoes", "Spinach", "Curry powder", "Brown rice"],
          preparationTime: 35
        }
      ];
      
      // Filter based on preferences (simplified)
      let filteredBreakfast = [...breakfastOptions];
      let filteredLunch = [...lunchOptions];
      let filteredDinner = [...dinnerOptions];
      
      if (preferences.includes("vegetarian")) {
        filteredBreakfast = filteredBreakfast.filter(meal => 
          !meal.ingredients.some(ing => 
            /chicken|beef|fish|salmon|tuna|turkey|meat|steak|pork|lamb/.test(ing.toLowerCase())
          )
        );
        
        filteredLunch = filteredLunch.filter(meal => 
          !meal.ingredients.some(ing => 
            /chicken|beef|fish|salmon|tuna|turkey|meat|steak|pork|lamb/.test(ing.toLowerCase())
          )
        );
        
        filteredDinner = filteredDinner.filter(meal => 
          !meal.ingredients.some(ing => 
            /chicken|beef|fish|salmon|tuna|turkey|meat|steak|pork|lamb/.test(ing.toLowerCase())
          )
        );
      }
      
      if (preferences.includes("high-protein")) {
        filteredBreakfast.sort((a, b) => b.protein - a.protein);
        filteredLunch.sort((a, b) => b.protein - a.protein);
        filteredDinner.sort((a, b) => b.protein - a.protein);
      }
      
      if (preferences.includes("low-carb")) {
        filteredBreakfast.sort((a, b) => a.carbs - b.carbs);
        filteredLunch.sort((a, b) => a.carbs - b.carbs);
        filteredDinner.sort((a, b) => a.carbs - b.carbs);
      }
      
      if (preferences.includes("quick-prep")) {
        filteredBreakfast.sort((a, b) => a.preparationTime - b.preparationTime);
        filteredLunch.sort((a, b) => a.preparationTime - b.preparationTime);
        filteredDinner.sort((a, b) => a.preparationTime - b.preparationTime);
      }
      
      // If we have no options after filtering, use the originals
      if (filteredBreakfast.length === 0) filteredBreakfast = breakfastOptions;
      if (filteredLunch.length === 0) filteredLunch = lunchOptions;
      if (filteredDinner.length === 0) filteredDinner = dinnerOptions;
      
      // Get the top options
      const suggestedMeals = [
        filteredBreakfast[0],
        filteredLunch[0],
        filteredDinner[0]
      ];
      
      return suggestedMeals;
    } catch (error) {
      console.error(`Error suggesting meal plan: ${error.message}`);
      throw error;
    }
  }
}

export const nutritionixService = new NutritionixService();