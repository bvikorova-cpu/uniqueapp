import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2, Camera, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

export default function RestaurantAnalyzer() {
  const { credits } = useAICredits();
  const [restaurantName, setRestaurantName] = useState("");
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-restaurant-menu', {
        body: {
          restaurantName,
          menuImageBase64: menuImage
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast.success("Menu analyzed successfully!");
    },
    onError: (error: any) => {
      console.error('Analysis error:', error);
      toast.error(error.message || "Error analyzing menu");
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!restaurantName) {
      toast.error("Please enter restaurant name");
      return;
    }

    if (!credits || credits.credits_remaining < 25) {
      toast.error('You need 25 credits to analyze a menu');
      return;
    }

    analyzeMutation.mutate();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Restaurant Intelligence
          </CardTitle>
          <CardDescription>
            AI analyzes restaurant menus and recommends healthy options (25 credits)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant Name *</Label>
            <Input
              id="restaurant"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. Pizza Hut, McDonald's"
            />
          </div>

          <div className="space-y-2">
            <Label>Menu Image (optional)</Label>
            <div
              className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {menuImage ? (
                <img src={menuImage} alt="Menu" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center space-y-2">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload menu photo</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || !restaurantName}
            className="w-full gap-2"
            size="lg"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Store className="h-5 w-5" />
                Analyze Menu (25 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            {analysis ? "Recommendations and nutritional info" : "Analysis will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">{analysis.restaurant_name}</h3>
              </div>

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Top Recommendations
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-3 bg-yellow-500/10 rounded-lg">
                        <p className="font-medium">{rec.dishName}</p>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        {rec.calories && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            {rec.calories} calories
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.analysis_data && analysis.analysis_data.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">All Dishes</h4>
                  <div className="space-y-1">
                    {analysis.analysis_data.slice(0, 10).map((dish: any, idx: number) => (
                      <div key={idx} className="p-2 bg-muted rounded text-sm">
                        <p className="font-medium">{dish.name}</p>
                        <p className="text-muted-foreground">
                          ~{dish.estimatedCalories} cal | Health: {dish.healthScore}/10
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center space-y-2">
                <Store className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Enter restaurant name to analyze</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
