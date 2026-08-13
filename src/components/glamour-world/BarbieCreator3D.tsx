import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Download, Camera, Loader2, User, Shirt, Gem } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DollIllustration } from "./DollIllustration";
import { ACCESSORY_STYLES, HAIR_STYLES, OUTFIT_STYLES } from "./dollAssets";

// Color palettes — [hex, human-readable name for the AI render]
const SKIN_COLORS: [string, string][] = [
  ["#F7D9C4", "fair porcelain"],
  ["#EFC094", "light warm"],
  ["#D69F72", "golden tan"],
  ["#A9714B", "deep bronze"],
  ["#7A4A28", "rich brown"],
  ["#4A2B18", "deep ebony"],
];
const HAIR_COLORS: [string, string][] = [
  ["#2B1B12", "jet black"],
  ["#6B3E1E", "chestnut brown"],
  ["#E4C071", "golden blonde"],
  ["#F5A7C4", "pastel pink"],
  ["#D8D8DE", "platinum silver"],
  ["#B4441F", "copper red"],
  ["#6B3FA0", "violet"],
  ["#2F6FB5", "sapphire blue"],
];
const DRESS_COLORS: [string, string][] = [
  ["#FF69B4", "hot pink"],
  ["#E5175F", "crimson rose"],
  ["#B762D6", "orchid purple"],
  ["#2E5FD1", "royal blue"],
  ["#12A594", "emerald teal"],
  ["#E9C46A", "champagne gold"],
  ["#F5F3EE", "ivory white"],
  ["#1B1B22", "midnight black"],
];
const SHOE_COLORS: [string, string][] = [
  ["#FF69B4", "pink"],
  ["#E5175F", "red"],
  ["#E9C46A", "gold"],
  ["#D8D8DE", "silver"],
  ["#1B1B22", "black"],
  ["#F5F3EE", "nude ivory"],
];

const DRESS_STYLES = OUTFIT_STYLES;
const ACCESSORIES = ACCESSORY_STYLES;
const SCENES = ["Studio", "Runway", "Ballroom", "Garden", "City"];

interface BarbieConfig {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  dressColor: string;
  dressStyle: string;
  shoeColor: string;
  accessory: string;
}

const nameOf = (list: [string, string][], hex: string) =>
  list.find(([h]) => h === hex)?.[1] ?? "custom";


const defaultConfig: BarbieConfig = {
  skinColor: SKIN_COLORS[0][0],
  hairColor: HAIR_COLORS[3][0],
  hairStyle: HAIR_STYLES[1],
  dressColor: DRESS_COLORS[0][0],
  dressStyle: "Ball Gown",
  shoeColor: SHOE_COLORS[0][0],
  accessory: "Tiara",
};

type Step = "look" | "dress" | "accessories";

interface ColorSwatchProps {
  label: string;
  colors: [string, string][];
  selected: string;
  onSelect: (c: string) => void;
}

function ColorSwatch({ label, colors, selected, onSelect }: ColorSwatchProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">{label}</p>
      <div className="grid grid-cols-6 gap-2">
        {colors.map(([hex, name]) => (
          <button
            key={hex}
            title={name}
            aria-label={name}
            onClick={() => onSelect(hex)}
            className={cn(
              "aspect-square rounded-xl border-2 transition-all hover:scale-105",
              selected === hex
                ? "border-pink-500 ring-2 ring-pink-300 scale-105"
                : "border-white/60 shadow-sm"
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  );
}

interface StyleCardProps {
  options: string[];
  selected: string;
  onSelect: (s: string) => void;
  emoji?: (s: string) => string;
}

function StyleCard({ options, selected, onSelect, emoji }: StyleCardProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-xs font-semibold transition-all hover:scale-[1.02]",
            selected === o
              ? "border-pink-500 bg-gradient-to-br from-pink-50 to-fuchsia-50 text-pink-700 shadow-md"
              : "border-pink-200/60 bg-white/70 text-foreground hover:border-pink-300"
          )}
        >
          <span className="text-lg">{emoji ? emoji(o) : "✨"}</span>
          <span className="text-center leading-tight">{o}</span>
          {selected === o && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const hairEmoji = (s: string) =>
  ({
    "Long Straight": "💇",
    "Long Wavy": "🌊",
    Bob: "💇‍♀️",
    Ponytail: "🎀",
    Bun: "🍥",
    Curly: "🌀",
  }[s] ?? "✨");

const dressEmoji = (s: string) =>
  ({
    "Ball Gown": "👗",
    "Mini Dress": "🎽",
    Mermaid: "🧜",
    "A-Line": "👘",
    Jumpsuit: "🩱",
    "Casual Jeans": "👖",
    "Skirt & Blouse": "👚",
    Sporty: "🏃‍♀️",
  }[s] ?? "✨");

const accessoryEmoji = (s: string) =>
  ({ None: "🚫", Tiara: "👑", Necklace: "📿", Sunglasses: "🕶️", Handbag: "👜" }[s] ?? "✨");

const sceneEmoji = (s: string) =>
  ({ Studio: "📸", Runway: "🪩", Ballroom: "🏰", Garden: "🌸", City: "🌃" }[s] ?? "✨");

export function BarbieCreator3D({ onBack }: { onBack: () => void }) {
  const [config, setConfig] = useState<BarbieConfig>(defaultConfig);
  const [scene, setScene] = useState("Studio");
  const [rendering, setRendering] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("look");

  const update = (key: keyof BarbieConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const renderRealistic = async () => {
    setRendering(true);
    try {
      const { data, error } = await supabase.functions.invoke("glamour-doll-render", {
        body: {
          skinTone: nameOf(SKIN_COLORS, config.skinColor),
          hairColor: nameOf(HAIR_COLORS, config.hairColor),
          hairStyle: config.hairStyle,
          dressColor: nameOf(DRESS_COLORS, config.dressColor),
          dressStyle: config.dressStyle,
          shoeColor: nameOf(SHOE_COLORS, config.shoeColor),
          accessory: config.accessory,
          scene,
        },
      });

      if (error) {
        const ctx = (error as { context?: Response }).context;
        let msg = error.message;
        let status: number | undefined;
        if (ctx && typeof ctx.json === "function") {
          status = ctx.status;
          try {
            const payload = await ctx.clone().json();
            msg = payload?.message || payload?.error || msg;
          } catch { /* keep generic */ }
        }
        if (status === 402) throw new Error(msg || "You need 3 AI credits for a realistic render.");
        if (status === 429) throw new Error("AI is busy right now — try again in a few seconds.");
        throw new Error(msg || "Render failed");
      }
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");

      setRenderUrl(data.imageUrl);
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success("Realistic doll photo ready! ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Render failed");
    } finally {
      setRendering(false);
    }
  };

  const downloadRender = () => {
    if (!renderUrl) return;
    const a = document.createElement("a");
    a.href = renderUrl;
    a.download = `my-doll-${Date.now()}.png`;
    a.click();
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "look", label: "Choose Look", icon: <User className="h-4 w-4" /> },
    { key: "dress", label: "Dress Up", icon: <Shirt className="h-4 w-4" /> },
    { key: "accessories", label: "Accessorize", icon: <Gem className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <FloatingHowItWorks
        title="3D Doll Creator — How it works"
        steps={[
          { title: "Choose Look", desc: "Pick skin tone, hair color and hairstyle for your doll." },
          { title: "Dress Up", desc: "Select a dress style, color and matching shoes." },
          { title: "Accessorize", desc: "Add a tiara, necklace or bag and choose a photo scene." },
          { title: "Render", desc: "Tap Realistic Photo (3 AI credits) to create a fashion shot." },
        ]}
      />

      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="rounded-3xl border border-pink-300/30 bg-gradient-to-br from-pink-50/80 via-white/90 to-fuchsia-50/80 p-4 shadow-xl backdrop-blur-sm dark:from-pink-950/30 dark:to-fuchsia-950/30">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-pink-700">👸 My Doll</h2>
            <p className="text-sm text-pink-600/70">Design your dream fashion doll step by step</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setConfig(defaultConfig); setRenderUrl(null); }}
            className="border-pink-300/50"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: 3D preview */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border-4 border-white/60 bg-gradient-to-b from-pink-100 to-purple-100 shadow-inner dark:from-pink-950/30 dark:to-purple-950/30 h-[420px] lg:h-[560px]">
              {renderUrl ? (
                <>
                  <img src={renderUrl} alt="Photorealistic render of your custom doll" className="h-full w-full object-contain" />
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <Button size="sm" className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={downloadRender}>
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setRenderUrl(null)}>
                      Back to sketch
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <DollIllustration look={config} />
                </div>
              )}

              {rendering && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                  <p className="text-sm font-semibold">Rendering your realistic doll…</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">

              <Button
                size="sm"
                onClick={renderRealistic}
                disabled={rendering}
                className="flex-[2] bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-bold"
              >
                {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                Realistic Photo · 3 credits
              </Button>
            </div>
          </div>

          {/* Right: step tabs + options */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-pink-300/30 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:bg-black/20">
              {/* Step tabs */}
              <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-pink-100/50 p-1.5 dark:bg-pink-950/20">
                {steps.map((s, idx) => (
                  <button
                    key={s.key}
                    onClick={() => setStep(s.key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-all sm:text-sm",
                      step === s.key
                        ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md"
                        : "text-pink-700/70 hover:bg-pink-200/40 dark:text-pink-300/70"
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.icon}</span>
                  </button>
                ))}
              </div>

              {/* Step content */}
              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 lg:max-h-[480px]">
                {step === "look" && (
                  <>
                    <ColorSwatch
                      label="Skin Tone"
                      colors={SKIN_COLORS}
                      selected={config.skinColor}
                      onSelect={(c) => update("skinColor", c)}
                    />
                    <ColorSwatch
                      label="Hair Color"
                      colors={HAIR_COLORS}
                      selected={config.hairColor}
                      onSelect={(c) => update("hairColor", c)}
                    />
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Hair Style</p>
                      <StyleCard
                        options={HAIR_STYLES}
                        selected={config.hairStyle}
                        onSelect={(s) => update("hairStyle", s)}
                        emoji={hairEmoji}
                      />
                    </div>
                  </>
                )}

                {step === "dress" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Dress Style</p>
                      <StyleCard
                        options={DRESS_STYLES}
                        selected={config.dressStyle}
                        onSelect={(s) => update("dressStyle", s)}
                        emoji={dressEmoji}
                      />
                    </div>
                    <ColorSwatch
                      label="Dress Color"
                      colors={DRESS_COLORS}
                      selected={config.dressColor}
                      onSelect={(c) => update("dressColor", c)}
                    />
                    <ColorSwatch
                      label="Shoe Color"
                      colors={SHOE_COLORS}
                      selected={config.shoeColor}
                      onSelect={(c) => update("shoeColor", c)}
                    />
                  </>
                )}

                {step === "accessories" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Accessory</p>
                      <StyleCard
                        options={ACCESSORIES}
                        selected={config.accessory}
                        onSelect={(s) => update("accessory", s)}
                        emoji={accessoryEmoji}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Photo Scene</p>
                      <StyleCard
                        options={SCENES}
                        selected={scene}
                        onSelect={setScene}
                        emoji={sceneEmoji}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-5 flex items-center justify-between border-t border-pink-200/50 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={step === "look"}
                  onClick={() => setStep((prev) => (prev === "dress" ? "look" : "dress"))}
                  className="text-pink-700"
                >
                  ← Back
                </Button>
                <Button
                  size="sm"
                  disabled={step === "accessories"}
                  onClick={() => setStep((prev) => (prev === "look" ? "dress" : "accessories"))}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next Step →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
