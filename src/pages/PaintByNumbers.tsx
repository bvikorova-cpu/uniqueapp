import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Palette, Lock, CheckCircle2, Coins } from "lucide-react";
import { usePaintByNumbers, useUserPaintPurchases, useUserPaintProgress, usePurchasePaint } from "@/hooks/usePaintByNumbers";

export default function PaintByNumbers() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  
  const { data: paintings, isLoading } = usePaintByNumbers(category);
  const { data: purchases } = useUserPaintPurchases();
  const purchasePaint = usePurchasePaint();

  const isPurchased = (paintId: string) => {
    return purchases?.some(p => p.paint_id === paintId);
  };

  const handlePaintingClick = (paintId: string, price: number) => {
    if (isPurchased(paintId)) {
      navigate(`/kids-channel/paint/${paintId}`);
    } else {
      purchasePaint.mutate({ paintId, price });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      "all": "All",
      "fairy-tales": "Fairy Tales",
      "animals": "Animals",
      "nature": "Nature",
      "vehicles": "Vehicles",
    };
    return labels[cat] || cat;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading paintings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/kids-channel")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <Palette className="h-8 w-8" />
                Paint by Numbers
              </h1>
              <p className="text-muted-foreground mt-1">
                Color beautiful pictures by matching numbers to colors!
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={setCategory} className="mb-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="fairy-tales">Fairy Tales</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="nature">Nature</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Paintings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paintings?.map((painting) => {
            const purchased = isPurchased(painting.id);
            
            return (
              <Card key={painting.id} className="overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <Palette className="h-20 w-20 text-primary opacity-20" />
                  
                  {/* Difficulty Badge */}
                  <Badge className={`absolute top-2 left-2 ${getDifficultyColor(painting.difficulty)}`}>
                    {painting.difficulty}
                  </Badge>

                  {/* Purchased/Locked Badge */}
                  {purchased ? (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2 bg-gray-500">
                      <Lock className="h-4 w-4 mr-1" />
                      {painting.price_coins}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{painting.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{getCategoryLabel(painting.category)}</span>
                    <span>{painting.total_sections} sections</span>
                  </div>

                  <Button
                    onClick={() => handlePaintingClick(painting.id, painting.price_coins)}
                    className="w-full"
                    disabled={purchasePaint.isPending}
                  >
                    {purchased ? (
                      <>
                        <Palette className="mr-2 h-4 w-4" />
                        Start Painting
                      </>
                    ) : (
                      <>
                        <Coins className="mr-2 h-4 w-4" />
                        Unlock for {painting.price_coins} coins
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
