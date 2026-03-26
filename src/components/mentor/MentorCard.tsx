import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MentorArea {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  features: string[];
}

interface MentorCardProps {
  area: MentorArea;
  hasSubscription: boolean;
  isOnline: boolean;
  onSelect: () => void;
  index: number;
}

export const MentorCard = ({ area, hasSubscription, isOnline, onSelect, index }: MentorCardProps) => {
  const Icon = area.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Card
        className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5
          ${hasSubscription ? "ring-2 ring-primary/50" : "hover:border-primary/30"}
          bg-card/60 backdrop-blur-sm
        `}
      >
        {/* Top gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${area.color}`} />

        {/* Glow effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        {/* Status badges */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isOnline && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px]">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              Online
            </Badge>
          )}
          {hasSubscription && (
            <Badge className="bg-primary text-primary-foreground text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className={`p-3.5 rounded-2xl bg-gradient-to-br ${area.color} shadow-lg`}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
            <div className="flex-1 pt-1">
              <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                {area.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{area.description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {area.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 + i * 0.03 }}
                className="flex items-center gap-2.5"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${area.color} flex items-center justify-center flex-shrink-0`}>
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            className={`w-full group/btn transition-all ${
              hasSubscription
                ? `bg-gradient-to-r ${area.color} hover:opacity-90 text-white`
                : ""
            }`}
            variant={hasSubscription ? "default" : "outline"}
            onClick={onSelect}
          >
            {hasSubscription ? (
              <>
                Start Session
                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            ) : (
              "Subscribe to Access"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
