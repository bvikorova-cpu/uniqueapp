import { useEffect, useRef } from "react";

interface FacialFeatureOverlayProps {
  imageUrl: string;
  similarity: number;
}

export const FacialFeatureOverlay = ({ imageUrl, similarity }: FacialFeatureOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const displayWidth = image.width;
      const displayHeight = image.height;
      const scaleX = canvas.width / displayWidth;
      const scaleY = canvas.height / displayHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Define facial feature regions (proportional to image size)
      const features = [
        { name: 'Eyes', x: 0.3, y: 0.35, width: 0.4, height: 0.15, color: 'rgba(59, 130, 246, 0.3)' },
        { name: 'Nose', x: 0.42, y: 0.45, width: 0.16, height: 0.2, color: 'rgba(34, 197, 94, 0.3)' },
        { name: 'Mouth', x: 0.35, y: 0.68, width: 0.3, height: 0.12, color: 'rgba(168, 85, 247, 0.3)' },
        { name: 'Jawline', x: 0.25, y: 0.6, width: 0.5, height: 0.35, color: 'rgba(251, 146, 60, 0.2)' },
        { name: 'Forehead', x: 0.3, y: 0.15, width: 0.4, height: 0.2, color: 'rgba(236, 72, 153, 0.2)' },
      ];

      features.forEach(feature => {
        const x = feature.x * canvas.width;
        const y = feature.y * canvas.height;
        const width = feature.width * canvas.width;
        const height = feature.height * canvas.height;

        // Draw highlight box
        ctx.strokeStyle = feature.color.replace('0.3', '0.8').replace('0.2', '0.6');
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw filled overlay
        ctx.fillStyle = feature.color;
        ctx.fillRect(x, y, width, height);

        // Draw feature label
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(16, canvas.width * 0.025)}px sans-serif`;
        ctx.fillText(feature.name, x + 10, y + 25);
      });

      // Draw similarity indicators (dots on key facial points)
      const keyPoints = [
        { x: 0.38, y: 0.38 }, // Left eye
        { x: 0.62, y: 0.38 }, // Right eye
        { x: 0.5, y: 0.5 },   // Nose tip
        { x: 0.42, y: 0.72 }, // Left mouth corner
        { x: 0.58, y: 0.72 }, // Right mouth corner
      ];

      keyPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width, 
          point.y * canvas.height, 
          Math.max(8, canvas.width * 0.015), 
          0, 
          2 * Math.PI
        );
        ctx.fillStyle = similarity > 80 ? '#22c55e' : similarity > 70 ? '#eab308' : '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    if (image.complete) {
      drawOverlay();
    } else {
      image.onload = drawOverlay;
    }

    return () => {
      image.onload = null;
    };
  }, [imageUrl, similarity]);

  return (
    <div className="relative w-full">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Face analysis"
        className="w-full h-auto rounded-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
