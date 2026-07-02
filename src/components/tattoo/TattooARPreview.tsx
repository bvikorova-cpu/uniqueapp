import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Eye, Upload, RotateCcw, Download, Gem, Move } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const TattooARPreview = ({ onBack }: Props) => {
  const [bodyPhoto, setBodyPhoto] = useState<string | null>(null);
  const [tattooImage, setTattooImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState([80]);
  const [rotation, setRotation] = useState([0]);
  const [opacity, setOpacity] = useState([85]);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBodyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBodyPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTattooUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setTattooImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)),
        y: Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100)),
      });
    }
  };

  const downloadPreview = () => {
    toast.success("Use screenshot to save your preview!");
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo A R Preview - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo A R Preview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo A R Preview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-4xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">AR Body Preview</h2>
            <p className="text-muted-foreground text-sm">Visualize your tattoo on your body — completely free</p>
          </div>
          <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">FREE</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            { id: "ar-body", label: "Upload Body Photo", handler: handleBodyUpload, preview: bodyPhoto, hint: "Your body photo" },
            { id: "ar-tattoo", label: "Upload Tattoo Design", handler: handleTattooUpload, preview: tattooImage, hint: "Tattoo design (PNG)" },
          ].map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Label className="text-amber-400/80 font-semibold">{item.label}</Label>
              <div
                className="mt-2 border-2 border-dashed border-amber-500/20 rounded-xl p-6 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300"
                onClick={() => document.getElementById(item.id)?.click()}
              >
                {item.preview ? (
                  <img src={item.preview} alt={item.label} className="max-h-36 mx-auto rounded-lg shadow-lg" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-amber-500/40 mb-2" />
                    <p className="text-sm text-muted-foreground">{item.hint}</p>
                  </>
                )}
                <input id={item.id} type="file" accept="image/*" className="hidden" onChange={item.handler} />
              </div>
            </motion.div>
          ))}
        </div>

        {bodyPhoto && tattooImage ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center gap-2 mb-3 text-xs text-amber-400/60">
              <Move className="h-3 w-3" />
              <span>Click & drag the tattoo to reposition it on your body</span>
            </div>

            <div
              ref={containerRef}
              className="relative border-2 border-amber-500/30 rounded-xl overflow-hidden mb-4 cursor-crosshair select-none"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setIsDragging(false)}
              onPointerLeave={() => setIsDragging(false)}
            >
              <img src={bodyPhoto} alt="Body" className="w-full pointer-events-none" />
              <img
                src={tattooImage}
                alt="Tattoo overlay"
                className="absolute cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => { e.preventDefault(); setIsDragging(true); }}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) scale(${scale[0] / 100}) rotate(${rotation[0]}deg)`,
                  maxWidth: "40%",
                  opacity: opacity[0] / 100,
                  mixBlendMode: "multiply",
                  transition: isDragging ? "none" : "all 0.15s ease",
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Size", value: scale, setter: setScale, min: 20, max: 200, unit: "%" },
                { label: "Rotation", value: rotation, setter: setRotation, min: -180, max: 180, unit: "°" },
                { label: "Opacity", value: opacity, setter: setOpacity, min: 20, max: 100, unit: "%" },
              ].map((ctrl) => (
                <div key={ctrl.label}>
                  <Label className="text-xs text-amber-400/70">{ctrl.label}: {ctrl.value[0]}{ctrl.unit}</Label>
                  <Slider value={ctrl.value} onValueChange={ctrl.setter} min={ctrl.min} max={ctrl.max} step={5} className="mt-1" />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => { setPosition({ x: 50, y: 50 }); setScale([80]); setRotation([0]); setOpacity([85]); }}
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold shadow-lg shadow-amber-500/20"
                onClick={downloadPreview}
              >
                <Download className="h-4 w-4" /> Save Preview
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-16 border-2 border-dashed border-amber-500/10 rounded-xl bg-amber-500/[0.02]">
            <Eye className="h-14 w-14 mx-auto text-amber-500/30 mb-4" />
            <p className="text-muted-foreground font-medium">Upload both images to start previewing</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Supported: JPG, PNG, WebP</p>
          </motion.div>
        )}
      </Card>
    </div>
    </>
  );
};
