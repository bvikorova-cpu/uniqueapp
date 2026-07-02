import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export interface DatingFilters {
  min_age: number;
  max_age: number;
  max_distance_km: number;
  preferred_genders: string[];
  verified_only: boolean;
}

const DEFAULT: DatingFilters = {
  min_age: 18, max_age: 60, max_distance_km: 100,
  preferred_genders: ["male", "female", "other"],
  verified_only: false,
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onSaved?: (f: DatingFilters) => void;
}

export const FiltersDialog = ({ open, onOpenChange, userId, onSaved }: Props) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<DatingFilters>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    supabase.from("dating_filters").select("*").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (data) setFilters({
          min_age: data.min_age, max_age: data.max_age,
          max_distance_km: data.max_distance_km,
          preferred_genders: data.preferred_genders,
          verified_only: data.verified_only,
        });
        setLoading(false);
      });
  }, [open, userId]);

  const toggleGender = (g: string) => {
    setFilters(f => ({
      ...f,
      preferred_genders: f.preferred_genders.includes(g)
        ? f.preferred_genders.filter(x => x !== g)
        : [...f.preferred_genders, g],
    }));
  };

  const save = async () => {
    if (filters.preferred_genders.length === 0) {
      toast({ title: "Select at least one gender", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("dating_filters").upsert({
      user_id: userId, ...filters,
    });
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Filters saved" });
    onSaved?.(filters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FloatingHowItWorks
        title={"Filters Dialog"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Discovery Filters</DialogTitle></DialogHeader>
        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="space-y-6 py-2">
            <div>
              <Label className="text-sm font-medium">Age range: {filters.min_age}–{filters.max_age}</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <span className="text-xs text-muted-foreground">Min: {filters.min_age}</span>
                  <Slider value={[filters.min_age]} min={18} max={99} step={1}
                    onValueChange={([v]) => setFilters(f => ({ ...f, min_age: Math.min(v, f.max_age) }))} />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Max: {filters.max_age}</span>
                  <Slider value={[filters.max_age]} min={18} max={99} step={1}
                    onValueChange={([v]) => setFilters(f => ({ ...f, max_age: Math.max(v, f.min_age) }))} />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Max distance: {filters.max_distance_km} km</Label>
              <Slider value={[filters.max_distance_km]} min={5} max={500} step={5}
                onValueChange={([v]) => setFilters(f => ({ ...f, max_distance_km: v }))}
                className="mt-2" />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Show me</Label>
              <div className="flex flex-wrap gap-2">
                {[["male", "Men"], ["female", "Women"], ["other", "Other"]].map(([v, l]) => (
                  <Badge key={v} variant={filters.preferred_genders.includes(v) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleGender(v)}>{l}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="verified" className="text-sm font-medium">Verified profiles only</Label>
              <Switch id="verified" checked={filters.verified_only}
                onCheckedChange={(v) => setFilters(f => ({ ...f, verified_only: v }))} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
