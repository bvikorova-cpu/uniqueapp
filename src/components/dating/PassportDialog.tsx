import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const POPULAR = ["New York", "London", "Paris", "Tokyo", "Bali", "Barcelona", "Berlin", "Dubai", "Sydney", "Mexico City"];

interface Props {
  open: boolean; onOpenChange: (v: boolean) => void;
  userId: string; current?: string | null;
  onSaved: (v: string | null) => void;
}

export const PassportDialog = ({ open, onOpenChange, userId, current, onSaved }: Props) => {
  const { toast } = useToast();
  const [city, setCity] = useState(current ?? "");
  const [saving, setSaving] = useState(false);

  const apply = async (loc: string | null) => {
    setSaving(true);
    const { error } = await supabase.from("dating_profiles")
      .update({ passport_location: loc }).eq("user_id", userId);
    setSaving(false);
    if (error) toast({ title: "Could not update", description: error.message, variant: "destructive" });
    else {
      toast({ title: loc ? `Passport set to ${loc}` : "Passport cleared" });
      onSaved(loc); onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-primary" /> Passport</DialogTitle>
          <DialogDescription>Match with people anywhere in the world. Useful before you travel.</DialogDescription>
        </DialogHeader>
        <Input placeholder="City (e.g. Tokyo)" value={city} onChange={(e) => setCity(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {POPULAR.map(c => (
            <Button key={c} variant="outline" size="sm" onClick={() => setCity(c)}>{c}</Button>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => apply(null)} disabled={saving}>Clear</Button>
          <Button onClick={() => apply(city.trim() || null)} disabled={saving || !city.trim()}>Set passport</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
