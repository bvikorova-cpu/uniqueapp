import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SocialShareButtons } from "@/components/shared/SocialShareButtons";
import { Clock, MapPin, Briefcase, Heart, Lightbulb, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PastLife {
  period: string;
  location: string;
  profession: string;
  name: string;
  story: string;
  karmicLesson: string;
  illustration?: string;
}

interface PastLifeResultProps {
  reading: {
    pastLives: PastLife[];
    overallKarmicTheme: string;
    soulmateConnection?: string;
  };
}

export const PastLifeResult = ({ reading }: PastLifeResultProps) => {
  return (
    <>
      <FloatingHowItWorks
        title='Past Life Result'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Result panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      {/* Karmic Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
          <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
          <div className="p-5 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-black">Your Karmic Theme</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {reading.overallKarmicTheme}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Soulmate Connection */}
      {reading.soulmateConnection && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-500" />
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-pink-500/10">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-black">Soul Mate Connection</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {reading.soulmateConnection}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Past Lives */}
      <div className="space-y-6">
        {reading.pastLives.map((life, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * (index + 1) }}
          >
            <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
              {life.illustration && (
                <div className="relative h-64 sm:h-80 overflow-hidden">
                  <img
                    src={life.illustration}
                    alt={`${life.name} in ${life.period}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>
              )}

              <div className="p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    Life {index + 1}
                  </Badge>
                  <span className="text-xl sm:text-2xl font-black">{life.name}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/20">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{life.period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/20">
                    <MapPin className="h-4 w-4 text-chart-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{life.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/20">
                    <Briefcase className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">{life.profession}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2 text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Your Story
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {life.story}
                    </p>
                  </div>

                  <div className="rounded-xl p-4 bg-primary/5 border border-primary/10">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Karmic Lesson
                    </h4>
                    <p className="text-sm text-muted-foreground">{life.karmicLesson}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Social Share */}
      <Card className="p-5 sm:p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-base sm:text-lg font-bold mb-4 text-center">Share Your Past Life Journey</h3>
        <SocialShareButtons
          title="I Discovered My Past Lives!"
          description={`I was ${reading.pastLives[0]?.name || "someone fascinating"} in ${reading.pastLives[0]?.period || "a past life"}! My karmic theme: ${reading.overallKarmicTheme.slice(0, 100)}... Discover your own past lives!`}
          hashtags={["PastLife", "Reincarnation", "KarmicJourney", "SpiritualDiscovery"]}
        />
      </Card>
    </div>
    </>
  );
};
