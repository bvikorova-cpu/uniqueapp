import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Move } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ComparisonSlider = ({ onBack }: Props) => {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleBefore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setBeforeFile(f); setBeforeUrl(URL.createObjectURL(f)); }
  };
  const handleAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setAfterFile(f); setAfterUrl(URL.createObjectURL(f)); }
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseUp = () => { dragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging.current) updateSlider(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { updateSlider(e.touches[0].clientX); };

  return (
    <>
      <FloatingHowItWorks title={"Comparison Slider - How it works"} steps={[{ title: 'Open', desc: 'Access the Comparison Slider section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comparison Slider.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Move className="h-6 w-6 text-cyan-500" />
          Before / After Comparison
        </h2>
        <p className="text-muted-foreground mb-6">
          Upload a before and after photo, then drag the slider to compare side by side. Free to use!
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="mb-2 block">Before Photo</Label>
            <Input type="file" accept="image/*" onChange={handleBefore} />
          </div>
          <div>
            <Label className="mb-2 block">After Photo</Label>
            <Input type="file" accept="image/*" onChange={handleAfter} />
          </div>
        </div>

        {beforeUrl && afterUrl ? (
          <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-col-resize select-none border border-border"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* After (full) */}
            <img src={afterUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" />
            
            {/* Before (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
              <img src={beforeUrl} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${containerRef.current?.offsetWidth || 100}px`, maxWidth: 'none' }} />
            </div>

            {/* Slider line */}
            <div className="absolute top-0 bottom-0" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
              <div className="w-0.5 h-full bg-white shadow-lg" />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                <Move className="h-5 w-5 text-foreground" />
              </div>
            </div>

            {/* Labels */}
            <span className="absolute top-3 left-3 text-xs bg-black/60 text-white px-2 py-1 rounded-full font-semibold">Before</span>
            <span className="absolute top-3 right-3 text-xs bg-primary/80 text-white px-2 py-1 rounded-full font-semibold">After</span>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-muted rounded-xl flex items-center justify-center">
            <div className="text-center p-8">
              <Move className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload both photos to compare</p>
            </div>
          </div>
        )}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
    </>
  );
};
