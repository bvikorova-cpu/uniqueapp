import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Sparkles, Volume2, Clock, Star } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PremiumCastleCardProps {
  castle: any;
  image: string;
  isVisited: boolean;
  hasStamp: boolean;
  countryFlag: string;
  onExplore: () => void;
  index: number;
}

const difficultyConfig: Record<string, { label: string; color: string; stars: number }> = {
  easy: { label: "Easy", color: "bg-green-500", stars: 1 },
  medium: { label: "Medium", color: "bg-amber-500", stars: 2 },
  hard: { label: "Hard", color: "bg-red-500", stars: 3 },
};

export function PremiumCastleCard({ castle, image, isVisited, hasStamp, countryFlag, onExplore, index }: PremiumCastleCardProps) {
  const difficulty = difficultyConfig[castle.difficulty] || difficultyConfig.medium;
  const estimatedTime = castle.estimated_minutes || 15;

  return (
    <>
      <FloatingHowItWorks title={"Premium Castle Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Premium Castle Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Premium Castle Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Image with parallax */}
        <div className="relative h-52 overflow-hidden">
          <motion.img
            src={image}
            alt={castle.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          />

          {/* Status badge */}
          {hasStamp ? (
            <Badge className="absolute top-3 right-3 bg-amber-500 text-white gap-1 shadow-lg">
              <Trophy className="h-3.5 w-3.5" /> Completed!
            </Badge>
          ) : isVisited ? (
            <Badge className="absolute top-3 right-3 bg-blue-500 text-white shadow-lg">
              In Progress
            </Badge>
          ) : null}

          {/* Country flag */}
          <span className="absolute top-3 left-3 text-3xl drop-shadow-lg">{countryFlag}</span>

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < difficulty.stars ? "text-amber-400 fill-amber-400" : "text-white/30"}`} />
              ))}
              <span className="text-white text-xs ml-1">{difficulty.label}</span>
            </div>
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <Clock className="h-3 w-3" /> ~{estimatedTime} min
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg leading-tight">{castle.name}</h3>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span>{castle.park_name}</span>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{castle.description}</p>

          {/* Fun fact */}
          {castle.fun_facts?.[0] && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Fun Fact</span>
              </div>
              <p className="text-xs text-muted-foreground">{castle.fun_facts[0]}</p>
            </div>
          )}

          {/* Audio guide badge */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Volume2 className="h-3.5 w-3.5 text-purple-500" />
            <span>AI Audio Guide · 8 languages</span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {castle.price_coins} 🪙
            </span>
            <Button
              onClick={onExplore}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
            >
              {hasStamp ? "Tour Again" : isVisited ? "Continue" : "Explore"} →
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}
