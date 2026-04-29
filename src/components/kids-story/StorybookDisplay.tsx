import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Volume2, VolumeX, BookOpen, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface StorybookDisplayProps {
  story: {
    title: string;
    story: string;
    illustration?: string;
  };
  onSave: () => void;
  onContinue?: () => void;
  showContinue?: boolean;
  continuingStory?: boolean;
}

export const StorybookDisplay = ({ story, onSave, onContinue, showContinue, continuingStory }: StorybookDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingPage, setReadingPage] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Split story into pages (~150 words each)
  const words = (story.story || "").trim().split(/\s+/).filter(Boolean);
  const WORDS_PER_PAGE = 120;
  const pages: string[] = [];

  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push(words.slice(i, i + WORDS_PER_PAGE).join(" "));
  }
  if (pages.length === 0) pages.push("(This story is empty.)");

  const totalPages = pages.length;

  const handleReadAloud = (pageIndex: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Read aloud is not supported on this device");
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setReadingPage(null);
      return;
    }

    const text = pages[pageIndex];
    if (!text) {
      toast.error("Nothing to read on this page");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1.1;
      utter.lang = navigator.language || "en-US";
      utter.onend = () => {
        setIsReading(false);
        setReadingPage(null);
      };
      utter.onerror = () => {
        setIsReading(false);
        setReadingPage(null);
      };
      setIsReading(true);
      setReadingPage(pageIndex);
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error("Read aloud error:", err);
      toast.error("Read aloud failed");
      setIsReading(false);
      setReadingPage(null);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Book container */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-200/50 dark:border-amber-700/30 shadow-2xl overflow-hidden">
        {/* Book spine effect */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-300/30 dark:bg-amber-600/20 hidden md:block" />

        {/* Title bar */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <h2 className="font-bold text-lg">{story.title}</h2>
            </div>
            <span className="text-sm text-purple-200">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="md:grid md:grid-cols-2 min-h-[400px]">
          {/* Illustration side */}
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-white/50 to-amber-50/50 dark:from-white/5 dark:to-amber-900/10">
            {story.illustration ? (
              <motion.img
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={story.illustration}
                alt="Story illustration"
                className="rounded-xl shadow-lg max-h-80 w-auto object-contain"
              />
            ) : (
              <div className="text-8xl animate-pulse">📖</div>
            )}
          </div>

          {/* Text side */}
          <div className="p-6 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <p className={`text-foreground/80 leading-relaxed text-base whitespace-pre-wrap ${
                  readingPage === currentPage ? "bg-primary/5 rounded-lg p-2 border border-primary/20" : ""
                }`}>
                  {pages[currentPage]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Page controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200/50 dark:border-amber-700/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <div className="flex gap-1">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentPage ? "bg-primary scale-125" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="bg-card/50 backdrop-blur-sm px-6 py-4 border-t border-border/50 flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReadAloud(currentPage)}
            className="gap-2"
          >
            {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isReading ? "Stop Reading" : "Read Aloud"}
          </Button>

          <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
            <Download className="w-4 h-4" />
            Save Story
          </Button>

          {showContinue && (
            <Button
              size="sm"
              onClick={onContinue}
              disabled={continuingStory}
              className="gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white"
            >
              {continuingStory ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Writing Part 2...</>
              ) : (
                <><Plus className="w-4 h-4" /> Continue Story</>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
