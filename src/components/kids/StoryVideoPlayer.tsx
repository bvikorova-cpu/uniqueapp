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
  sceneDuration?: number;
}

export const StoryVideoPlayer = ({ scenes, images, sceneDuration = 5 }: StoryVideoPlayerProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfLayout, setPdfLayout] = useState<'single' | 'multiple'>('single');
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [musicTheme, setMusicTheme] = useState<'lullaby' | 'adventure' | 'fairytale'>('lullaby');

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
    
    return () => {
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
    if (!isPlaying) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const advance = () => {
      if (cancelled) return;
      setCurrentScene((prev) => {
        if (prev >= scenes.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    };

    // Estimated reading time so text-only scenes are never cut short
    const words = (scenes[currentScene] || '').trim().split(/\s+/).filter(Boolean).length;
    const readingMs = Math.max(sceneDuration * 1000, (words / 2.2) * 1000);

    timer = setTimeout(advance, readingMs);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentScene, scenes, sceneDuration]);


  // Load an image (remote URL, base64 or blob) into a same-origin PNG data URL
  const loadImageData = async (
    src: string,
  ): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 1024;
      c.height = img.naturalHeight || 1024;
      const cx = c.getContext('2d');
      if (!cx) return null;
      cx.drawImage(img, 0, 0, c.width, c.height);
      return { dataUrl: c.toDataURL('image/png'), width: c.width, height: c.height };
    } catch {
      return null;
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  const handleExport = async () => {
    if (!scenes.length) return;
    setIsExporting(true);
    toast.info('Preparing video export…');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not found');

      canvas.width = 1280;
      canvas.height = 720;

      // Preload all scene images first
      const loaded = await Promise.all(images.map((src) => loadImageData(src)));
      const bitmaps = await Promise.all(
        loaded.map(async (l) => {
          if (!l) return null;
          const im = new Image();
          await new Promise((res) => {
            im.onload = res;
            im.onerror = res;
            im.src = l.dataUrl;
          });
          return im;
        }),
      );

      if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
        throw new Error('unsupported');
      }

      const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      if (!mime) throw new Error('unsupported');

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const finished = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });

      recorder.start();

      const drawScene = (idx: number, alpha: number) => {
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#0b0616';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const bmp = bitmaps[idx];
        ctx.globalAlpha = alpha;
        if (bmp) {
          const scale = Math.max(canvas.width / bmp.width, (canvas.height - 180) / bmp.height);
          const w = bmp.width * scale;
          const h = bmp.height * scale;
          ctx.drawImage(bmp, (canvas.width - w) / 2, (canvas.height - 180 - h) / 2, w, h);
        }
        ctx.globalAlpha = 1;

        // Caption band
        ctx.fillStyle = 'rgba(10, 5, 25, 0.85)';
        ctx.fillRect(0, canvas.height - 180, canvas.width, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = '28px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const lines = wrapText(ctx, scenes[idx] || '', canvas.width - 120).slice(0, 4);
        lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, canvas.height - 165 + i * 38));
      };

      const frameDelay = 1000 / 30;
      for (let i = 0; i < scenes.length; i++) {
        const totalFrames = Math.round(sceneDuration * 30);
        for (let f = 0; f < totalFrames; f++) {
          let alpha = 1;
          if (f < 10) alpha = f / 10;
          else if (f > totalFrames - 10) alpha = Math.max(0, (totalFrames - f) / 10);
          drawScene(i, alpha);
          await new Promise((r) => setTimeout(r, frameDelay));
        }
      }

      recorder.stop();
      const videoBlob = await finished;
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-video-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Video exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      if (error?.message === 'unsupported') {
        toast.error('Video export is not supported in this browser. Try the PDF export instead.');
      } else {
        toast.error('Failed to export video');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFExport = async () => {
    if (!scenes.length) return;
    setIsExportingPDF(true);
    toast.info('Creating PDF…');

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      const PURPLE: [number, number, number] = [124, 58, 237];
      const PINK: [number, number, number] = [236, 72, 153];
      const INK: [number, number, number] = [40, 32, 60];

      const loadedImages = await Promise.all(images.map((src) => loadImageData(src)));

      const decoratePage = (label: string) => {
        // soft border frame
        pdf.setDrawColor(...PURPLE);
        pdf.setLineWidth(0.8);
        pdf.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'S');
        pdf.setDrawColor(...PINK);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(11, 11, pageWidth - 22, pageHeight - 22, 3, 3, 'S');
        // footer
        pdf.setFontSize(9);
        pdf.setTextColor(150, 140, 165);
        pdf.text(label, pageWidth / 2, pageHeight - 12, { align: 'center' });
      };

      // ---- Cover page ----
      pdf.setFillColor(...PURPLE);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFillColor(...PINK);
      pdf.circle(pageWidth, 0, 70, 'F');
      pdf.circle(0, pageHeight, 60, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(34);
      pdf.text('My Story Book', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(13);
      pdf.text(
        `${scenes.length} magical scene${scenes.length === 1 ? '' : 's'}`,
        pageWidth / 2,
        pageHeight / 2 - 18,
        { align: 'center' },
      );

      const cover = loadedImages.find(Boolean);
      if (cover) {
        const w = contentWidth * 0.7;
        const h = (cover.height / cover.width) * w;
        pdf.addImage(cover.dataUrl, 'PNG', (pageWidth - w) / 2, pageHeight / 2 - 8, w, Math.min(h, 90));
      }
      pdf.setFontSize(10);
      pdf.text(
        new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        pageWidth / 2,
        pageHeight - 24,
        { align: 'center' },
      );

      if (pdfLayout === 'single') {
        for (let i = 0; i < scenes.length; i++) {
          pdf.addPage();
          decoratePage(`Unique Story Book  ·  ${i + 1} / ${scenes.length}`);

          // Scene chip
          pdf.setFillColor(...PINK);
          pdf.roundedRect(margin, margin, 34, 9, 4.5, 4.5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text(`SCENE ${i + 1}`, margin + 17, margin + 6, { align: 'center' });

          let y = margin + 16;
          const img = loadedImages[i];
          if (img) {
            const maxH = pageHeight * 0.42;
            let w = contentWidth;
            let h = (img.height / img.width) * w;
            if (h > maxH) {
              h = maxH;
              w = (img.width / img.height) * h;
            }
            const x = (pageWidth - w) / 2;
            pdf.setFillColor(245, 240, 255);
            pdf.roundedRect(x - 2, y - 2, w + 4, h + 4, 3, 3, 'F');
            pdf.addImage(img.dataUrl, 'PNG', x, y, w, h);
            y += h + 12;
          }

          pdf.setFont('times', 'normal');
          pdf.setFontSize(13);
          pdf.setTextColor(...INK);
          const lines = pdf.splitTextToSize(scenes[i], contentWidth - 6);
          pdf.text(lines, margin + 3, y, { lineHeightFactor: 1.55 });
        }
      } else {
        const perPage = 2;
        const totalPages = Math.ceil(scenes.length / perPage);
        for (let p = 0; p < totalPages; p++) {
          pdf.addPage();
          decoratePage(`Unique Story Book  ·  page ${p + 1} / ${totalPages}`);

          const blockHeight = (pageHeight - margin * 2 - 10) / perPage;
          for (let s = 0; s < perPage; s++) {
            const idx = p * perPage + s;
            if (idx >= scenes.length) break;
            const top = margin + s * blockHeight;

            pdf.setFillColor(...PINK);
            pdf.roundedRect(margin, top, 30, 8, 4, 4, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text(`SCENE ${idx + 1}`, margin + 15, top + 5.5, { align: 'center' });

            let y = top + 13;
            const img = loadedImages[idx];
            let textX = margin;
            let textWidth = contentWidth;

            if (img) {
              const w = contentWidth * 0.42;
              const h = Math.min((img.height / img.width) * w, blockHeight - 20);
              pdf.setFillColor(245, 240, 255);
              pdf.roundedRect(margin - 1, y - 1, w + 2, h + 2, 2.5, 2.5, 'F');
              pdf.addImage(img.dataUrl, 'PNG', margin, y, w, h);
              textX = margin + w + 6;
              textWidth = contentWidth - w - 6;
            }

            pdf.setFont('times', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(...INK);
            const lines = pdf.splitTextToSize(scenes[idx], textWidth);
            const maxLines = Math.floor((blockHeight - 18) / 5.2);
            pdf.text(lines.slice(0, maxLines), textX, y + 4, { lineHeightFactor: 1.5 });

            if (s === 0 && idx + 1 < scenes.length) {
              pdf.setDrawColor(230, 220, 245);
              pdf.setLineWidth(0.4);
              pdf.line(margin, top + blockHeight - 4, pageWidth - margin, top + blockHeight - 4);
            }
          }
        }
      }

      pdf.save(`story-book-${Date.now()}.pdf`);
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
