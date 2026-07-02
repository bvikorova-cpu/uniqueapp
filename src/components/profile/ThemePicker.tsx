import { Palette, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const THEMES = [
  { id: "amber",   label: "Gold",     class: "from-amber-400 to-orange-500" },
  { id: "violet",  label: "Royal",    class: "from-violet-500 to-fuchsia-500" },
  { id: "emerald", label: "Forest",   class: "from-emerald-400 to-teal-500" },
  { id: "rose",    label: "Sunset",   class: "from-rose-400 to-pink-500" },
  { id: "cyan",    label: "Ocean",    class: "from-cyan-400 to-blue-500" },
  { id: "white",   label: "Mono",     class: "from-zinc-300 to-zinc-500" },
];

interface ThemePickerProps {
  userId: string;
  current?: string | null;
}

export const ThemePicker = ({ userId, current }: ThemePickerProps) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(current || "amber");
  const [saving, setSaving] = useState(false);

  const save = async (theme: string) => {
    setSaving(true);
    setSelected(theme);
    const { error } = await supabase.from("profiles").update({ theme_color: theme }).eq("id", userId);
    setSaving(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Theme saved" });
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Theme Picker - How it works"} steps={[{ title: 'Open', desc: 'Access the Theme Picker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Theme Picker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="bg-card/80 backdrop-blur-md border-amber-400/30">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card/95 backdrop-blur-xl border-amber-400/30">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300/80 mb-3">Profile theme</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              disabled={saving}
              onClick={() => save(t.id)}
              className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-border hover:ring-amber-400 transition-all hover:scale-105"
              title={t.label}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${t.class}`} />
              {selected === t.id && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-lg" />
              )}
              <span className="absolute bottom-1 left-0 right-0 text-[9px] font-bold text-white text-center drop-shadow">{t.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
    </>
  );
};
