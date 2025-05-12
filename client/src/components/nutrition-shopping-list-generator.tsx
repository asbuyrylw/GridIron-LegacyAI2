import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Plus, Trash, Send, Loader2, RefreshCw } from "lucide-react";

interface NutritionShoppingListGeneratorProps {
  athleteId: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  selected: boolean;
}

interface ParentAccess {
  id: number;
  email: string;
  name: string;
  relationship: string;
  active: boolean;
  receiveNutritionInfo: boolean;
}

// Categories for the shopping list
const CATEGORIES = [
  "Proteins",
  "Carbohydrates",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Healthy Fats",
  "Snacks",
  "Beverages",
  "Supplements",
  "Other",
];

export function NutritionShoppingListGenerator({ athleteId }: NutritionShoppingListGeneratorProps) {
  const { toast } = useToast();
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", category: CATEGORIES[0], quantity: "" });
  const [selectAll, setSelectAll] = useState(true);
  
  // Get parent access list to see who can receive lists
  const { data: parentAccesses, isLoading: loadingParents } = useQuery<ParentAccess[]>({
    queryKey: ["/api/athlete", athleteId, "parent-access"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/athlete/${athleteId}/parent-access`);
      return response.json();
    }
  });
  
  // Get nutritional recommendations based on athlete's plan
  const { data: recommendations, isLoading: loadingRecommendations, refetch: refetchRecommendations } = useQuery({
    queryKey: ["/api/athlete", athleteId, "nutrition/recommendations"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/athlete/${athleteId}/nutrition/recommendations`);
      return response.json();
    }
  });
  
  // Handle recommendations data when it changes
  React.useEffect(() => {
    if (recommendations && shoppingItems.length === 0 && recommendations.items && recommendations.items.length > 0) {
      setShoppingItems(
        recommendations.items.map((item: any, index: number) => ({
          id: `rec-${index}`,
          name: item.name,
          category: item.category,
          quantity: item.quantity || "",
          selected: true,
        }))
      );
    }
  }, [recommendations, shoppingItems.length]);
  
  // Send shopping list to parents
  const sendShoppingListMutation = useMutation({
    mutationFn: async () => {
      const selectedItems = shoppingItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        throw new Error("Please select at least one item to include in the shopping list.");
      }
      
      const response = await apiRequest(
        "POST", 
        `/api/athlete/${athleteId}/nutrition/shopping-list`,
        { items: selectedItems }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Shopping list sent",
        description: "The nutrition shopping list has been sent to parents.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send shopping list",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add a new item to the shopping list
  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast({
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }
    
    setShoppingItems([
      ...shoppingItems,
      {
        id: `custom-${Date.now()}`,
        name: newItem.name.trim(),
        category: newItem.category,
        quantity: newItem.quantity.trim(),
        selected: true,
      },
    ]);
    
    // Reset the form
    setNewItem({ name: "", category: CATEGORIES[0], quantity: "" });
  };
  
  // Remove an item from the shopping list
  const handleRemoveItem = (id: string) => {
    setShoppingItems(shoppingItems.filter(item => item.id !== id));
  };
  
  // Toggle item selection
  const handleToggleItemSelection = (id: string) => {
    setShoppingItems(
      shoppingItems.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  // Toggle all items selection
  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    setShoppingItems(
      shoppingItems.map(item => ({ ...item, selected: !selectAll }))
    );
  };
  
  // Regenerate recommendations
  const handleRegenerateRecommendations = async () => {
    await refetchRecommendations();
    toast({
      description: "Nutrition recommendations refreshed",
    });
  };
  
  // Generate list of eligible parents who can receive shopping lists
  const eligibleParents = parentAccesses?.filter(
    parent => parent.active && parent.receiveNutritionInfo
  ) || [];
  
  // Group items by category
  const groupedItems = shoppingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Nutrition Shopping List
        </CardTitle>
        <CardDescription>
          Create and send shopping lists based on nutrition plan to parents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Parent recipients */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recipients</h3>
          {loadingParents ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading parent access...
            </div>
          ) : eligibleParents.length > 0 ? (
            <div className="max-h-36 overflow-y-auto border rounded-md p-2">
              {eligibleParents.map(parent => (
                <div key={parent.id} className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-sm font-medium">{parent.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({parent.relationship})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{parent.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                No parents configured to receive nutrition information. 
                Update parent settings to enable nutrition updates.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Shopping lists are delivered directly to parents via email - no login required.
              </p>
            </div>
          )}
        </div>
        
        {/* Add new item form */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-medium">Add Items</h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <Label htmlFor="itemName" className="sr-only">Item Name</Label>
              <Input 
                id="itemName" 
                placeholder="Item name" 
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="itemCategory" className="sr-only">Category</Label>
              <Select 
                value={newItem.category} 
                onValueChange={value => setNewItem({ ...newItem, category: value })}
              >
                <SelectTrigger id="itemCategory">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemQuantity" className="sr-only">Quantity</Label>
              <Input 
                id="itemQuantity" 
                placeholder="Quantity (e.g. 2 lbs)" 
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
              />
            </div>
            <div>
              <Button 
                type="button" 
                onClick={handleAddItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRegenerateRecommendations}
              disabled={loadingRecommendations}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingRecommendations ? 'animate-spin' : ''}`} />
              Refresh Recommendations
            </Button>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectAll}
                onCheckedChange={handleToggleSelectAll}
              />
              <Label htmlFor="selectAll" className="text-sm">Select All</Label>
            </div>
          </div>
        </div>
        
        {/* Shopping list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Shopping List</h3>
            <span className="text-xs text-muted-foreground">
              {shoppingItems.filter(item => item.selected).length} items selected
            </span>
          </div>
          
          {shoppingItems.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {loadingRecommendations 
                  ? "Loading recommended items..." 
                  : "No items added to the shopping list yet"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-3">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-medium text-primary mb-2">{category}</h4>
                    <Table>
                      <TableBody>
                        {items.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="w-10">
                              <Checkbox
                                checked={item.selected}
                                onCheckedChange={() => handleToggleItemSelection(item.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="w-10 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                className="h-7 w-7"
                              >
                                <Trash className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => sendShoppingListMutation.mutate()}
          disabled={sendShoppingListMutation.isPending || shoppingItems.filter(item => item.selected).length === 0 || eligibleParents.length === 0}
        >
          {sendShoppingListMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Shopping List to Parents
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}