import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import {
  Brush, Eraser, Download, RotateCcw, Pipette, Undo2, Redo2,
  ZoomIn, ZoomOut, PenTool
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COLOR_PALETTE = [
  "#FF0000", "#FF6B00", "#FFD700", "#00C853", "#00BCD4",
  "#2196F3", "#9C27B0", "#E91E63", "#795548", "#000000",
  "#FFFFFF", "#FF9800", "#8BC34A", "#03A9F4", "#673AB7",
  "#F44336", "#CDDC39", "#009688", "#3F51B5", "#9E9E9E",
];

interface ColoringCanvasProps {
  imageUrl: string;
  onSave?: (dataUrl: string) => void;
}

export function ColoringCanvas({ imageUrl, onSave }: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF0000");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<"brush" | "eraser" | "fill">("brush");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      saveToHistory();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory.slice(-30);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => { setIsDrawing(true); lastPos.current = getPos(e); };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize * (tool === "eraser" ? 3 : 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    lastPos.current = pos;
  };

  const endDraw = () => { if (isDrawing) { setIsDrawing(false); lastPos.current = null; saveToHistory(); } };

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const resetCanvas = () => {
    if (history.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.putImageData(history[0], 0, 0);
      setHistory([history[0]]);
      setHistoryIndex(0);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "my-coloring-page.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <FloatingHowItWorks title={"Coloring Canvas - How it works"} steps={[{ title: 'Open', desc: 'Access the Coloring Canvas section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coloring Canvas.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <PenTool className="h-4 w-4 text-primary" />
              </div>
              Color It Online
            </CardTitle>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 p-0"><Undo2 className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0"><Redo2 className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" onClick={resetCanvas} className="h-8 w-8 p-0"><RotateCcw className="h-3.5 w-3.5" /></Button>
              <Button size="sm" onClick={downloadCanvas} className="h-8 gap-1"><Download className="h-3.5 w-3.5" /> Save</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30">
            <div className="flex gap-1">
              <Button size="sm" variant={tool === "brush" ? "default" : "outline"} onClick={() => setTool("brush")} className="h-8 w-8 p-0"><Brush className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")} className="h-8 w-8 p-0"><Eraser className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="flex items-center gap-2 min-w-[140px]">
              <span className="text-xs text-muted-foreground">Size:</span>
              <Slider value={[brushSize]} onValueChange={([v]) => setBrushSize(v)} min={1} max={30} step={1} className="flex-1" />
              <span className="text-xs font-mono w-6 text-right">{brushSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
              <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={2} step={0.1} className="w-20" />
              <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Color palette */}
          <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-xl border border-border/30">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                  color === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => { setColor(c); setTool("brush"); }}
              />
            ))}
            <div className="flex items-center gap-1 ml-2">
              <Pipette className="h-3.5 w-3.5 text-muted-foreground" />
              <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool("brush"); }} className="w-7 h-7 rounded cursor-pointer border-0" />
            </div>
          </div>

          {/* Canvas */}
          <div className="flex justify-center overflow-auto bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] rounded-xl border border-border/30 p-2">
            <canvas
              ref={canvasRef}
              className="max-w-full cursor-crosshair rounded-lg"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
