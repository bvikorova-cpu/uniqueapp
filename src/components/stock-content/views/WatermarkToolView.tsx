import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props { onBack: () => void; }

type Position = "center" | "tile" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function WatermarkToolView({ onBack }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [text, setText] = useState("UNIQUE");
  const [opacity, setOpacity] = useState([40]);
  const [size, setSize] = useState([8]);
  const [rotation, setRotation] = useState([-25]);
  const [position, setPosition] = useState<Position>("tile");
  const [color, setColor] = useState("#ffffff");
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10 MB"); return; }
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  useEffect(() => { if (imageUrl) renderWatermark();   }, [imageUrl, text, opacity, size, rotation, position, color]);

  const renderWatermark = async () => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = imageUrl; });
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const fontSize = Math.round((canvas.width * size[0]) / 100);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity[0] / 100;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const drawAt = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation[0] * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    if (position === "tile") {
      const stepX = fontSize * (text.length * 0.8);
      const stepY = fontSize * 4;
      for (let y = 0; y < canvas.height + stepY; y += stepY) {
        for (let x = 0; x < canvas.width + stepX; x += stepX) drawAt(x, y);
      }
    } else if (position === "center") {
      drawAt(canvas.width / 2, canvas.height / 2);
    } else {
      const pad = fontSize;
      const xMap: any = { "top-left": pad * 2, "top-right": canvas.width - pad * 2, "bottom-left": pad * 2, "bottom-right": canvas.width - pad * 2 };
      const yMap: any = { "top-left": pad, "top-right": pad, "bottom-left": canvas.height - pad, "bottom-right": canvas.height - pad };
      drawAt(xMap[position], yMap[position]);
    }
    ctx.globalAlpha = 1;
  };

  const download = () => {
    if (!canvasRef.current) return;
    setProcessing(true);
    canvasRef.current.toBlob((blob) => {
      if (!blob) { setProcessing(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watermarked-${imageFile?.name ?? "image.png"}`;
      a.click();
      URL.revokeObjectURL(url);
      setProcessing(false);
      toast.success("Downloaded");
    }, "image/png");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6 text-cyan-500" /> Watermark Tool</h2>
      </div>

      {!imageUrl ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">Upload an image to add a watermark</p>
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="max-w-xs mx-auto" />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <Card className="p-4 space-y-4 h-fit">
            <div>
              <Label>Text</Label>
              <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={40} />
            </div>
            <div>
              <Label>Position</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tile">Tile (full area)</SelectItem>
                  <SelectItem value="center">Stred</SelectItem>
                  <SelectItem value="top-left">Top left</SelectItem>
                  <SelectItem value="top-right">Vpravo hore</SelectItem>
                  <SelectItem value="bottom-left">Bottom left</SelectItem>
                  <SelectItem value="bottom-right">Vpravo dole</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Opacity: {opacity[0]}%</Label>
              <Slider value={opacity} onValueChange={setOpacity} min={5} max={100} step={5} />
            </div>
            <div>
              <Label>Size: {size[0]}%</Label>
              <Slider value={size} onValueChange={setSize} min={2} max={20} step={1} />
            </div>
            <div>
              <Label>Rotation: {rotation[0]}°</Label>
              <Slider value={rotation} onValueChange={setRotation} min={-90} max={90} step={5} />
            </div>
            <div>
              <Label>Farba</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { setImageUrl(""); setImageFile(null); }} className="flex-1">Change</Button>
              <Button onClick={download} disabled={processing} className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1" /> Download</>}
              </Button>
            </div>
          </Card>
          <Card className="p-4 overflow-auto bg-muted/20">
            <canvas ref={canvasRef} className="max-w-full h-auto mx-auto rounded" />
          </Card>
        </div>
      )}
    </div>
  );
}
