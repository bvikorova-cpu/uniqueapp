import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  ChefHat, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check,
  Share2,
  Download,
  Clock,
  Users
} from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
  category: string;
}

interface Recipe {
  id: string;
  name: string;
  servings: number;
  prepTime: string;
  ingredients: Ingredient[];
}

const defaultRecipe: Recipe = {
  id: "1",
  name: "Spaghetti Carbonara",
  servings: 4,
  prepTime: "30 min",
  ingredients: [
    { id: "1", name: "Spaghetti", amount: "400g", checked: false, category: "Pasta" },
    { id: "2", name: "Bacon", amount: "200g", checked: false, category: "Meat" },
    { id: "3", name: "Eggs", amount: "4 pcs", checked: false, category: "Dairy" },
    { id: "4", name: "Parmesan", amount: "100g", checked: false, category: "Dairy" },
    { id: "5", name: "Black pepper", amount: "to taste", checked: false, category: "Spices" },
    { id: "6", name: "Salt", amount: "to taste", checked: false, category: "Spices" },
    { id: "7", name: "Garlic", amount: "2 cloves", checked: false, category: "Vegetables" },
  ],
};

export const ShoppingList = () => {
  const [recipe, setRecipe] = useState(defaultRecipe);
  const [newItem, setNewItem] = useState("");
  const [servings, setServings] = useState(recipe.servings);

  const checkedCount = recipe.ingredients.filter(i => i.checked).length;
  const progress = (checkedCount / recipe.ingredients.length) * 100;

  const toggleIngredient = (id: string) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(i =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    });
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setRecipe({
      ...recipe,
      ingredients: [
        ...recipe.ingredients,
        {
          id: Date.now().toString(),
          name: newItem,
          amount: "",
          checked: false,
          category: "Other",
        },
      ],
    });
    setNewItem("");
  };

  const removeItem = (id: string) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter(i => i.id !== id),
    });
  };

  // Group by category
  const groupedIngredients = recipe.ingredients.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <>
      <FloatingHowItWorks title="How Shopping List works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      {/* Recipe Header */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-orange-500" />
                {recipe.name}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {servings} servings
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prepTime}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={async () => {
                const text = `${recipe.name}\n\n` + (recipe.ingredients || []).map((i: any) => `• ${i.name || i}`).join("\n");
                try {
                  if (navigator.share) await navigator.share({ title: recipe.name, text });
                  else { await navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); }
                } catch {}
              }}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => {
                const text = `${recipe.name}\n\n` + (recipe.ingredients || []).map((i: any) => `• ${i.name || i}`).join("\n");
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${recipe.name}-shopping-list.txt`;
                document.body.appendChild(a); a.click(); a.remove();
                URL.revokeObjectURL(url);
                toast.success("Downloaded");
              }}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Servings Adjuster */}
          <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
            <span className="text-sm">Servings:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setServings(Math.max(1, servings - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center font-bold">{servings}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setServings(servings + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Purchased</span>
            <span className="font-medium">{checkedCount}/{recipe.ingredients.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedIngredients).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((ingredient) => (
                  <motion.div
                    key={ingredient.id}
                    layout
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      ingredient.checked ? "bg-green-500/10" : "bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={ingredient.checked}
                      onCheckedChange={() => toggleIngredient(ingredient.id)}
                    />
                    <div className="flex-1">
                      <p className={ingredient.checked ? "line-through text-muted-foreground" : ""}>
                        {ingredient.name}
                      </p>
                    </div>
                    <Badge variant="outline">{ingredient.amount}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(ingredient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {/* Add Item */}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Add item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <Button onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};

export default ShoppingList;
