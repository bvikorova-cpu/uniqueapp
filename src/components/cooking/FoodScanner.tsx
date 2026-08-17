import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface FoodScanResult {
  name: string;
  calories: number | string;
  macros: {
    protein: number | string;
    carbs: number | string;
    fats: number | string;
  };
  description?: string;
  portion_g?: number | string;
  confidence?: number | string;
  fiber_g?: number | string;
  sugar_g?: number | string;
  saturated_fat_g?: number | string;
  sodium_mg?: number | string;
  glycemic_index?: string;
  health_score?: number | string;
  verdict?: string;
  ingredients?: Array<{ name: string; approx_g?: number; calories?: number; note?: string }>;
  micronutrients?: Array<{ name: string; amount?: string; percent_dv?: number }>;
  allergens?: string[];
  diet_tags?: string[];
  pros?: string[];
  cons?: string[];
  improvement_tips?: string[];
  meal_fit?: Record<string, string>;
  activity_equivalent?: Array<{ activity: string; minutes?: number }>;
  healthier_alternatives?: Array<{ name: string; reason?: string; calories?: number }>;
}

const displayValue = (value: unknown): number | string =>
  typeof value === 'number' || typeof value === 'string' ? value : '—';

const normalizeScanResult = (payload: unknown): FoodScanResult | null => {
  if (!payload || typeof payload !== 'object') return null;

  const response = payload as Record<string, unknown>;
  const candidate = response.result ?? response.data ?? response.analysis;
  if (!candidate || typeof candidate !== 'object') return null;

  const result = candidate as Record<string, unknown>;
  const rawMacros = result.macros;
  const macros = rawMacros && typeof rawMacros === 'object'
    ? rawMacros as Record<string, unknown>
    : {};

  return {
    name: String(result.food_name ?? result.name ?? 'Identified food'),
    calories: displayValue(result.calories),
    macros: {
      protein: displayValue(macros.protein ?? macros.p),
      carbs: displayValue(macros.carbs ?? macros.c),
      fats: displayValue(macros.fats ?? macros.f),
    },
    description: typeof result.description === 'string' ? result.description : undefined,
    portion_g: displayValue(result.portion_g),
    confidence: displayValue(result.confidence),
    fiber_g: displayValue(result.fiber_g),
    sugar_g: displayValue(result.sugar_g),
    saturated_fat_g: displayValue(result.saturated_fat_g),
    sodium_mg: displayValue(result.sodium_mg),
    glycemic_index: typeof result.glycemic_index === 'string' ? result.glycemic_index : undefined,
    health_score: displayValue(result.health_score),
    verdict: typeof result.verdict === 'string' ? result.verdict : undefined,
    ingredients: Array.isArray(result.ingredients) ? (result.ingredients as any[]) : [],
    micronutrients: Array.isArray(result.micronutrients) ? (result.micronutrients as any[]) : [],
    allergens: Array.isArray(result.allergens) ? (result.allergens as string[]) : [],
    diet_tags: Array.isArray(result.diet_tags) ? (result.diet_tags as string[]) : [],
    pros: Array.isArray(result.pros) ? (result.pros as string[]) : [],
    cons: Array.isArray(result.cons) ? (result.cons as string[]) : [],
    improvement_tips: Array.isArray(result.improvement_tips) ? (result.improvement_tips as string[]) : [],
    meal_fit: result.meal_fit && typeof result.meal_fit === 'object' ? (result.meal_fit as Record<string, string>) : undefined,
    activity_equivalent: Array.isArray(result.activity_equivalent) ? (result.activity_equivalent as any[]) : [],
    healthier_alternatives: Array.isArray(result.healthier_alternatives) ? (result.healthier_alternatives as any[]) : [],
  };
};

export const FoodScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: credits } = useCookingCredits();

  const scanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scan-food', {
        body: { image }
      });
      if (error) throw error;
      const normalized = normalizeScanResult(data);
      if (!normalized) throw new Error('The scanner returned an unreadable result. Please try again.');
      return normalized;
    },
    onSuccess: (data) => {
      setScanResult(data);
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
            disabled={!image || scanMutation.isPending || !credits || credits.credits < 3}
            className="w-full"
          >
            {scanMutation.isPending ? 'Scanning...' : 'Scan Food (3 credits)'}
          </Button>
        </div>
      </Card>

      {scanResult && (
        <Card className="p-4 sm:p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold">{scanResult.name}</h3>
            {scanResult.description && (
              <p className="text-sm text-muted-foreground mt-1">{scanResult.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {scanResult.portion_g !== '—' && <Badge variant="secondary">Portion ~{scanResult.portion_g} g</Badge>}
              {scanResult.glycemic_index && <Badge variant="secondary">GI: {scanResult.glycemic_index}</Badge>}
              {scanResult.health_score !== '—' && <Badge>Health score {scanResult.health_score}/100</Badge>}
              {scanResult.confidence !== '—' && <Badge variant="outline">Confidence {scanResult.confidence}%</Badge>}
              {scanResult.diet_tags?.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Calories', value: `${scanResult.calories} kcal` },
              { label: 'Protein', value: `${scanResult.macros?.protein} g` },
              { label: 'Carbs', value: `${scanResult.macros?.carbs} g` },
              { label: 'Fats', value: `${scanResult.macros?.fats} g` },
              { label: 'Fiber', value: `${scanResult.fiber_g} g` },
              { label: 'Sugar', value: `${scanResult.sugar_g} g` },
              { label: 'Saturated fat', value: `${scanResult.saturated_fat_g} g` },
              { label: 'Sodium', value: `${scanResult.sodium_mg} mg` },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border bg-muted/40 p-3 text-center">
                <p className="text-base font-bold break-words">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {scanResult.verdict && (
            <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">{scanResult.verdict}</p>
          )}

          {!!scanResult.ingredients?.length && (
            <div>
              <h4 className="font-semibold mb-2">Detected ingredients</h4>
              <ul className="space-y-2">
                {scanResult.ingredients.map((ing, i) => (
                  <li key={i} className="rounded-lg border p-3 text-sm">
                    <span className="font-medium">{ing.name}</span>
                    {ing.approx_g ? <span className="text-muted-foreground"> · ~{ing.approx_g} g</span> : null}
                    {ing.calories ? <span className="text-muted-foreground"> · {ing.calories} kcal</span> : null}
                    {ing.note ? <p className="text-xs text-muted-foreground mt-1">{ing.note}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!scanResult.micronutrients?.length && (
            <div>
              <h4 className="font-semibold mb-2">Vitamins &amp; minerals</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {scanResult.micronutrients.map((mn, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-2 text-sm gap-2">
                    <span className="break-words">{mn.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {mn.amount}{mn.percent_dv ? ` (${mn.percent_dv}% DV)` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!!scanResult.pros?.length || !!scanResult.cons?.length) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {!!scanResult.pros?.length && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
                  <h4 className="font-semibold text-sm mb-1">Strengths</h4>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                    {scanResult.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              {!!scanResult.cons?.length && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <h4 className="font-semibold text-sm mb-1">Watch out</h4>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                    {scanResult.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!!scanResult.improvement_tips?.length && (
            <div>
              <h4 className="font-semibold mb-2">How to make it healthier</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                {scanResult.improvement_tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {scanResult.meal_fit && (
            <div>
              <h4 className="font-semibold mb-2">Meal fit</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(scanResult.meal_fit).map(([k, v]) => (
                  <Badge key={k} variant="outline">{k.replace('_', ' ')}: {v}</Badge>
                ))}
              </div>
            </div>
          )}

          {!!scanResult.activity_equivalent?.length && (
            <div>
              <h4 className="font-semibold mb-2">Burn it off</h4>
              <div className="flex flex-wrap gap-2">
                {scanResult.activity_equivalent.map((a, i) => (
                  <Badge key={i} variant="secondary">{a.activity}: {a.minutes} min</Badge>
                ))}
              </div>
            </div>
          )}

          {!!scanResult.allergens?.length && (
            <div>
              <h4 className="font-semibold mb-2">Possible allergens</h4>
              <div className="flex flex-wrap gap-2">
                {scanResult.allergens.map((a) => <Badge key={a} variant="destructive">{a}</Badge>)}
              </div>
            </div>
          )}

          {!!scanResult.healthier_alternatives?.length && (
            <div>
              <h4 className="font-semibold mb-2">Healthier alternatives</h4>
              <ul className="space-y-2">
                {scanResult.healthier_alternatives.map((alt, i) => (
                  <li key={i} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      {alt.name}{alt.calories ? <span className="text-muted-foreground"> · {alt.calories} kcal</span> : null}
                    </p>
                    {alt.reason && <p className="text-xs text-muted-foreground mt-1">{alt.reason}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

    </div>
    </>
    );
};
