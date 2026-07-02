import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Volume2, VolumeX, Globe, Play, Pause, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Supported languages with flags
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// Detect user's preferred language
const getDefaultLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supported = LANGUAGES.find(l => l.code === browserLang);
  return supported ? supported.code : 'en';
};

interface CastleVoiceNarrationProps {
  text: string;
  funFacts?: string[];
  cacheKey?: string;
  className?: string;
}

export function CastleVoiceNarration({ 
  text, 
  funFacts = [], 
  cacheKey = '',
  className 
}: CastleVoiceNarrationProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(getDefaultLanguage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Combine text with fun facts for full narration
  const fullNarrationText = [
    text,
    ...funFacts.map((fact, i) => `Fun fact number ${i + 1}: ${fact}`)
  ].join('. ');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update progress
  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const totalDuration = audioRef.current.duration;
      if (totalDuration > 0) {
        setProgress((currentTime / totalDuration) * 100);
        setDuration(totalDuration);
      }
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }
  };

  const handlePlay = async () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Check cache first
    const cacheId = `${cacheKey}-${selectedLanguage}`;
    if (audioCache[cacheId]) {
      playAudio(audioCache[cacheId]);
      return;
    }

    // Generate new audio
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-and-generate-audio', {
        body: {
          text: fullNarrationText,
          language: selectedLanguage,
        },
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Convert base64 to blob URL using data URI (prevents corruption)
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;

        // Cache the audio URL
        setAudioCache(prev => ({ ...prev, [cacheId]: audioUrl }));
        playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audio.volume = isMuted ? 0 : 1;
    
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
      console.error('Audio playback error');
    };

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.play();
    audioRef.current = audio;
    setIsPlaying(true);
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Stop current playback when changing language
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Main Control Row */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlay}
          size="lg"
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl min-w-[160px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="mr-2 h-5 w-5" />
              Pause Story
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              🎧 Play Story
            </>
          )}
        </Button>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/90 hover:bg-white shadow-lg min-w-[140px]"
            >
              <Globe className="mr-2 h-4 w-4" />
              {currentLang.flag} {currentLang.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white max-h-[300px] overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "cursor-pointer",
                  lang.code === selectedLanguage && "bg-purple-100"
                )}
              >
                <span className="mr-2 text-lg">{lang.flag}</span>
                {lang.name}
                {lang.code === selectedLanguage && (
                  <span className="ml-auto text-purple-600">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mute Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleMuteToggle}
          className="bg-white/90 hover:bg-white shadow-lg h-11 w-11"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-gray-500" />
          ) : (
            <Volume2 className="h-5 w-5 text-purple-600" />
          )}
        </Button>
      </div>

      {/* Progress Bar and Sound Wave */}
      {(isPlaying || progress > 0) && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
          {/* Sound Wave Animation */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-end gap-0.5 h-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-gradient-to-t from-purple-600 to-blue-500 rounded-full transition-all",
                    isPlaying ? "animate-pulse" : ""
                  )}
                  style={{
                    height: isPlaying 
                      ? `${Math.random() * 100}%` 
                      : '20%',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.5s',
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-auto">
              {duration > 0 && formatTime((progress / 100) * duration)} / {duration > 0 && formatTime(duration)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
