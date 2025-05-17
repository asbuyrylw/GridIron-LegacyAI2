import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Hook for searching foods using Nutritionix API
export function useNutritionSearch() {
  const [isSearching, setIsSearching] = useState(false);
  
  const searchFoods = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await apiRequest(`/api/nutrition/search?query=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.error("Error searching for foods:", error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };
  
  const getNutrients = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await apiRequest('/api/nutrition/nutrients', {
        method: 'POST',
        body: { query }
      });
      return response;
    } catch (error) {
      console.error("Error getting nutrients:", error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };
  
  return {
    searchFoods,
    getNutrients,
    isSearching
  };
}

// Hook for nutrition plan CRUD operations
export function useNutritionPlan(athleteId: number | undefined) {
  const queryClient = useQueryClient();
  
  // Fetch nutrition plan
  const { 
    data: nutritionPlan,
    isLoading: isLoadingNutritionPlan,
    refetch: refetchNutritionPlan 
  } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/nutrition-plan`],
    enabled: !!athleteId,
  });
  
  // Create nutrition plan
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest(`/api/athlete/${athleteId}/nutrition-plan`, {
        method: 'POST',
        body: planData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/nutrition-plan`] });
    }
  });
  
  // Update nutrition plan
  const updatePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest(`/api/athlete/${athleteId}/nutrition-plan/${planData.id}`, {
        method: 'PATCH',
        body: planData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/nutrition-plan`] });
    }
  });
  
  return {
    nutritionPlan,
    isLoadingNutritionPlan,
    refetchNutritionPlan,
    createPlanMutation,
    updatePlanMutation
  };
}

// Hook for meal logging
export function useMealLogging(athleteId: number | undefined) {
  const queryClient = useQueryClient();
  
  // Fetch meal logs
  const { 
    data: mealLogs,
    isLoading: isLoadingMealLogs 
  } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/meal-logs`],
    enabled: !!athleteId,
  });
  
  // Log a meal
  const logMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      return await apiRequest(`/api/athlete/${athleteId}/meal-logs`, {
        method: 'POST',
        body: mealData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/meal-logs`] });
    }
  });
  
  // Delete a meal log
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: number) => {
      return await apiRequest(`/api/athlete/${athleteId}/meal-logs/${mealId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/meal-logs`] });
    }
  });
  
  return {
    mealLogs,
    isLoadingMealLogs,
    logMealMutation,
    deleteMealMutation
  };
}

// Hook for shopping list generation
export function useShoppingList(athleteId: number | undefined) {
  const queryClient = useQueryClient();
  
  // Fetch shopping list
  const { 
    data: shoppingList,
    isLoading: isLoadingShoppingList 
  } = useQuery({
    queryKey: [`/api/athlete/${athleteId}/shopping-list`],
    enabled: !!athleteId,
  });
  
  // Generate shopping list
  const generateShoppingListMutation = useMutation({
    mutationFn: async (days: number) => {
      return await apiRequest(`/api/athlete/${athleteId}/shopping-list/generate`, {
        method: 'POST',
        body: { days }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/shopping-list`] });
    }
  });
  
  // Update shopping list item
  const updateShoppingListItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: number, updates: any }) => {
      return await apiRequest(`/api/athlete/${athleteId}/shopping-list/${itemId}`, {
        method: 'PATCH',
        body: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/athlete/${athleteId}/shopping-list`] });
    }
  });
  
  return {
    shoppingList,
    isLoadingShoppingList,
    generateShoppingListMutation,
    updateShoppingListItemMutation
  };
}