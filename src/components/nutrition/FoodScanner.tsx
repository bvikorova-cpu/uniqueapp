import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function FoodScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch today's scan count
  const { data: scanCounter } = useQuery({
    queryKey: ['daily-scans'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_scans_counter')
        .select('*')
        .eq('user_id', user.id)
        .eq('scan_date', today)
        .single();

      return data;
    }
  });

  const scanMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const { data, error } = await supabase.functions.invoke('scan-food', {
        body: { imageBase64 }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setScanResult(data.scan);
      toast.success("Food scanned successfully!");
    },
    onError: (error: any) => {
      console.error('Scan error:', error);
      toast.error(error.message || "Error scanning food");
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = () => {
    if (!image) {
      toast.error("Please upload an image first");
      return;
    }

    scanMutation.mutate(image);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Smart Food Scanner
          </CardTitle>
          <CardDescription>
            Scan food to get instant nutritional info
            <br />
            <span className="text-sm">Daily scans: {scanCounter?.scans_count || 0}/5 (Free tier)</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Food" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Click to upload food image</p>
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

          <Button
            onClick={handleScan}
            disabled={scanMutation.isPending || !image}
            className="w-full gap-2"
            size="lg"
          >
            {scanMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Scan Food
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Results</CardTitle>
          <CardDescription>
            {scanResult ? "Nutritional breakdown" : "Scan results will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scanResult ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{scanResult.food_name}</h3>
                <p className="text-2xl font-bold text-primary mt-2">{scanResult.calories} calories</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Macronutrients</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{scanResult.protein}g</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{scanResult.carbs}g</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{scanResult.fats}g</p>
                    <p className="text-sm text-muted-foreground">Fats</p>
                  </div>
                </div>
              </div>

              {scanResult.healthier_alternatives && scanResult.healthier_alternatives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Healthier Alternatives
                  </h4>
                  <div className="space-y-2">
                    {scanResult.healthier_alternatives.map((alt: any, idx: number) => (
                      <div key={idx} className="p-3 bg-green-500/10 rounded-lg">
                        <p className="font-medium">{alt.name}</p>
                        <p className="text-sm text-muted-foreground">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Upload and scan food to see results</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
