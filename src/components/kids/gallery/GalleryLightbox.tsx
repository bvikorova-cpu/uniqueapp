import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface LightboxItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  date: string;
}

interface GalleryLightboxProps {
  items: LightboxItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDownload: (url: string, name: string) => void;
  onFavorite: (id: string) => void;
  isFavorited: boolean;
}

export function GalleryLightbox({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onDownload,
  onFavorite,
  isFavorited,
}: GalleryLightboxProps) {
  if (!isOpen || items.length === 0) return null;
  const item = items[currentIndex];
  if (!item) return null;

  return (
    <>
      <FloatingHowItWorks title={"Gallery Lightbox - How it works"} steps={[{ title: 'Open', desc: 'Access the Gallery Lightbox section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gallery Lightbox.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Nav arrows */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10 z-10"
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}
        {currentIndex < items.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/10 z-10"
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        {/* Image */}
        <motion.div
          key={item.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-4xl max-h-[80vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
          />

          {/* Info bar */}
          <div className="mt-4 flex items-center justify-between text-white px-2">
            <div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.category} · {item.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => onFavorite(item.id)}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => onDownload(item.imageUrl, `${item.title}.png`)}
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Counter */}
          <p className="text-center text-white/40 text-sm mt-2">
            {currentIndex + 1} / {items.length}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
