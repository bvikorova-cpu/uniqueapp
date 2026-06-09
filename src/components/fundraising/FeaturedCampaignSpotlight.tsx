import { motion } from "framer-motion";
import { Clock, Heart, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function FeaturedCampaignSpotlight() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Featured Campaign</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg overflow-hidden"
        >
          {/* Urgent badge */}
          <div className="mb-3 flex justify-end sm:absolute sm:top-4 sm:right-4 sm:mb-0">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              Urgent
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Your Campaign Could Be Here</h3>
              <p className="text-muted-foreground">
                Create a campaign and get featured to reach more supporters from the community.
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal progress</span>
                <span className="font-bold text-foreground">0%</span>
              </div>
              <Progress value={0} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>€0 raised</span>
                <span>Goal: set your own</span>
              </div>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>You set the deadline</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Community support</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Share & grow</span>
              </div>
            </div>

            <Button className="w-full sm:w-auto" onClick={() => { window.location.href = "/fundraising?tool=create-campaign"; }}>
              <Star className="mr-2 h-4 w-4" /> Start Your Campaign
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
