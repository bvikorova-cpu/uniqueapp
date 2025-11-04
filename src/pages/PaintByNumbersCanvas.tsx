import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { usePaintById, useUserPaintProgress, useUpdatePaintProgress } from "@/hooks/usePaintByNumbers";
import { Progress } from "@/components/ui/progress";
import { paintThumbnails } from "@/data/paintThumbnails";
import { useGeneratePaintTemplate } from "@/hooks/useGeneratePaintTemplate";

export default function PaintByNumbersCanvas() {
  const { paintId } = useParams<{ paintId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [coloredPreview, setColoredPreview] = useState<string | null>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  
  const { data: painting } = usePaintById(paintId!);
  const { data: progress } = useUserPaintProgress(paintId);
  const updateProgress = useUpdatePaintProgress();
  const generateTemplate = useGeneratePaintTemplate();

  // Generate paint-by-numbers template if not available
  useEffect(() => {
    if (painting && !coloredPreview && !templateImage) {
      generateTemplate.mutate(
        { title: painting.title, description: `A ${painting.category} themed paint-by-numbers` },
        {
          onSuccess: (images) => {
            setColoredPreview(images.coloredImageUrl);
            setTemplateImage(images.templateImageUrl);
          }
        }
      );
    }
  }, [painting]);

  const completedSections = progress?.completed_sections || [];
  const progressPercent = painting ? (completedSections.length / painting.total_sections) * 100 : 0;

  // Load template image
  useEffect(() => {
    if (templateImage && !templateLoaded) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        templateImgRef.current = img;
        setTemplateLoaded(true);
      };
      img.src = templateImage;
    }
  }, [templateImage]);

  // Draw canvas with template and colored sections
  useEffect(() => {
    if (!canvasRef.current || !templateLoaded || !templateImgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw template image
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.drawImage(templateImgRef.current, 0, 0, canvasSize.width, canvasSize.height);

    // Draw colored sections on top based on progress
    // This is a simplified version - in reality you'd need pixel detection
    // For now, we'll just track clicks and color regions
  }, [templateLoaded, completedSections, canvasSize]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !templateImgRef.current || selectedColor === null || !painting) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the color at clicked position to determine the section
    const imageData = ctx.getImageData(x, y, 1, 1);
    const clickedPixel = imageData.data;
    
    // Check if clicked on a white area (area to be colored)
    const isWhiteArea = clickedPixel[0] > 200 && clickedPixel[1] > 200 && clickedPixel[2] > 200;
    
    if (isWhiteArea) {
      // Get the selected color
      const color = painting.image_data.colors?.find(c => c.number === selectedColor);
      if (color) {
        // Flood fill algorithm
        floodFill(ctx, x, y, color.color, canvasSize.width, canvasSize.height);
        
        // Update progress (simplified - using random section ID)
        const sectionId = selectedColor;
        if (!completedSections.includes(sectionId)) {
          updateProgress.mutate({
            paintId: paintId!,
            sectionId: sectionId,
            totalSections: painting.total_sections,
          });
        }
      }
    }
  };

  // Simple flood fill algorithm
  const floodFill = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    fillColor: string,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    const startPos = (startY * width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    
    // Don't fill if clicking on black outline
    if (startR < 100 && startG < 100 && startB < 100) return;
    
    // Convert fill color to RGB
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const tempData = tempCtx.getImageData(0, 0, 1, 1).data;
    const fillR = tempData[0];
    const fillG = tempData[1];
    const fillB = tempData[2];
    
    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      
      const pos = (y * width + x) * 4;
      const r = pixels[pos];
      const g = pixels[pos + 1];
      const b = pixels[pos + 2];
      
      // Check if pixel matches start color (allowing some tolerance)
      const colorMatch = 
        Math.abs(r - startR) < 30 &&
        Math.abs(g - startG) < 30 &&
        Math.abs(b - startB) < 30;
      
      // Skip black pixels (outlines)
      const isBlack = r < 100 && g < 100 && b < 100;
      
      if (colorMatch && !isBlack) {
        pixels[pos] = fillR;
        pixels[pos + 1] = fillG;
        pixels[pos + 2] = fillB;
        
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const handleReset = () => {
    // In a real app, you'd want to confirm this action
    if (confirm("Are you sure you want to reset your progress?")) {
      // Would need a mutation to clear progress
    }
  };

  if (!painting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading painting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 mt-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-channel/paint-by-numbers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{painting.title}</h2>
            <p className="text-sm text-muted-foreground">
              Select a color, then click the matching numbers
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Color Palette */}
          <Card className="p-4 lg:col-span-1">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Color Palette
            </h3>
            <div className="space-y-2">
              {painting.image_data.colors?.map((color) => (
                <button
                  key={color.number}
                  onClick={() => setSelectedColor(color.number)}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedColor === color.number
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-gray-300 hover:border-primary"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded border-2 border-gray-300"
                    style={{ backgroundColor: color.color }}
                  />
                  <div className="text-left flex-1">
                    <div className="font-bold text-lg">{color.number}</div>
                    <div className="text-sm text-muted-foreground">{color.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Canvas and Preview */}
          <Card className="p-4 lg:col-span-3">
            {templateImage && coloredPreview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Colored Preview */}
                <div>
                  <h4 className="font-semibold mb-2 text-center">Preview</h4>
                  <img 
                    src={coloredPreview} 
                    alt="Colored preview"
                    className="w-full rounded-lg border-2 border-gray-300"
                  />
                </div>
                
                {/* Paint-by-numbers Canvas */}
                <div>
                  <h4 className="font-semibold mb-2 text-center">Your Canvas</h4>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      onClick={handleCanvasClick}
                      className="w-full border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                    {selectedColor && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-lg text-sm">
                        Color: {selectedColor}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Generating paint-by-numbers images...</p>
              </div>
            )}
            
            {!selectedColor && templateImage && (
              <div className="text-center mt-4 text-muted-foreground">
                ← Select a color from the palette to start painting
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
