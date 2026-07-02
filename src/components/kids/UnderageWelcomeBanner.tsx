import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Heart, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STORAGE_KEY = "kids-underage-banner-dismissed";

export const UnderageWelcomeBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <>
      <FloatingHowItWorks title={"Underage Welcome Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Underage Welcome Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Underage Welcome Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="mb-6 relative overflow-hidden rounded-3xl border-4 border-white/70 bg-gradient-to-br from-pink-100/95 via-purple-100/95 to-blue-100/95 backdrop-blur-md shadow-2xl"
          role="region"
          aria-label="Welcome banner for younger users"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/80 hover:bg-white p-1.5 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-purple-700" />
          </button>

          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="bg-white rounded-full w-16 h-16 flex-shrink-0 flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-purple-500" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-purple-900 mb-1 flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Hi! This is your safe space ✨
              </h2>
              <p className="text-sm text-purple-800/90 leading-relaxed">
                Kids Channel is a <strong>safe mode for ages 6–12</strong> with parental controls,
                no scary stuff, and no adult content. Grown-ups approve sensitive features with a
                quick parent check. <Heart className="w-3.5 h-3.5 inline text-pink-500" /> Have fun
                exploring!
              </p>
            </div>

            <Button
              onClick={handleDismiss}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md flex-shrink-0"
            >
              Got it!
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};
