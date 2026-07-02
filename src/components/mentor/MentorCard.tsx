import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
    <>
      <FloatingHowItWorks title="How Mentor Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Card
        className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
          ${hasSubscription ? "ring-2 ring-primary/50 shadow-lg shadow-primary/5" : "hover:border-primary/30 hover:shadow-xl"}
          bg-card/60 backdrop-blur-sm
        `}
      >
        {/* Top gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${area.color}`} />

        {/* Animated glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />

        {/* Status badges */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {isOnline && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
              Online
            </Badge>
          )}
          {hasSubscription && (
            <Badge className="bg-gradient-to-r from-primary to-accent text-white text-[10px] px-2 py-0.5 shadow-md">
              <Crown className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`p-3.5 rounded-2xl bg-gradient-to-br ${area.color} shadow-xl`}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
            <div className="flex-1 pt-1">
              <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                {area.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
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
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${area.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            className={`w-full group/btn transition-all font-semibold ${
              hasSubscription
                ? `bg-gradient-to-r ${area.color} hover:opacity-90 text-white shadow-lg`
                : "border-2"
            }`}
            variant={hasSubscription ? "default" : "outline"}
            onClick={onSelect}
          >
            {hasSubscription ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
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
    </>
    );
};
