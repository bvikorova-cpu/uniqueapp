import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, Polygon } from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Paintbrush, Trash2, Eye, EyeOff, Undo, Redo, Circle as CircleIcon, Square, Star, Save, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useKidsDrawingGallery } from "@/hooks/useKidsDrawingGallery";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DrawingCanvasProps {
  tutorialImage?: string;
  stepNumber: number;
  category?: string;
}

const COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
];

export const DrawingCanvas = ({ tutorialImage, stepNumber, category }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [activeTool, setActiveTool] = useState<"draw" | "erase" | "circle" | "square" | "star">("draw");
  const [showReference, setShowReference] = useState(true);
  const [overlayMode, setOverlayMode] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(30);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState("");
  const { saveDrawing, isSaving } = useKidsDrawingGallery();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 450,
      backgroundColor: "#ffffff",
      isDrawingMode: true,
    });

    // Initialize brush
    const brush = new PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    setCanvasHistory([initialState]);
    setHistoryStep(0);

    // Listen for drawing events to save history
    const saveState = () => {
      const json = JSON.stringify(canvas.toJSON());
      setCanvasHistory((prev) => {
        const newHistory = prev.slice(0, historyStep + 1);
        newHistory.push(json);
        return newHistory;
      });
      setHistoryStep((prev) => prev + 1);
    };

    canvas.on("path:created", saveState);
    canvas.on("object:modified", saveState);
    canvas.on("object:removed", saveState);

    setFabricCanvas(canvas);

    return () => {
      canvas.off("path:created", saveState);
      canvas.off("object:modified", saveState);
      canvas.off("object:removed", saveState);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    if (activeTool === "draw") {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = activeColor;
      brush.width = brushSize;
      fabricCanvas.freeDrawingBrush = brush;
      fabricCanvas.isDrawingMode = true;
    } else if (activeTool === "erase") {
      const eraser = new PencilBrush(fabricCanvas);
      eraser.color = "#ffffff";
      eraser.width = brushSize * 2;
      fabricCanvas.freeDrawingBrush = eraser;
      fabricCanvas.isDrawingMode = true;
    } else {
      // For shape tools, disable drawing mode
      fabricCanvas.isDrawingMode = false;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    
    // Save cleared state to history
    const json = JSON.stringify(fabricCanvas.toJSON());
    setCanvasHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(json);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
    
    toast.success("Canvas cleared! 🎨");
  };

  const handleUndo = () => {
    if (!fabricCanvas || historyStep <= 0) return;
    
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    
    const state = JSON.parse(canvasHistory[newStep]);
    fabricCanvas.loadFromJSON(state, () => {
      fabricCanvas.renderAll();
      toast.success("Undo! ↶");
    });
  };

  const handleRedo = () => {
    if (!fabricCanvas || historyStep >= canvasHistory.length - 1) return;
    
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    
    const state = JSON.parse(canvasHistory[newStep]);
    fabricCanvas.loadFromJSON(state, () => {
      fabricCanvas.renderAll();
      toast.success("Redo! ↷");
    });
  };

  const saveStateToHistory = () => {
    if (!fabricCanvas) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    setCanvasHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(json);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

  const handleAddShape = (shapeType: "circle" | "square" | "star") => {
    if (!fabricCanvas) return;

    setActiveTool(shapeType);

    if (shapeType === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: activeColor,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
      saveStateToHistory();
      toast.success("Circle added! ⭕");
    } else if (shapeType === "square") {
      const square = new Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: activeColor,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(square);
      fabricCanvas.setActiveObject(square);
      saveStateToHistory();
      toast.success("Square added! ◻️");
    } else if (shapeType === "star") {
      // Create a 5-pointed star
      const points = [];
      const outerRadius = 50;
      const innerRadius = 25;
      const numPoints = 5;
      
      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / numPoints;
        points.push({
          x: Math.cos(angle - Math.PI / 2) * radius,
          y: Math.sin(angle - Math.PI / 2) * radius,
        });
      }

      const star = new Polygon(points, {
        left: 150,
        top: 150,
        fill: activeColor,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(star);
      fabricCanvas.setActiveObject(star);
      saveStateToHistory();
      toast.success("Star added! ⭐");
    }

    fabricCanvas.renderAll();
    // Switch back to draw mode after adding shape
    setTimeout(() => setActiveTool("draw"), 100);
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = `drawing-step-${stepNumber}.png`;
    link.href = dataURL;
    link.click();
    toast.success("Drawing downloaded! 📥");
  };

  const handleSaveToGallery = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    
    const title = drawingTitle.trim() || `Drawing Step ${stepNumber}`;
    saveDrawing({
      imageDataURL: dataURL,
      title,
      stepNumber,
      category,
    });
    
    setShowSaveDialog(false);
    setDrawingTitle("");
  };

  return (
    <div className="space-y-4">
      {/* Tools */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Tool Selection */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeTool === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("draw")}
            >
              <Paintbrush className="w-4 h-4 mr-2" />
              Draw
            </Button>
            <Button
              variant={activeTool === "erase" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("erase")}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Erase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddShape("circle")}
            >
              <CircleIcon className="w-4 h-4 mr-2" />
              Circle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddShape("square")}
            >
              <Square className="w-4 h-4 mr-2" />
              Square
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddShape("star")}
            >
              <Star className="w-4 h-4 mr-2" />
              Star
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUndo}
              disabled={historyStep <= 0}
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRedo}
              disabled={historyStep >= canvasHistory.length - 1}
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              Download
            </Button>
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save to Gallery
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Drawing to Gallery</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label htmlFor="title" className="text-sm font-medium">
                      Drawing Title
                    </label>
                    <Input
                      id="title"
                      placeholder={`Drawing Step ${stepNumber}`}
                      value={drawingTitle}
                      onChange={(e) => setDrawingTitle(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveToGallery} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReference(!showReference)}
            >
              {showReference ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showReference ? "Hide" : "Show"} Reference
            </Button>
            {tutorialImage && (
              <Button
                variant={overlayMode ? "default" : "outline"}
                size="sm"
                onClick={() => setOverlayMode(!overlayMode)}
              >
                <Layers className="w-4 h-4 mr-2" />
                {overlayMode ? "Overlay ON" : "Overlay OFF"}
              </Button>
            )}
          </div>

          {/* Overlay Opacity Control */}
          {overlayMode && tutorialImage && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Overlay Opacity: {overlayOpacity}%
              </label>
              <Slider
                value={[overlayOpacity]}
                onValueChange={(value) => setOverlayOpacity(value[0])}
                min={10}
                max={70}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Color Picker */}
          {activeTool === "draw" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      activeColor === color ? "border-primary scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Brush Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Brush Size: {brushSize}px
            </label>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Canvas and Reference */}
      <div className={`grid gap-4 ${overlayMode ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {/* Drawing Canvas with Optional Overlay */}
        <div className="border-2 border-border rounded-lg overflow-hidden bg-white relative">
          <div className="bg-muted px-3 py-2 text-sm font-medium">
            Your Drawing {overlayMode && "(Overlay Mode)"}
          </div>
          <div className="relative">
            <canvas ref={canvasRef} className="w-full" />
            {/* Overlay Reference Image */}
            {overlayMode && tutorialImage && (
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ opacity: overlayOpacity / 100 }}
              >
                <img
                  src={tutorialImage}
                  alt={`Step ${stepNumber} overlay`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Reference Image - Only show if not in overlay mode */}
        {showReference && tutorialImage && !overlayMode && (
          <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
            <div className="bg-muted px-3 py-2 text-sm font-medium">
              Reference (Step {stepNumber})
            </div>
            <div className="aspect-[4/3] flex items-center justify-center p-4">
              <img
                src={tutorialImage}
                alt={`Step ${stepNumber} reference`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
