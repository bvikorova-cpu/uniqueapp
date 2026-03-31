import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Eye, Upload, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface Props { onBack: () => void; }

export const TattooARPreview = ({ onBack }: Props) => {
  const [bodyPhoto, setBodyPhoto] = useState<string | null>(null);
  const [tattooImage, setTattooImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState([80]);
  const [rotation, setRotation] = useState([0]);
  const [opacity, setOpacity] = useState([85]);
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

  const handleDrag = (e: React.DragEvent<HTMLImageElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  const downloadPreview = () => {
    toast.success("Use screenshot to save your preview!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="h-8 w-8 text-amber-500" />
          <div>
            <h2 className="text-2xl font-black">Tattoo AR Preview</h2>
            <p className="text-muted-foreground text-sm">See how your tattoo looks on your body — free tool</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Upload Body Photo</Label>
            <div className="mt-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-amber-500/60 transition-colors" onClick={() => document.getElementById("ar-body")?.click()}>
              {bodyPhoto ? <img src={bodyPhoto} alt="Body" className="max-h-32 mx-auto rounded" /> : <><Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" /><p className="text-sm text-muted-foreground">Body photo</p></>}
              <input id="ar-body" type="file" accept="image/*" className="hidden" onChange={handleBodyUpload} />
            </div>
          </div>
          <div>
            <Label>Upload Tattoo Design</Label>
            <div className="mt-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-amber-500/60 transition-colors" onClick={() => document.getElementById("ar-tattoo")?.click()}>
              {tattooImage ? <img src={tattooImage} alt="Tattoo" className="max-h-32 mx-auto rounded" /> : <><Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" /><p className="text-sm text-muted-foreground">Tattoo design</p></>}
              <input id="ar-tattoo" type="file" accept="image/*" className="hidden" onChange={handleTattooUpload} />
            </div>
          </div>
        </div>

        {bodyPhoto && tattooImage ? (
          <>
            <div ref={containerRef} className="relative border-2 border-amber-500/30 rounded-xl overflow-hidden mb-4">
              <img src={bodyPhoto} alt="Body" className="w-full" />
              <img
                src={tattooImage}
                alt="Tattoo overlay"
                className="absolute cursor-move pointer-events-auto"
                draggable
                onDragEnd={handleDrag}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) scale(${scale[0] / 100}) rotate(${rotation[0]}deg)`,
                  maxWidth: "40%",
                  opacity: opacity[0] / 100,
                  mixBlendMode: "multiply",
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Size: {scale[0]}%</Label>
                <Slider value={scale} onValueChange={setScale} min={20} max={200} step={5} />
              </div>
              <div>
                <Label className="text-xs">Rotation: {rotation[0]}°</Label>
                <Slider value={rotation} onValueChange={setRotation} min={-180} max={180} step={5} />
              </div>
              <div>
                <Label className="text-xs">Opacity: {opacity[0]}%</Label>
                <Slider value={opacity} onValueChange={setOpacity} min={20} max={100} step={5} />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => { setPosition({ x: 50, y: 50 }); setScale([80]); setRotation([0]); setOpacity([85]); }}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button className="flex-1 gap-2" onClick={downloadPreview}>
                <Download className="h-4 w-4" /> Save Preview
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-xl">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Upload both images to start previewing</p>
          </div>
        )}
      </Card>
    </div>
  );
};
