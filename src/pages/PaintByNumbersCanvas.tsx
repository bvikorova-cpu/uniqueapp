import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { usePaintById, useUserPaintProgress, useUpdatePaintProgress } from "@/hooks/usePaintByNumbers";
import { Progress } from "@/components/ui/progress";
import { paintThumbnails } from "@/data/paintThumbnails";
import { useGeneratePaintImage } from "@/hooks/useGeneratePaintImage";

export default function PaintByNumbersCanvas() {
  const { paintId } = useParams<{ paintId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const { data: painting } = usePaintById(paintId!);
  const { data: progress } = useUserPaintProgress(paintId);
  const updateProgress = useUpdatePaintProgress();
  const generateImage = useGeneratePaintImage();

  // Generate image if not available
  useEffect(() => {
    if (painting && !paintThumbnails[painting.title] && !painting.thumbnail_url && !generatedImage) {
      generateImage.mutate(painting.title, {
        onSuccess: (imageUrl) => {
          setGeneratedImage(imageUrl);
        }
      });
    }
  }, [painting]);

  const completedSections = progress?.completed_sections || [];
  const progressPercent = painting ? (completedSections.length / painting.total_sections) * 100 : 0;

  // Generate simple sections for demo purposes
  const generateSections = () => {
    if (!painting) return [];
    
    const sections = [];
    const cols = Math.ceil(Math.sqrt(painting.total_sections));
    const rows = Math.ceil(painting.total_sections / cols);
    const sectionWidth = canvasSize.width / cols;
    const sectionHeight = canvasSize.height / rows;
    
    for (let i = 0; i < painting.total_sections; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const colorIndex = (i % (painting.image_data.colors?.length || 8)) + 1;
      
      sections.push({
        id: i + 1,
        number: colorIndex,
        x: col * sectionWidth,
        y: row * sectionHeight,
        width: sectionWidth,
        height: sectionHeight,
        color: painting.image_data.colors?.[colorIndex - 1]?.color || "#CCCCCC",
      });
    }
    
    return sections;
  };

  const sections = generateSections();

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !painting) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw sections
    sections.forEach((section) => {
      const isCompleted = completedSections.includes(section.id);
      
      // Fill section if completed
      if (isCompleted) {
        ctx.fillStyle = section.color;
        ctx.fillRect(section.x, section.y, section.width, section.height);
      }

      // Draw border
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.strokeRect(section.x, section.y, section.width, section.height);

      // Draw number if not completed
      if (!isCompleted) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          section.number.toString(),
          section.x + section.width / 2,
          section.y + section.height / 2
        );
      }
    });
  }, [painting, completedSections, sections, canvasSize]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || selectedColor === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked section
    const clickedSection = sections.find(
      (s) => x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
    );

    if (clickedSection && clickedSection.number === selectedColor) {
      if (!completedSections.includes(clickedSection.id)) {
        updateProgress.mutate({
          paintId: paintId!,
          sectionId: clickedSection.id,
          totalSections: painting!.total_sections,
        });
      }
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/kids-channel/paint-by-numbers")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{painting.title}</h2>
              <p className="text-sm text-muted-foreground">
                Select a color, then click the matching numbers
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSections.length} / {painting.total_sections} sections
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </Card>

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

          {/* Canvas */}
          <Card className="p-4 lg:col-span-3">
            {/* Preview Image */}
            {(paintThumbnails[painting.title] || generatedImage || painting.thumbnail_url) && (
              <div className="mb-4 flex justify-center">
                <img 
                  src={paintThumbnails[painting.title] || generatedImage || painting.thumbnail_url} 
                  alt={`${painting.title} preview`}
                  className="max-w-xs rounded-lg border-2 border-gray-300 opacity-30"
                />
              </div>
            )}
            
            <div className="flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                className="border-2 border-gray-300 rounded-lg cursor-pointer max-w-full"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            
            {!selectedColor && (
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
