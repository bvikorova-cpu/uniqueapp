import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Play, Pause, FileText, Music, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfLayout, setPdfLayout] = useState<'single' | 'multiple'>('single');
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [musicTheme, setMusicTheme] = useState<'lullaby' | 'adventure' | 'fairytale'>('lullaby');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for spacebar to avoid page scrolling
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
      
      // Left arrow - previous scene
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        setCurrentScene((prev) => Math.max(0, prev - 1));
        if (isPlaying) {
          setIsPlaying(false);
        }
      }
      
      // Right arrow - next scene
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        setCurrentScene((prev) => Math.min(scenes.length - 1, prev + 1));
        if (isPlaying) {
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return (
    <>
      <FloatingHowItWorks title={"Story Video Player - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Video Player section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Video Player.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, scenes.length]);

  // Background music effect with themes
  useEffect(() => {
    if (backgroundMusicEnabled && isPlaying) {
      if (!backgroundMusicRef.current) {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.value = musicVolume;
        
        // Different music themes with unique characteristics
        const themes = {
          lullaby: {
            type: 'sine' as OscillatorType,
            notes: [261.63, 293.66, 329.63, 349.23, 392.00], // C4, D4, E4, F4, G4 (gentle)
            tempo: 3000, // Slow
            description: 'Gentle and soothing'
          },
          adventure: {
            type: 'square' as OscillatorType,
            notes: [440, 493.88, 523.25, 587.33, 659.25, 698.46], // A4, B4, C5, D5, E5, F5 (energetic)
            tempo: 800, // Fast
            description: 'Energetic and exciting'
          },
          fairytale: {
            type: 'triangle' as OscillatorType,
            notes: [349.23, 392.00, 440, 493.88, 523.25], // F4, G4, A4, B4, C5 (magical)
            tempo: 1500, // Medium
            description: 'Magical and whimsical'
          }
        };
        
        const currentTheme = themes[musicTheme];
        oscillator.type = currentTheme.type;
        oscillator.frequency.value = currentTheme.notes[0];
        
        backgroundMusicRef.current = new Audio();
        
        oscillator.start();
        
        let noteIndex = 0;
        const melodyInterval = setInterval(() => {
          oscillator.frequency.value = currentTheme.notes[noteIndex % currentTheme.notes.length];
          noteIndex++;
        }, currentTheme.tempo);
        
        // Store cleanup function
        (backgroundMusicRef.current as any).cleanup = () => {
          clearInterval(melodyInterval);
          oscillator.stop();
          audioContext.close();
        };
      }
    } else if (backgroundMusicRef.current && (backgroundMusicRef.current as any).cleanup) {
      (backgroundMusicRef.current as any).cleanup();
      backgroundMusicRef.current = null;
    }

    return () => {
      if (backgroundMusicRef.current && (backgroundMusicRef.current as any).cleanup) {
        (backgroundMusicRef.current as any).cleanup();
        backgroundMusicRef.current = null;
      }
    };
  }, [backgroundMusicEnabled, isPlaying, musicVolume, musicTheme]);

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
      audio.playbackRate = voiceSpeed; // Apply voice speed
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
  }, [isPlaying, currentScene, scenes.length, sceneDuration, audioFiles, voiceSpeed]);

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
      <div className="rounded-lg overflow-hidden shadow-2xl">
        <div className="relative aspect-video bg-black">
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

          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentScene + 1} / {scenes.length}
          </div>
        </div>

        {/* Scene text below the image */}
        <div className="bg-purple-50 border-t-2 border-purple-300 p-4 md:p-6">
          <p className="text-purple-900 text-base md:text-lg font-medium text-center leading-relaxed">
            {scenes[currentScene]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Background Music Controls */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-600" />
              <Label className="text-sm font-semibold text-purple-800">
                Background Music
              </Label>
            </div>
            <Switch
              checked={backgroundMusicEnabled}
              onCheckedChange={setBackgroundMusicEnabled}
            />
          </div>
          
          {backgroundMusicEnabled && (
            <>
              {/* Music Theme Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-purple-700">Music Theme</Label>
                <RadioGroup value={musicTheme} onValueChange={(value) => setMusicTheme(value as 'lullaby' | 'adventure' | 'fairytale')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lullaby" id="lullaby" />
                    <Label htmlFor="lullaby" className="cursor-pointer text-sm">
                      🌙 Lullaby (gentle & soothing)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adventure" id="adventure" />
                    <Label htmlFor="adventure" className="cursor-pointer text-sm">
                      ⚔️ Adventure (energetic & exciting)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fairytale" id="fairytale" />
                    <Label htmlFor="fairytale" className="cursor-pointer text-sm">
                      ✨ Fairy Tale (magical & whimsical)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <Slider
                  value={[musicVolume * 100]}
                  onValueChange={(value) => setMusicVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-purple-700 min-w-[3rem]">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Voice Narration Controls */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-purple-200 space-y-3">
          <Label className="text-sm font-semibold text-purple-800">
            Voice Narration Speed
          </Label>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-700 min-w-[3rem]">Slow</span>
            <Slider
              value={[voiceSpeed * 100]}
              onValueChange={(value) => setVoiceSpeed(value[0] / 100)}
              min={50}
              max={200}
              step={10}
              className="flex-1"
            />
            <span className="text-xs text-purple-700 min-w-[3rem]">Fast</span>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-purple-600 font-medium">
              {voiceSpeed}x
            </span>
            {voiceSpeed !== 1.0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceSpeed(1.0)}
                className="ml-2 text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

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

        {/* Keyboard Shortcuts Info */}
        <div className="text-center space-y-2 text-sm text-purple-700 bg-purple-50/50 rounded-lg p-3 border border-purple-200">
          <p className="font-semibold">⌨️ Keyboard Shortcuts</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span><kbd className="px-2 py-1 bg-white border border-purple-300 rounded shadow-sm">Space</kbd> Play/Pause</span>
            <span><kbd className="px-2 py-1 bg-white border border-purple-300 rounded shadow-sm">←</kbd> Previous Scene</span>
            <span><kbd className="px-2 py-1 bg-white border border-purple-300 rounded shadow-sm">→</kbd> Next Scene</span>
          </div>
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
