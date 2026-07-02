import { useEffect, useRef } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SimilarityHeatmapProps {
  userImageUrl: string;
  matchImageUrl: string;
  similarity: number;
}

export const SimilarityHeatmap = ({ 
  userImageUrl, 
  matchImageUrl, 
  similarity 
}: SimilarityHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const userImageRef = useRef<HTMLImageElement>(null);
  const matchImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const userImage = userImageRef.current;
    const matchImage = matchImageRef.current;
    
    if (!canvas || !userImage || !matchImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawHeatmap = () => {
      const maxWidth = 800;
      const padding = 40;
      const imageWidth = Math.min(maxWidth / 2 - padding * 1.5, 400);
      const imageHeight = (imageWidth * userImage.naturalHeight) / userImage.naturalWidth;

      canvas.width = imageWidth * 2 + padding * 3;
      canvas.height = imageHeight + padding * 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw user image
      ctx.drawImage(userImage, padding, padding, imageWidth, imageHeight);

      // Draw match image
      ctx.drawImage(matchImage, imageWidth + padding * 2, padding, imageWidth, imageHeight);

      // Define heatmap regions with varying intensities
      const heatmapRegions = [
        // Eyes region - highest similarity
        { 
          x: 0.3, y: 0.35, width: 0.4, height: 0.15, 
          intensity: similarity > 85 ? 0.9 : similarity > 75 ? 0.7 : 0.5 
        },
        // Nose region
        { 
          x: 0.42, y: 0.45, width: 0.16, height: 0.2, 
          intensity: similarity > 80 ? 0.8 : similarity > 70 ? 0.6 : 0.4 
        },
        // Mouth region
        { 
          x: 0.35, y: 0.68, width: 0.3, height: 0.12, 
          intensity: similarity > 75 ? 0.85 : similarity > 65 ? 0.65 : 0.45 
        },
        // Jawline region
        { 
          x: 0.25, y: 0.6, width: 0.5, height: 0.35, 
          intensity: similarity > 70 ? 0.7 : similarity > 60 ? 0.5 : 0.3 
        },
        // Forehead region
        { 
          x: 0.3, y: 0.15, width: 0.4, height: 0.2, 
          intensity: similarity > 65 ? 0.6 : similarity > 55 ? 0.4 : 0.2 
        },
      ];

      // Draw heatmap overlays on both images
      [padding, imageWidth + padding * 2].forEach(xOffset => {
        heatmapRegions.forEach(region => {
          const x = xOffset + region.x * imageWidth;
          const y = padding + region.y * imageHeight;
          const width = region.width * imageWidth;
          const height = region.height * imageHeight;

          // Create gradient for heatmap effect
          const gradient = ctx.createRadialGradient(
            x + width / 2, y + height / 2, 0,
            x + width / 2, y + height / 2, Math.max(width, height) / 2
          );

          // Color based on intensity (red = high similarity, blue = low similarity)
          const hue = region.intensity > 0.7 ? 0 : region.intensity > 0.5 ? 30 : 210;
          gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${region.intensity * 0.6})`);
          gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, width, height);
        });
      });

      // Draw connecting lines for matching features
      const connectionPoints = [
        { x: 0.4, y: 0.4 },  // Left eye
        { x: 0.6, y: 0.4 },  // Right eye
        { x: 0.5, y: 0.55 }, // Nose
        { x: 0.5, y: 0.74 }, // Mouth
      ];

      connectionPoints.forEach(point => {
        const x1 = padding + point.x * imageWidth;
        const y1 = padding + point.y * imageHeight;
        const x2 = imageWidth + padding * 2 + point.x * imageWidth;
        const y2 = padding + point.y * imageHeight;

        ctx.strokeStyle = `hsla(${similarity > 75 ? 120 : similarity > 65 ? 45 : 0}, 70%, 50%, 0.4)`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw labels
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('You', padding + imageWidth / 2, padding - 10);
      ctx.fillText('Historical Match', imageWidth + padding * 2 + imageWidth / 2, padding - 10);

      // Draw legend
      const legendY = canvas.height - padding + 20;
      const legendX = canvas.width / 2;
      
      ctx.textAlign = 'center';
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.fillText('Heatmap: Red = High Similarity, Blue = Low Similarity', legendX, legendY);
    };

    const imagesLoaded = () => {
      return userImage.complete && matchImage.complete;
    };

    if (imagesLoaded()) {
      drawHeatmap();
    } else {
      userImage.onload = () => {
        if (matchImage.complete) drawHeatmap();
      };
      matchImage.onload = () => {
        if (userImage.complete) drawHeatmap();
      };
    }

    return () => {
      userImage.onload = null;
      matchImage.onload = null;
    };
  }, [userImageUrl, matchImageUrl, similarity]);

  return (
    <div className="relative w-full overflow-x-auto">
      <img
        ref={userImageRef}
        src={userImageUrl}
        alt="User"
        className="hidden"
      />
      <img
        ref={matchImageRef}
        src={matchImageUrl}
        alt="Match"
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg border border-border"
      />
    </div>
  );
};
