import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Volume2, VolumeX, BookOpen, Loader2, Plus, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useKidsStoryCredits } from "@/hooks/useKidsStoryCredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StorybookDisplayProps {
  story: {
    title: string;
    story: string;
    illustration?: string;
    characters?: string;
    illustrationStyle?: string;
  };
  onSave: () => void;
  onContinue?: () => void;
  showContinue?: boolean;
  continuingStory?: boolean;
}

const ILLUSTRATE_COST = 2;

export const StorybookDisplay = ({ story, onSave, onContinue, showContinue, continuingStory }: StorybookDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingPage, setReadingPage] = useState<number | null>(null);
  const [pageIllustrations, setPageIllustrations] = useState<Record<number, string>>({});
  const [illustratingPage, setIllustratingPage] = useState<number | null>(null);
  const [illustratingAll, setIllustratingAll] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { refresh: refreshCredits, balance: storyCredits } = useKidsStoryCredits();

  // Split story into pages (~150 words each)
  const words = (story.story || "").trim().split(/\s+/).filter(Boolean);
  const WORDS_PER_PAGE = 120;
  const pages: string[] = [];

  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push(words.slice(i, i + WORDS_PER_PAGE).join(" "));
  }
  if (pages.length === 0) pages.push("(This story is empty.)");

  const totalPages = pages.length;

  const stopPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
    setReadingPage(null);
  };

  const speakWithBrowser = (text: string, pageIndex: number): boolean => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
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
      return true;
    } catch (err) {
      console.error("Browser TTS error:", err);
      return false;
    }
  };

  const handleReadAloud = async (pageIndex: number) => {
    if (isReading) {
      stopPlayback();
      return;
    }

    const text = pages[pageIndex];
    if (!text) {
      toast.error("Nothing to read on this page");
      return;
    }

    setIsReading(true);
    setReadingPage(pageIndex);

    try {
      const { data, error } = await supabase.functions.invoke("kids-story-tts", {
        body: { text },
      });

      if (error) throw error;

      const audioBase64: string | undefined =
        typeof data === "string" ? data : (data?.audioContent || data?.audio);

      if (!audioBase64) throw new Error("No audio returned");

      const mimeType = (data && data.mimeType) || "audio/mpeg";
      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsReading(false);
        setReadingPage(null);
      };
      audio.onerror = () => {
        setIsReading(false);
        setReadingPage(null);
      };

      await audio.play();
    } catch (err) {
      console.error("Read aloud error:", err);
      // Fallback: try the browser's built-in voice so the feature still works.
      const ok = speakWithBrowser(text, pageIndex);
      if (!ok) {
        toast.error("Read aloud is not available right now");
        setIsReading(false);
        setReadingPage(null);
      }
    }
  };

  useEffect(() => {
    return (
    <>
      <FloatingHowItWorks title={"Storybook Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Storybook Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Storybook Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const illustratePage = async (pageIndex: number): Promise<boolean> => {
    if (illustratingPage !== null) return false;
    if (storyCredits < ILLUSTRATE_COST) {
      toast.error(`You need ${ILLUSTRATE_COST} story credits to illustrate a page.`);
      return false;
    }
    setIllustratingPage(pageIndex);
    try {
      const { data, error } = await supabase.functions.invoke("kids-story-illustrate", {
        body: {
          pageText: pages[pageIndex],
          storyTitle: story.title,
          style: story.illustrationStyle || "storybook",
          characters: story.characters || "",
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const url = (data as any)?.illustration;
      if (!url) throw new Error("No illustration returned");
      setPageIllustrations((prev) => ({ ...prev, [pageIndex]: url }));
      refreshCredits();
      return true;
    } catch (err: any) {
      console.error("Illustrate error:", err);
      const msg = err?.message || "Failed to illustrate page";
      if (msg.toLowerCase().includes("insufficient")) {
        toast.error("Not enough story credits — buy more to keep illustrating.");
      } else {
        toast.error(msg);
      }
      return false;
    } finally {
      setIllustratingPage(null);
    }
  };

  const illustrateAllPages = async () => {
    const missing = pages
      .map((_, i) => i)
      .filter((i) => !pageIllustrations[i] && !(i === 0 && story.illustration));
    if (missing.length === 0) { toast.info("All pages already illustrated."); return; }
    const need = missing.length * ILLUSTRATE_COST;
    if (storyCredits < need) {
      toast.error(`Need ${need} credits to illustrate all ${missing.length} pages.`);
      return;
    }
    setIllustratingAll(true);
    let done = 0;
    for (const i of missing) {
      const ok = await illustratePage(i);
      if (!ok) break;
      done++;
    }
    setIllustratingAll(false);
    if (done > 0) toast.success(`Illustrated ${done} page${done > 1 ? "s" : ""}! 🎨`);
  };

  const currentIllustration = pageIllustrations[currentPage] || (currentPage === 0 ? story.illustration : undefined);


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
          <div className="flex flex-col items-center justify-center p-6 gap-3 bg-gradient-to-br from-white/50 to-amber-50/50 dark:from-white/5 dark:to-amber-900/10">
            {currentIllustration ? (
              <motion.img
                key={`${currentPage}-${currentIllustration.slice(-20)}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={currentIllustration}
                alt={`Illustration for page ${currentPage + 1}`}
                className="rounded-xl shadow-lg max-h-80 w-auto object-contain"
              />
            ) : illustratingPage === currentPage ? (
              <div className="flex flex-col items-center gap-2 text-amber-700 dark:text-amber-300">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-xs">Painting your scene…</span>
              </div>
            ) : (
              <div className="text-8xl animate-pulse">📖</div>
            )}
            <Button
              size="sm"
              variant={currentIllustration ? "outline" : "default"}
              onClick={() => illustratePage(currentPage)}
              disabled={illustratingPage !== null || illustratingAll}
              className="gap-2"
            >
              {illustratingPage === currentPage ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Illustrating…</>
              ) : currentIllustration ? (
                <><Wand2 className="w-4 h-4" /> Re-illustrate ({ILLUSTRATE_COST}c)</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Illustrate this page ({ILLUSTRATE_COST}c)</>
              )}
            </Button>
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

          <Button
            variant="outline"
            size="sm"
            onClick={illustrateAllPages}
            disabled={illustratingAll || illustratingPage !== null}
            className="gap-2"
          >
            {illustratingAll ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Illustrating all…</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Illustrate all ({pages.length * ILLUSTRATE_COST}c)</>
            )}
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
