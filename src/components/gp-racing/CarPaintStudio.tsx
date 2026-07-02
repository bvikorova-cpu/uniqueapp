import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Palette, Check, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const presetColors = [
  { name: "Neon Cyan", hex: "#00e5ff", premium: false },
  { name: "Racing Red", hex: "#ef4444", premium: false },
  { name: "Electric Blue", hex: "#3b82f6", premium: false },
  { name: "Toxic Green", hex: "#22c55e", premium: false },
  { name: "Solar Orange", hex: "#f97316", premium: false },
  { name: "Pure White", hex: "#ffffff", premium: false },
  { name: "Midnight Black", hex: "#0f172a", premium: false },
  { name: "Plasma Purple", hex: "#a855f7", premium: true },
  { name: "Rose Gold", hex: "#fb7185", premium: true },
  { name: "Chrome Silver", hex: "#cbd5e1", premium: true },
  { name: "Holographic", hex: "#06b6d4", premium: true },
  { name: "Aurora Borealis", hex: "#34d399", premium: true },
];

const patterns = [
  { name: "Solid", id: "solid", premium: false },
  { name: "Racing Stripes", id: "stripes", premium: false },
  { name: "Carbon Fiber", id: "carbon", premium: false },
  { name: "Lightning Bolt", id: "lightning", premium: true },
  { name: "Digital Camo", id: "camo", premium: true },
  { name: "Flame Wrap", id: "flames", premium: true },
  { name: "Galaxy", id: "galaxy", premium: true },
  { name: "Circuit Board", id: "circuit", premium: true },
];

const decals = [
  { name: "Racing Number", id: "number", premium: false },
  { name: "Team Logo", id: "logo", premium: false },
  { name: "Speed Lines", id: "speed", premium: false },
  { name: "Skull & Flames", id: "skull", premium: true },
  { name: "Neon Wings", id: "wings", premium: true },
  { name: "Crown", id: "crown", premium: true },
];

export function CarPaintStudio({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState("#00e5ff");
  const [selectedPattern, setSelectedPattern] = useState("solid");
  const [selectedDecal, setSelectedDecal] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#00e5ff");

  return (
    <>
      <FloatingHowItWorks title={"Car Paint Studio - How it works"} steps={[{ title: 'Open', desc: 'Access the Car Paint Studio section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Car Paint Studio.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Car Paint Studio</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Design your livery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <Card className="lg:col-span-1 relative overflow-hidden bg-slate-900/60 border-cyan-500/20 aspect-square flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.02) 3px, rgba(0,229,255,0.02) 6px)',
          }} />
          <div className="text-center">
            {/* Car preview shape */}
            <div className="relative inline-block">
              <div className="w-40 h-20 rounded-lg transition-colors duration-300" style={{ backgroundColor: selectedColor }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-10 rounded-md bg-slate-950/80" />
                {/* Pattern overlay */}
                {selectedPattern === "stripes" && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-white/30" />
                  </div>
                )}
                {selectedPattern === "carbon" && (
                  <div className="absolute inset-0 rounded-lg opacity-30" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.3) 5px, rgba(0,0,0,0.3) 10px)',
                  }} />
                )}
              </div>
              {/* Wheels */}
              <div className="absolute -bottom-3 left-4 w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-500/30" />
              <div className="absolute -bottom-3 right-4 w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-500/30" />
              {/* Glow */}
              <div className="absolute -inset-4 rounded-2xl blur-xl opacity-30 transition-colors duration-300" style={{ backgroundColor: selectedColor }} />
            </div>
            <p className="mt-6 text-xs font-mono text-cyan-400/40 uppercase tracking-wider">Live Preview</p>
          </div>
        </Card>

        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Colors */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" /> Colors
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === color.hex ? 'border-cyan-400 scale-110' : 'border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedColor === color.hex && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-lg" />
                  )}
                  {color.premium && (
                    <Star className="absolute top-0.5 right-0.5 h-3 w-3 text-amber-400" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); setSelectedColor(e.target.value); }}
                className="w-10 h-10 rounded-lg border border-cyan-500/30 bg-transparent cursor-pointer" />
              <span className="text-xs font-mono text-cyan-400/50">Custom color</span>
            </div>
          </Card>

          {/* Patterns */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Patterns
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern.id)}
                  className={`relative p-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all ${
                    selectedPattern === pattern.id
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-cyan-500/15 bg-slate-950/50 text-cyan-400/50 hover:border-cyan-500/30'
                  }`}
                >
                  {pattern.name}
                  {pattern.premium && <Star className="absolute top-1 right-1 h-3 w-3 text-amber-400" />}
                </button>
              ))}
            </div>
          </Card>

          {/* Decals */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3">Decals</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {decals.map((decal) => (
                <button
                  key={decal.id}
                  onClick={() => setSelectedDecal(selectedDecal === decal.id ? null : decal.id)}
                  className={`relative p-2 rounded-lg border text-center transition-all ${
                    selectedDecal === decal.id
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-cyan-500/15 bg-slate-950/50 hover:border-cyan-500/30'
                  }`}
                >
                  <span className="text-[10px] font-mono text-cyan-400/60">{decal.name}</span>
                  {decal.premium && <Star className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-amber-400" />}
                </button>
              ))}
            </div>
          </Card>

          <Button
            onClick={() => {
              if (!user) { navigate('/auth'); return; }
            }}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/20 font-mono uppercase tracking-wider"
          >
            Apply Design (50 Gems)
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
