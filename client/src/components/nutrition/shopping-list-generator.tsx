import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingBag, 
  Download, 
  RefreshCw, 
  Check, 
  Plus, 
  Trash2, 
  Printer, 
  Mail, 
  Copy, 
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MealLog {
  id: number;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
}

interface NutritionPlan {
  id: number;
  dailyCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked?: boolean;
}

interface ShoppingListGeneratorProps {
  mealLogs: MealLog[];
  nutritionPlan: NutritionPlan;
  athleteId: number;
}

export function ShoppingListGenerator({ 
  mealLogs, 
  nutritionPlan, 
  athleteId 
}: ShoppingListGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [shoppingList, setShoppingList] = useState<{
    items: ShoppingItem[];
    categories: Record<string, ShoppingItem[]>;
  } | null>(null);
  const [emailSharing, setEmailSharing] = useState(false);
  
  const generateShoppingList = useMutation({
    mutationFn: async () => {
      // Format the meal logs into the required format
      const mealPlanItems = mealLogs.map(meal => ({
        food_name: meal.name,
        servings: meal.servingSize
      }));
      
      const response = await apiRequest("/api/nutrition/shopping-list", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mealPlanItems })
      });
      
      // Parse the response
      return await response.json();
    },
    onSuccess: (data) => {
      setShoppingList(data);
      setActiveTab("list");
      toast({
        title: "Shopping List Generated",
        description: "Your shopping list has been created based on your meal plan.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your shopping list. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const sendEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest(`/api/athlete/${athleteId}/email/shopping-list`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          shoppingList: shoppingList?.items || []
        })
      });
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Shopping list has been sent to the specified email.",
      });
      setEmailSharing(false);
    },
    onError: () => {
      toast({
        title: "Email Failed",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const toggleItemCheck = (index: number) => {
    if (!shoppingList) return;
    
    const updatedItems = [...shoppingList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      checked: !updatedItems[index].checked
    };
    
    // Rebuild the categories
    const updatedCategories: Record<string, ShoppingItem[]> = {};
    for (const cat in shoppingList.categories) {
      updatedCategories[cat] = shoppingList.categories[cat].map(item => {
        const foundItem = updatedItems.find(i => i.name === item.name);
        return foundItem || item;
      });
    }
    
    setShoppingList({
      items: updatedItems,
      categories: updatedCategories
    });
  };
  
  const copyToClipboard = () => {
    if (!shoppingList) return;
    
    const text = shoppingList.items
      .map(item => `${item.name} - ${item.quantity} ${item.unit}`)
      .join("\n");
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied",
          description: "Shopping list copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard.",
          variant: "destructive",
        });
      });
  };
  
  const printList = () => {
    const printContent = document.getElementById('shopping-list-print');
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    printWindow.document.write('<html><head><title>Shopping List</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 15px; }
      h2 { font-size: 16px; margin-top: 15px; margin-bottom: 10px; }
      ul { padding-left: 20px; }
      li { margin-bottom: 5px; }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Shopping List</h1>');
    
    if (shoppingList) {
      Object.entries(shoppingList.categories).forEach(([category, items]) => {
        printWindow.document.write(`<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>`);
        printWindow.document.write('<ul>');
        items.forEach(item => {
          printWindow.document.write(`<li>${item.name} - ${item.quantity} ${item.unit}</li>`);
        });
        printWindow.document.write('</ul>');
      });
    }
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    // Print and close
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
          Shopping List Generator
        </CardTitle>
        <CardDescription>
          Create a grocery list based on your meal plan
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full px-6">
          <TabsTrigger value="generate">Generate List</TabsTrigger>
          <TabsTrigger value="list">View List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="p-6 pt-4">
          <div className="space-y-4">
            <p className="text-sm">
              Generate a shopping list based on your meal plan. The list will include all ingredients needed for your currently logged meals.
            </p>
            
            <div className="rounded-md border p-4 bg-muted/40">
              <h3 className="font-medium mb-2">Shopping List Will Include:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                  All ingredients from your meal logs
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                  Categorized by food groups
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                  Estimated quantities based on your meal plan
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                  Shareable with parents or guardians
                </li>
              </ul>
            </div>
            
            <div className="font-medium text-sm">
              {mealLogs.length} meal{mealLogs.length !== 1 ? 's' : ''} will be used to generate your list
            </div>
            
            <Button 
              onClick={() => generateShoppingList.mutate()}
              disabled={mealLogs.length === 0 || generateShoppingList.isPending}
              className="w-full"
            >
              {generateShoppingList.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Shopping List
                </>
              )}
            </Button>
            
            {mealLogs.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center">
                You need to log some meals first before generating a shopping list
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="px-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Your Shopping List</h3>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Email Shopping List</DialogTitle>
                      <DialogDescription>
                        Send this shopping list to your email or a parent/guardian
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm mb-4">
                        The shopping list will be sent to the email associated with your account.
                      </p>
                      <div className="flex justify-center">
                        <Button
                          onClick={() => sendEmailMutation.mutate("parent@example.com")}
                          disabled={sendEmailMutation.isPending}
                        >
                          {sendEmailMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={printList}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="px-6 pb-6" id="shopping-list-print">
            {!shoppingList ? (
              generateShoppingList.isPending ? (
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No shopping list generated yet
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("generate")}
                  >
                    Generate Shopping List
                  </Button>
                </div>
              )
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(shoppingList.categories).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="font-medium mb-3 capitalize">
                        {category}
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item, i) => {
                          const itemIndex = shoppingList.items.findIndex(
                            listItem => listItem.name === item.name
                          );
                          return (
                            <li key={`${category}-${i}`} className="flex items-center">
                              <Checkbox 
                                id={`item-${category}-${i}`}
                                checked={item.checked}
                                onCheckedChange={() => toggleItemCheck(itemIndex)}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`item-${category}-${i}`}
                                className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {item.name} - {item.quantity} {item.unit}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {shoppingList && (
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("generate")}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <div className="text-sm text-muted-foreground">
                {shoppingList.items.length} items total
              </div>
            </CardFooter>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}