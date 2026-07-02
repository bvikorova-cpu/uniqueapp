import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const FoodScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: credits } = useCookingCredits();

  const scanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scan-food-ai', {
        body: { image }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setScanResult(data.analysis);
      toast.success('Food scanned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error scanning food');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Food Scanner works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          Food Scanner
        </h2>
        
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors"
          >
            {image ? (
              <img src={image} alt="Food" className="max-h-64 mx-auto" />
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Click to upload food photo</p>
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
            onClick={() => scanMutation.mutate()}
            disabled={!image || scanMutation.isPending || !credits || credits.credits < 1}
            className="w-full"
          >
            {scanMutation.isPending ? 'Scanning...' : 'Scan Food (1 credit)'}
          </Button>
        </div>
      </Card>

      {scanResult && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
          <div className="space-y-3">
            <p><strong>Name:</strong> {scanResult.name}</p>
            <p><strong>Calories:</strong> {scanResult.calories} kcal</p>
            <div>
              <strong>Macros:</strong>
              <div className="mt-1 text-sm text-muted-foreground">
                <p>Protein: {scanResult.macros?.protein}g</p>
                <p>Carbs: {scanResult.macros?.carbs}g</p>
                <p>Fats: {scanResult.macros?.fats}g</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
    </>
    );
};
