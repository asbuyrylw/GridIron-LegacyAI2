import axios from 'axios';

const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2';

export interface NutritionixSearchResult {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat: number;
  nf_cholesterol: number;
  nf_sodium: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber: number;
  nf_sugars: number;
  nf_protein: number;
  nf_potassium: number;
  photo: {
    thumb: string;
    highres: string;
  };
}

export interface NutritionixNaturalResponse {
  foods: NutritionixSearchResult[];
}

interface NutritionixCommonFood {
  food_name: string;
  serving_unit: string;
  tag_name: string;
  serving_qty: number;
  common_type: number;
  tag_id: string;
  photo: {
    thumb: string;
  };
}

interface NutritionixBrandedFood {
  food_name: string;
  brand_name: string;
  serving_qty: number;
  serving_unit: string;
  nix_brand_id: string;
  nix_item_id: string;
  photo: {
    thumb: string;
  };
}

export interface NutritionixSearchResponse {
  common: NutritionixCommonFood[];
  branded: NutritionixBrandedFood[];
}

export class NutritionixService {
  private appId: string;
  private apiKey: string;

  constructor() {
    this.appId = process.env.NUTRITIONIX_APP_ID || '';
    this.apiKey = process.env.NUTRITIONIX_API_KEY || '';
    
    if (!this.appId || !this.apiKey) {
      console.warn('Nutritionix API credentials not found. Food search functionality will be limited.');
    }
  }
  
  private getHeaders() {
    return {
      'x-app-id': this.appId,
      'x-app-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }
  
  // Search for foods with natural language
  async searchFoodByNaturalLanguage(query: string): Promise<NutritionixNaturalResponse> {
    try {
      const response = await axios.post(
        `${NUTRITIONIX_API_URL}/natural/nutrients`,
        { query },
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error searching foods by natural language:', error);
      throw new Error('Failed to search foods using natural language');
    }
  }
  
  // Search foods by keyword
  async searchFoodByKeyword(query: string): Promise<NutritionixSearchResponse> {
    try {
      const response = await axios.get(
        `${NUTRITIONIX_API_URL}/search/instant`,
        { 
          params: { query },
          headers: this.getHeaders() 
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error searching foods by keyword:', error);
      throw new Error('Failed to search foods by keyword');
    }
  }
  
  // Get full nutrition information for a food
  async getFoodDetails(id: string, type: 'common' | 'branded'): Promise<NutritionixSearchResult> {
    try {
      let endpoint = type === 'common' 
        ? '/natural/nutrients' 
        : '/search/item';
      
      const data = type === 'common' 
        ? { query: id } 
        : { nix_item_id: id };
      
      const response = await axios.post(
        `${NUTRITIONIX_API_URL}${endpoint}`,
        data,
        { headers: this.getHeaders() }
      );
      
      return type === 'common' ? response.data.foods[0] : response.data;
    } catch (error) {
      console.error('Error getting food details:', error);
      throw new Error('Failed to get food details');
    }
  }
  
  // Generate shopping list based on meal plan
  async generateShoppingList(mealPlanItems: Array<{food_name: string, servings: number}>): Promise<any> {
    // This is where we would calculate shopping quantities based on meal plan
    // For now, we'll return a simple list
    try {
      const foodNames = mealPlanItems.map(item => item.food_name);
      const uniqueFoodNames = Array.from(new Set(foodNames));
      
      const shoppingItems = [];
      
      for (const foodName of uniqueFoodNames) {
        const servingsTotal = mealPlanItems
          .filter(item => item.food_name === foodName)
          .reduce((sum, item) => sum + item.servings, 0);
          
        const searchResult = await this.searchFoodByNaturalLanguage(foodName);
        if (searchResult.foods && searchResult.foods.length > 0) {
          const food = searchResult.foods[0];
          shoppingItems.push({
            name: food.food_name,
            quantity: food.serving_qty * servingsTotal,
            unit: food.serving_unit,
            category: this.getCategoryForFood(food.food_name)
          });
        }
      }
      
      return {
        items: shoppingItems,
        categories: this.groupItemsByCategory(shoppingItems)
      };
    } catch (error) {
      console.error('Error generating shopping list:', error);
      throw new Error('Failed to generate shopping list');
    }
  }
  
  // Helper method to categorize food items
  private getCategoryForFood(foodName: string): string {
    const categories = {
      proteins: ['chicken', 'beef', 'fish', 'pork', 'turkey', 'eggs', 'tofu', 'milk', 'yogurt', 'cheese'],
      fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'peach', 'pear'],
      vegetables: ['spinach', 'kale', 'broccoli', 'carrot', 'potato', 'onion', 'tomato', 'cucumber', 'lettuce'],
      grains: ['bread', 'rice', 'pasta', 'cereal', 'oats', 'quinoa', 'barley'],
      other: []
    };
    
    const foodNameLower = foodName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => foodNameLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }
  
  // Group shopping list items by category
  private groupItemsByCategory(items: Array<{name: string, quantity: number, unit: string, category: string}>) {
    return items.reduce((grouped, item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
      return grouped;
    }, {} as Record<string, Array<{name: string, quantity: number, unit: string, category: string}>>);
  }
  
  // Suggest meal plans based on athlete's needs
  async suggestMealPlan(
    calories: number, 
    proteinTarget: number, 
    carbTarget: number, 
    fatTarget: number,
    dietaryPreferences: string[] = []
  ) {
    // This would connect to Nutritionix to build recommended meal plans
    // For now, we'll return a template meal plan
    return {
      breakfast: [
        { name: "Oatmeal with banana and honey", calories: 350, protein: 10, carbs: 60, fat: 5 },
        { name: "Protein smoothie with berries", calories: 300, protein: 25, carbs: 30, fat: 5 },
        { name: "Scrambled eggs with whole grain toast", calories: 400, protein: 20, carbs: 30, fat: 15 }
      ],
      lunch: [
        { name: "Grilled chicken salad", calories: 450, protein: 35, carbs: 30, fat: 15 },
        { name: "Turkey and avocado sandwich", calories: 500, protein: 30, carbs: 40, fat: 20 },
        { name: "Quinoa bowl with vegetables", calories: 400, protein: 15, carbs: 60, fat: 10 }
      ],
      dinner: [
        { name: "Salmon with sweet potatoes", calories: 550, protein: 40, carbs: 45, fat: 20 },
        { name: "Lean beef stir fry with brown rice", calories: 600, protein: 40, carbs: 60, fat: 15 },
        { name: "Chicken pasta with vegetables", calories: 650, protein: 35, carbs: 80, fat: 10 }
      ],
      snacks: [
        { name: "Greek yogurt with berries", calories: 200, protein: 15, carbs: 15, fat: 5 },
        { name: "Protein bar", calories: 250, protein: 20, carbs: 25, fat: 8 },
        { name: "Apple with almond butter", calories: 250, protein: 8, carbs: 25, fat: 12 },
        { name: "Hard-boiled eggs", calories: 140, protein: 12, carbs: 0, fat: 10 }
      ]
    };
  }
}

export const nutritionixService = new NutritionixService();