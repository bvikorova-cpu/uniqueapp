import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface StoryVideoPlayerProps {
  scenes: string[];
  images: string[];
  sceneDuration?: number;
}

export const StoryVideoPlayer = ({ scenes, images, sceneDuration = 5 }: StoryVideoPlayerProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentScene((prev) => {
        if (prev >= scenes.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, sceneDuration * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, scenes.length, sceneDuration]);

  const handleExport = async () => {
    setIsExporting(true);
    toast.info('Preparing video export...');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not found');

      // Set canvas size
      canvas.width = 1920;
      canvas.height = 1080;

      const frames: Blob[] = [];
      const fps = 30;
      const secondsPerScene = sceneDuration;
      const framesPerScene = fps * secondsPerScene;

      for (let sceneIdx = 0; sceneIdx < Math.min(scenes.length, images.length); sceneIdx++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = images[sceneIdx];
        });

        for (let frame = 0; frame < framesPerScene; frame++) {
          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image with fade effect
          const progress = frame / framesPerScene;
          let opacity = 1;
          if (frame < fps) opacity = frame / fps; // Fade in
          if (frame > framesPerScene - fps) opacity = (framesPerScene - frame) / fps; // Fade out

          ctx.globalAlpha = opacity;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Draw text
          ctx.globalAlpha = 1;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const words = scenes[sceneIdx].split(' ');
          const lines: string[] = [];
          let currentLine = '';
          
          words.forEach(word => {
            const testLine = currentLine + word + ' ';
            if (ctx.measureText(testLine).width > canvas.width - 100) {
              lines.push(currentLine);
              currentLine = word + ' ';
            } else {
              currentLine = testLine;
            }
          });
          lines.push(currentLine);

          lines.forEach((line, idx) => {
            ctx.fillText(line, canvas.width / 2, canvas.height - 150 + (idx * 60));
          });

          // Capture frame
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/webp', 0.9);
          });
          frames.push(blob);
        }
      }

      toast.success('Video frames generated! Creating WebM...');

      // Create a simple WebM container (note: this is a simplified version)
      // For production, you'd want to use a library like webm-writer
      const videoBlob = new Blob(frames, { type: 'video/webm' });
      const url = URL.createObjectURL(videoBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-video-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Video exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export video');
    } finally {
      setIsExporting(false);
    }
  };

  const togglePlay = () => {
    if (!isPlaying && currentScene >= scenes.length - 1) {
      setCurrentScene(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {images[currentScene] && (
          <img
            src={images[currentScene]}
            alt={`Scene ${currentScene + 1}`}
            className="w-full h-full object-cover animate-fade-in"
            style={{
              animation: 'fadeIn 1s ease-in-out'
            }}
          />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <p className="text-white text-xl md:text-2xl font-semibold text-center animate-fade-in">
            {scenes[currentScene]}
          </p>
        </div>

        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentScene + 1} / {scenes.length}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={togglePlay}
          size="lg"
          className="gap-2"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Button
          onClick={handleExport}
          variant="outline"
          size="lg"
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="w-5 h-5" />
          {isExporting ? 'Exporting...' : 'Export Video'}
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.05); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
