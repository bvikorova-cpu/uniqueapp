import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Briefcase, Heart, Lightbulb } from "lucide-react";

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
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg sm:text-xl font-bold">Your Karmic Theme</h3>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {reading.overallKarmicTheme}
        </p>
      </Card>

      {reading.soulmateConnection && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-pink-500/5 to-rose-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-pink-500" />
            <h3 className="text-lg sm:text-xl font-bold">Soul Mate Connection</h3>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {reading.soulmateConnection}
          </p>
        </Card>
      )}

      <div className="space-y-8">
        {reading.pastLives.map((life, index) => (
          <Card key={index} className="overflow-hidden">
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

            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  Life {index + 1}
                </Badge>
                <span className="text-xl sm:text-2xl font-bold">{life.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span className="text-muted-foreground">{life.period}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">{life.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">{life.profession}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Your Story</h4>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {life.story}
                  </p>
                </div>

                <div className="bg-indigo-500/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Lightbulb className="h-4 w-4 text-indigo-500" />
                    Karmic Lesson
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {life.karmicLesson}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};