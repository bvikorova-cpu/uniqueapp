import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, Camera, Wand2, Loader2, Download, RefreshCw, Coins, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STYLES: Array<{ id: string; label: string; emoji: string }> = [
  { id: "cartoon", label: "Cartoon", emoji: "🎨" },
  { id: "watercolor", label: "Watercolor", emoji: "💧" },
  { id: "pixar", label: "Pixar 3D", emoji: "✨" },
  { id: "anime", label: "Anime", emoji: "🌸" },
  { id: "storybook", label: "Storybook", emoji: "📖" },
  { id: "pencil", label: "Colored Pencil", emoji: "✏️" },
  { id: "comic", label: "Comic", emoji: "💥" },
  { id: "oil", label: "Oil Paint", emoji: "🖼️" },
  { id: "pixel", label: "Pixel Art", emoji: "👾" },
  { id: "neon", label: "Neon Glow", emoji: "💡" },
];

const MAX_BYTES = 6 * 1024 * 1024;

interface Props {
  balance: number;
  onCreditsChanged: () => void;
  onBuyCredits: () => void;
}

export const SketchEnhancer = ({ balance, onCreditsChanged, onBuyCredits }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [sketch, setSketch] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("cartoon");
  const [loading, setLoading] = useState(false);
  const [enhanced, setEnhanced] = useState<string | null>(null);

  const COST = 4;
  const canRun = balance >= COST;

  const onFile = (f?: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("Image is too big — max 6MB");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      setSketch(r.result as string);
      setEnhanced(null);
    };
    r.readAsDataURL(f);
  };

  const enhance = async () => {
    if (!sketch) { toast.error("Add your sketch first"); return; }
    if (!canRun) { toast.error(`Need ${COST} credits — you have ${balance}`); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kids-drawing-enhance", {
        body: { sketchBase64: sketch, description, style },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEnhanced(data.enhanced as string);
      onCreditsChanged();
      toast.success("Your art is ready! ✨");
    } catch (e: any) {
      toast.error(e?.message ?? "Enhancement failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!enhanced) return;
    const a = document.createElement("a");
    a.href = enhanced;
    a.download = `my-art-${style}.png`;
    a.click();
  };

  return (
    <>
      <FloatingHowItWorks title={"Sketch Enhancer - How it works"} steps={[{ title: 'Open', desc: 'Access the Sketch Enhancer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Sketch Enhancer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
          <span className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Magic Polish — Sketch → Art
          </span>
          <Badge variant="outline" className="text-xs">{COST} credits</Badge>
        </CardTitle>
        <CardDescription>
          Upload or snap your drawing, pick a style, and watch AI transform it into polished art.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sketch input */}
        {!sketch ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-24 flex-col gap-2">
              <Upload className="h-6 w-6" /> Upload sketch
            </Button>
            <Button variant="outline" onClick={() => cameraRef.current?.click()} className="h-24 flex-col gap-2">
              <Camera className="h-6 w-6" /> Take photo
            </Button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
        ) : (
          <div className="relative">
            <img src={sketch} alt="Your sketch" className="w-full rounded-lg border max-h-64 object-contain bg-muted" />
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => { setSketch(null); setEnhanced(null); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            What is it? (optional, helps AI)
          </label>
          <Input
            placeholder="e.g. A dragon flying over a castle"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={240}
            disabled={loading}
          />
        </div>

        {/* Style picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Pick a style</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                disabled={loading}
                className={`rounded-lg border p-2 text-xs font-medium transition ${
                  style === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-lg">{s.emoji}</div>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Run / buy */}
        {canRun ? (
          <Button onClick={enhance} disabled={loading || !sketch} className="w-full">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Painting your masterpiece…</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Polish my drawing ({COST} credits)</>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Need {COST} credits — you have {balance}
            </p>
            <Button onClick={onBuyCredits} className="w-full">
              <Coins className="mr-2 h-4 w-4" /> Buy Drawing credits
            </Button>
          </div>
        )}

        {/* Result */}
        {enhanced && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Your polished art
            </p>
            <img src={enhanced} alt="Enhanced art" className="w-full rounded-lg border" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={download}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" onClick={enhance} disabled={loading || !canRun}>
                <RefreshCw className="mr-2 h-4 w-4" /> Try another style
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
