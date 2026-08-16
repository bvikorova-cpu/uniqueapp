import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Store } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const RestaurantAnalyzer = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: credits } = useCookingCredits();

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scan-food', {
        body: { mode: 'menu', restaurantName, imageBase64: menuImage }
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast.success('Menu analyzed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error analyzing menu');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // Downscale before sending so the edge request payload stays small.
      const img = new Image();
      img.onload = () => {
        const max = 1024;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { setMenuImage(reader.result as string); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setMenuImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => setMenuImage(reader.result as string);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };


  return (
    <>
      <FloatingHowItWorks title="How Restaurant Analyzer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          Restaurant Menu Analyzer
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Restaurant name</label>
            <Input
              placeholder="Enter restaurant name..."
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Menu (optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent transition-colors"
            >
              {menuImage ? (
                <img src={menuImage} alt="Menu" className="max-h-48 mx-auto" />
              ) : (
                <div>
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Add menu photo</p>
                </div>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={!restaurantName || analyzeMutation.isPending || !credits || credits.credits < 2}
            className="w-full"
          >
            {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Menu (2 credits)'}
          </Button>
        </div>
      </Card>

      {analysis && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Menu Analysis</h3>
          <div className="space-y-4">
            {analysis.top_recommendations && analysis.top_recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Top Recommendations</h4>
                <div className="space-y-2">
                  {analysis.top_recommendations.map((item: any, idx: number) => (
                    <div key={idx} className="border-b pb-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                      <p className="text-sm">{item.calories} kcal</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.items_to_avoid && analysis.items_to_avoid.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">Items to Consider</h4>
                <div className="space-y-2">
                  {analysis.items_to_avoid.map((item: any, idx: number) => (
                    <div key={idx} className="border-b pb-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
    </>
    );
};
