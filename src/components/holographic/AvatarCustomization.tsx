import { useEffect, useState } from "react";
import { ArrowLeft, Palette, Sparkles, Loader2, Wand2, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useHolographicCredits, HOLO_COSTS } from "@/hooks/useHolographicCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface AvatarRow {
  id: string;
  name: string;
  style: string | null;
  traits: string[] | null;
  image_url: string | null;
}

const RESTYLE_COST = HOLO_COSTS.pack_basic;

const STYLES = [
  { id: "cyber", name: "Cyberpunk", emoji: "🤖" },
  { id: "mystic", name: "Mystic", emoji: "🔮" },
  { id: "cosmic", name: "Cosmic", emoji: "🌌" },
  { id: "nature", name: "Bio-Organic", emoji: "🌿" },
  { id: "crystal", name: "Crystal", emoji: "💎" },
  { id: "shadow", name: "Shadow", emoji: "🌑" },
];

const OUTFITS = [
  "futuristic armored suit",
  "flowing ceremonial robe",
  "streetwear jacket with neon trims",
  "elegant royal attire",
  "battle-worn explorer gear",
  "minimal light-woven bodysuit",
];

const ACCESSORIES = [
  "glowing halo crown",
  "holographic wings",
  "energy visor",
  "floating orbs",
  "ancient amulet",
  "none",
];

export const AvatarCustomization = ({ onBack }: Props) => {
  const [avatars, setAvatars] = useState<AvatarRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [outfit, setOutfit] = useState<string>("");
  const [accessory, setAccessory] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ name: string; imageUrl: string } | null>(null);
  const { toast } = useToast();
  const { balance, spend } = useHolographicCredits();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoadingList(false); return; }
        const { data } = await supabase
          .from("holographic_avatars")
          .select("id,name,style,traits,image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setAvatars((data ?? []) as AvatarRow[]);
      } finally { setLoadingList(false); }
    })();
  }, []);

  const selected = avatars.find(a => a.id === selectedId);

  const handleRestyle = async () => {
    if (!selected || !style || !outfit) {
      toast({ title: "Missing info", description: "Pick an avatar, a style and an outfit.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const paid = await spend(RESTYLE_COST, "avatar_restyle");
      if (!paid) return;

      const { data, error } = await supabase.functions.invoke("holographic-battle-simulate", {
        body: {
          mode: "avatar_image",
          name: selected.name,
          style,
          traits: selected.traits ?? [],
          outfit,
          accessory: accessory && accessory !== "none" ? accessory : undefined,
        },
      });
      if (error || !data?.imageUrl) throw new Error(error?.message || data?.error || "No image returned");

      setResult({ name: selected.name, imageUrl: data.imageUrl });
      if (data.avatar) setAvatars(prev => [data.avatar as AvatarRow, ...prev]);
      toast({ title: "New look ready!", description: `Saved to My Avatars — ${RESTYLE_COST} credits used.` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Restyle failed. Please try again.", variant: "destructive" });
    } finally { setGenerating(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Avatar Restyle'
        steps={[
          { title: 'Pick an avatar', desc: 'Choose one of your saved holographic avatars.' },
          { title: 'Choose the look', desc: 'Select a new visual style, an outfit and an optional accessory.' },
          { title: 'Generate', desc: `Spend ${RESTYLE_COST} credits — the AI renders a brand new version of your avatar.` },
          { title: 'Keep it', desc: 'The new look is saved in My Avatars and can be downloaded.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Avatar Restyle</h2>
          <p className="text-sm text-muted-foreground">Give a saved avatar a brand new look</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Your balance: <strong className="text-foreground">{balance} credits</strong></p>

      {loadingList ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : avatars.length === 0 ? (
        <Card><CardContent className="p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">You don't have any avatars yet. Create one first in Avatar Creator.</p>
          <Button variant="outline" onClick={onBack}>Back to tools</Button>
        </CardContent></Card>
      ) : (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="text-sm font-bold mb-3 block flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" /> Your avatar</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {avatars.map(a => (
                  <button key={a.id} onClick={() => setSelectedId(a.id)}
                    className={`rounded-xl border-2 p-2 text-center transition-all ${selectedId === a.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                    {a.image_url ? (
                      <img src={a.image_url} alt={`Avatar ${a.name}`} className="w-full aspect-square object-cover rounded-lg mb-1" loading="lazy" />
                    ) : <div className="w-full aspect-square rounded-lg bg-muted mb-1" />}
                    <p className="text-xs font-semibold truncate">{a.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-3 block flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> New style</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLES.map(s => (
                  <motion.button key={s.id} whileTap={{ scale: 0.97 }} onClick={() => setStyle(s.id)}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${style === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                    <span className="text-2xl block">{s.emoji}</span>
                    <p className="text-xs font-bold mt-1">{s.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-3 block flex items-center gap-2"><Shirt className="w-4 h-4 text-primary" /> Outfit</label>
              <div className="flex flex-wrap gap-2">
                {OUTFITS.map(o => (
                  <button key={o} onClick={() => setOutfit(o)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${outfit === o ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-3 block flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Accessory (optional)</label>
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map(a => (
                  <button key={a} onClick={() => setAccessory(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${accessory === a ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleRestyle} disabled={generating || !selectedId || !style || !outfit} className="w-full" size="lg">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {`Generate new look — ${RESTYLE_COST} credits`}
            </Button>
          </CardContent>
        </Card>
      )}

      {generating && (
        <Card className="border-primary/20"><CardContent className="p-6 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Rendering the new look…</p>
        </CardContent></Card>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-black text-lg">{result.name} — new look</h3>
              <img src={result.imageUrl} alt={`Restyled avatar ${result.name}`} className="w-full max-w-sm mx-auto rounded-2xl border border-primary/20 shadow-lg" loading="lazy" />
              <Button asChild variant="outline" className="w-full">
                <a href={result.imageUrl} download={`${result.name}-restyle.png`} target="_blank" rel="noreferrer">Download image</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
