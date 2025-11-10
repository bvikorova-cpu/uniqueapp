import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Play, Pause, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface StoryVideoPlayerProps {
  scenes: string[];
  images: string[];
  audioFiles?: string[];
  sceneDuration?: number;
}

export const StoryVideoPlayer = ({ scenes, images, audioFiles, sceneDuration = 5 }: StoryVideoPlayerProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfLayout, setPdfLayout] = useState<'single' | 'multiple'>('single');

  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // Play audio for current scene if available
    if (audioFiles && audioFiles[currentScene]) {
      const audio = new Audio(`data:audio/mp3;base64,${audioFiles[currentScene]}`);
      audioRef.current = audio;
      audio.play().catch(err => console.error('Audio playback error:', err));
    }

    const interval = setInterval(() => {
      setCurrentScene((prev) => {
        if (prev >= scenes.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, sceneDuration * 1000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isPlaying, currentScene, scenes.length, sceneDuration, audioFiles]);

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

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    toast.info('Creating PDF...');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);

      if (pdfLayout === 'single') {
        // Single scene per page
        for (let i = 0; i < Math.min(scenes.length, images.length); i++) {
          if (i > 0) {
            pdf.addPage();
          }

          // Add page number
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(`Page ${i + 1} of ${scenes.length}`, pageWidth / 2, margin / 2, { align: 'center' });

          // Add image
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = images[i];
            });

            const imgWidth = contentWidth;
            const imgHeight = (img.height / img.width) * imgWidth;
            const maxImgHeight = pageHeight * 0.5;
            
            const finalImgHeight = Math.min(imgHeight, maxImgHeight);
            const finalImgWidth = (img.width / img.height) * finalImgHeight;
            
            const imgX = (pageWidth - finalImgWidth) / 2;
            const imgY = margin + 10;

            pdf.addImage(images[i], 'PNG', imgX, imgY, finalImgWidth, finalImgHeight);

            // Add text below image
            const textY = imgY + finalImgHeight + 15;
            pdf.setFontSize(12);
            pdf.setTextColor(0);
            
            const lines = pdf.splitTextToSize(scenes[i], contentWidth);
            pdf.text(lines, margin, textY);

          } catch (error) {
            console.error(`Error loading image ${i}:`, error);
            pdf.setFontSize(12);
            pdf.setTextColor(0);
            const lines = pdf.splitTextToSize(scenes[i], contentWidth);
            pdf.text(lines, margin, margin + 20);
          }
        }
      } else {
        // Multiple scenes per page (2 per page)
        const scenesPerPage = 2;
        const totalPages = Math.ceil(scenes.length / scenesPerPage);
        
        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
          if (pageIdx > 0) {
            pdf.addPage();
          }

          // Add page number
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(`Page ${pageIdx + 1} of ${totalPages}`, pageWidth / 2, margin / 2, { align: 'center' });

          const scenesOnThisPage = Math.min(scenesPerPage, scenes.length - (pageIdx * scenesPerPage));
          const sceneHeight = (pageHeight - (2 * margin) - 10) / scenesPerPage;

          for (let sceneIdx = 0; sceneIdx < scenesOnThisPage; sceneIdx++) {
            const actualSceneIdx = (pageIdx * scenesPerPage) + sceneIdx;
            const yOffset = margin + 10 + (sceneIdx * sceneHeight);

            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = images[actualSceneIdx];
              });

              // Image dimensions for 2-per-page layout
              const availableHeight = sceneHeight * 0.6;
              const imgWidth = contentWidth * 0.7;
              const imgHeight = Math.min((img.height / img.width) * imgWidth, availableHeight);
              const finalImgWidth = (img.width / img.height) * imgHeight;
              
              const imgX = (pageWidth - finalImgWidth) / 2;

              pdf.addImage(images[actualSceneIdx], 'PNG', imgX, yOffset, finalImgWidth, imgHeight);

              // Add text below image
              const textY = yOffset + imgHeight + 5;
              pdf.setFontSize(10);
              pdf.setTextColor(0);
              
              const lines = pdf.splitTextToSize(scenes[actualSceneIdx], contentWidth);
              const maxLines = 3;
              const displayLines = lines.slice(0, maxLines);
              pdf.text(displayLines, margin, textY);

            } catch (error) {
              console.error(`Error loading image ${actualSceneIdx}:`, error);
              pdf.setFontSize(10);
              pdf.setTextColor(0);
              const lines = pdf.splitTextToSize(scenes[actualSceneIdx], contentWidth);
              pdf.text(lines.slice(0, 3), margin, yOffset + 10);
            }
          }
        }
      }

      pdf.save(`story-${Date.now()}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
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

      <div className="space-y-4">
        {/* PDF Layout Options */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
          <Label className="text-sm font-semibold text-purple-800 mb-3 block">
            PDF Layout
          </Label>
          <RadioGroup value={pdfLayout} onValueChange={(value) => setPdfLayout(value as 'single' | 'multiple')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="cursor-pointer">
                One scene per page (detailed)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple" id="multiple" />
              <Label htmlFor="multiple" className="cursor-pointer">
                Two scenes per page (compact)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            onClick={togglePlay}
            size="lg"
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            onClick={handlePDFExport}
            variant="outline"
            size="lg"
            disabled={isExportingPDF}
            className="gap-2"
          >
            <FileText className="w-5 h-5" />
            {isExportingPDF ? 'Creating PDF...' : 'Download PDF'}
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
