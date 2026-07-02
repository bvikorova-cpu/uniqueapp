import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface BasketballToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  credits?: number;
  gradient: string;
  iconColor: string;
  onClick: () => void;
  delay: number;
}

export function BasketballToolCard({ icon: Icon, title, description, badge, credits, gradient, iconColor, onClick, delay }: BasketballToolCardProps) {
  return (
    <><FloatingHowItWorks title="BasketballToolCard — How it works" steps={[{title:"Open this section",desc:"Access BasketballToolCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Card className="cursor-pointer h-full hover:shadow-lg hover:shadow-primary/10 transition-all border-border/50 hover:border-primary/30 group" onClick={onClick}>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 border border-border/30`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-bold text-sm truncate">{title}</h3>
                {badge && <Badge variant={badge === "AI" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0 h-4">{badge}</Badge>}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
              {credits && <p className="text-[10px] text-primary mt-1">{credits} credits/use</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </>
  );
}
