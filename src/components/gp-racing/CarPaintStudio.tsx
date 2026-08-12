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
          <div className="absolute inset-0 pointer-events-none" style={ {
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.02) 3px, rgba(0,229,255,0.02) 6px)' }} />
          <div className="text-center px-4">
            {/* F1 car preview (side view) */}
            <div className="relative inline-block">
              <div
                className="absolute -inset-6 rounded-[40%] blur-2xl opacity-30 transition-colors duration-300"
                style={{ backgroundColor: selectedColor }}
              />
              <svg viewBox="0 0 320 120" className="relative w-56 sm:w-64 h-auto drop-shadow-2xl">
                <defs>
                  <linearGradient id="cps-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
                  </linearGradient>
                  <pattern id="cps-carbon" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="8" height="8" fill="transparent" />
                    <rect width="4" height="8" fill="rgba(0,0,0,0.35)" />
                  </pattern>
                  <clipPath id="cps-clip">
                    <path d="M8 82 L60 78 L96 62 L128 58 L150 44 L196 42 L214 58 L262 62 L286 60 L300 66 L302 78 L292 84 L60 88 Z" />
                  </clipPath>
                </defs>

                {/* Front wing */}
                <rect x="2" y="84" width="52" height="7" rx="3" fill={selectedColor} />
                <rect x="4" y="76" width="10" height="16" rx="2" fill={selectedColor} opacity="0.85" />
                {/* Rear wing */}
                <rect x="272" y="30" width="44" height="8" rx="3" fill={selectedColor} />
                <rect x="290" y="36" width="7" height="30" fill={selectedColor} opacity="0.9" />
                <rect x="310" y="26" width="6" height="42" rx="2" fill={selectedColor} opacity="0.8" />

                {/* Main body / chassis */}
                <path
                  d="M8 82 L60 78 L96 62 L128 58 L150 44 L196 42 L214 58 L262 62 L286 60 L300 66 L302 78 L292 84 L60 88 Z"
                  fill={selectedColor}
                />
                <g clipPath="url(#cps-clip)">
                  <path
                    d="M8 82 L60 78 L96 62 L128 58 L150 44 L196 42 L214 58 L262 62 L286 60 L300 66 L302 78 L292 84 L60 88 Z"
                    fill="url(#cps-body)"
                  />
                  {selectedPattern === "carbon" && <rect x="0" y="0" width="320" height="120" fill="url(#cps-carbon)" />}
                  {selectedPattern === "stripes" && (
                    <>
                      <rect x="0" y="60" width="320" height="6" fill="rgba(255,255,255,0.55)" />
                      <rect x="0" y="70" width="320" height="3" fill="rgba(255,255,255,0.35)" />
                    </>
                  )}
                  {selectedPattern === "flames" && (
                    <path d="M60 90 q20 -20 34 -4 q14 -18 30 -2 q16 -16 30 0 l0 20 Z" fill="rgba(255,120,0,0.6)" />
                  )}
                  {selectedPattern === "camo" && (
                    <>
                      <rect x="70" y="60" width="26" height="12" fill="rgba(0,0,0,0.3)" />
                      <rect x="120" y="52" width="22" height="14" fill="rgba(255,255,255,0.2)" />
                      <rect x="180" y="58" width="30" height="12" fill="rgba(0,0,0,0.25)" />
                    </>
                  )}
                  {(selectedPattern === "galaxy" || selectedPattern === "circuit" || selectedPattern === "lightning") && (
                    <path d="M110 80 l20 -18 l-8 18 l22 -14" stroke="rgba(255,255,255,0.7)" strokeWidth="3" fill="none" />
                  )}
                </g>

                {/* Sidepod shading */}
                <path d="M150 60 L214 58 L214 76 L150 78 Z" fill="rgba(0,0,0,0.18)" />
                {/* Airbox */}
                <path d="M196 42 q12 -16 22 2 Z" fill={selectedColor} />
                {/* Halo + cockpit */}
                <path d="M152 44 q22 -22 44 -2" stroke="rgba(220,235,255,0.85)" strokeWidth="4" fill="none" />
                <path d="M158 48 q16 -8 32 -2 l0 10 l-32 0 Z" fill="#0b1220" />
                <circle cx="174" cy="44" r="7" fill="#0f172a" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />

                {/* Wheels */}
                <g>
                  <circle cx="82" cy="86" r="24" fill="#0a0f18" stroke="rgba(0,229,255,0.25)" strokeWidth="2" />
                  <circle cx="82" cy="86" r="10" fill="#1e293b" stroke="rgba(203,213,225,0.6)" strokeWidth="2" />
                  <circle cx="248" cy="86" r="27" fill="#0a0f18" stroke="rgba(0,229,255,0.25)" strokeWidth="2" />
                  <circle cx="248" cy="86" r="11" fill="#1e293b" stroke="rgba(203,213,225,0.6)" strokeWidth="2" />
                </g>

                {/* Decals */}
                {selectedDecal === "number" && (
                  <text x="176" y="74" textAnchor="middle" fontSize="16" fontFamily="monospace" fontWeight="bold" fill="rgba(255,255,255,0.9)">7</text>
                )}
                {selectedDecal === "speed" && (
                  <g stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                    <line x1="100" y1="68" x2="140" y2="68" />
                    <line x1="106" y1="74" x2="146" y2="74" />
                  </g>
                )}
                {selectedDecal === "crown" && (
                  <path d="M166 34 l6 -10 l6 8 l6 -8 l6 10 Z" fill="#fbbf24" />
                )}
                {selectedDecal === "wings" && (
                  <path d="M214 56 q22 -14 40 -2 M214 60 q22 -8 40 2" stroke="rgba(0,229,255,0.8)" strokeWidth="2" fill="none" />
                )}
                {selectedDecal === "skull" && (
                  <circle cx="230" cy="66" r="6" fill="rgba(255,255,255,0.85)" />
                )}
                {selectedDecal === "logo" && (
                  <rect x="120" y="62" width="18" height="10" rx="2" fill="rgba(255,255,255,0.8)" />
                )}
              </svg>
            </div>
            <p className="mt-4 text-xs font-mono text-cyan-400/40 uppercase tracking-wider">Live Preview</p>
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
            Apply Design (1 Credit)
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
