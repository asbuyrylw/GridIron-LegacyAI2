import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Loader2,
  Utensils,
  Plus
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FoodItem {
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

interface FoodSearchBoxProps {
  onSearch: (query: string) => Promise<any>;
  onFoodSelect: (food: FoodItem) => void;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function FoodSearchBox({ 
  onSearch, 
  onFoodSelect, 
  isLoading = false,
  fullWidth = false
}: FoodSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      const results = await onSearch(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching for food:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    onFoodSelect(food);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <div className="flex items-center gap-2">
        <div className={`relative flex items-center ${fullWidth ? 'w-full' : ''}`}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search foods (e.g., '2 eggs and toast')"
            className={`pr-10 ${fullWidth ? 'w-full' : ''}`}
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          Search
        </Button>
      </div>

      {showResults && searchResults && (
        <Card className="absolute z-50 w-full mt-1 p-2 shadow-lg max-h-80 overflow-hidden">
          <ScrollArea className="h-full max-h-80 pr-3">
            {searchResults.common?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Common Foods</h3>
                <ul className="space-y-2">
                  {searchResults.common.slice(0, 5).map((food: any, index: number) => (
                    <li 
                      key={`common-${index}`}
                      className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => handleFoodSelect({
                        food_name: food.food_name,
                        serving_qty: food.serving_qty,
                        serving_unit: food.serving_unit,
                        serving_weight_grams: 100, // default
                        nf_calories: 100, // placeholder - would get from API
                        nf_total_fat: 5,
                        nf_saturated_fat: 2,
                        nf_cholesterol: 0,
                        nf_sodium: 0,
                        nf_total_carbohydrate: 10,
                        nf_dietary_fiber: 2,
                        nf_sugars: 5,
                        nf_protein: 5,
                        nf_potassium: 0,
                        photo: {
                          thumb: food.photo?.thumb || "",
                          highres: ""
                        }
                      })}
                    >
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                        {food.photo?.thumb ? (
                          <img src={food.photo.thumb} alt={food.food_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{food.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.serving_qty} {food.serving_unit}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {searchResults.branded?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Branded Foods</h3>
                <ul className="space-y-2">
                  {searchResults.branded.slice(0, 5).map((food: any, index: number) => (
                    <li 
                      key={`branded-${index}`}
                      className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => handleFoodSelect({
                        food_name: food.food_name,
                        brand_name: food.brand_name,
                        serving_qty: food.serving_qty,
                        serving_unit: food.serving_unit,
                        serving_weight_grams: 100, // default
                        nf_calories: 100, // placeholder - would get from API
                        nf_total_fat: 5,
                        nf_saturated_fat: 2,
                        nf_cholesterol: 0,
                        nf_sodium: 0,
                        nf_total_carbohydrate: 10,
                        nf_dietary_fiber: 2,
                        nf_sugars: 5,
                        nf_protein: 5,
                        nf_potassium: 0,
                        photo: {
                          thumb: food.photo?.thumb || "",
                          highres: ""
                        }
                      })}
                    >
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                        {food.photo?.thumb ? (
                          <img src={food.photo.thumb} alt={food.food_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{food.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.brand_name} • {food.serving_qty} {food.serving_unit}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(!searchResults.common || searchResults.common.length === 0) && 
             (!searchResults.branded || searchResults.branded.length === 0) && (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">No results found for "{query}"</p>
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}