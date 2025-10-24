import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Store } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';

export const RestaurantAnalyzer = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: credits } = useCookingCredits();

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-restaurant-menu-ai', {
        body: { restaurant_name: restaurantName, menu_image: menuImage }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast.success('Menu bolo úspešne analyzované!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Chyba pri analýze');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          Analyzátor reštauračného menu
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Názov reštaurácie</label>
            <Input
              placeholder="Zadaj názov reštaurácie..."
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Menu (voliteľné)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent transition-colors"
            >
              {menuImage ? (
                <img src={menuImage} alt="Menu" className="max-h-48 mx-auto" />
              ) : (
                <div>
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Pridaj fotku menu</p>
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
            {analyzeMutation.isPending ? 'Analyzujem...' : 'Analyzuj menu (2 kredity)'}
          </Button>
        </div>
      </Card>

      {analysis && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Analýza menu</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Odporúčania</h4>
              <p className="text-muted-foreground">{analysis.recommendations}</p>
            </div>
            {analysis.menu_items && (
              <div>
                <h4 className="font-semibold mb-2">Jedlá</h4>
                <div className="space-y-2">
                  {analysis.menu_items.map((item: any, idx: number) => (
                    <div key={idx} className="border-b pb-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.calories} kcal</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
