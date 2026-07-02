import { motion } from "framer-motion";
import { Heart, Clock, CheckCircle, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface MedicalCampaign {
  id: string;
  title: string;
  description: string;
  patient_name: string;
  diagnosis: string;
  hospital: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  verified: boolean;
  monthly_donors_count: number;
  one_time_donors_count: number;
  created_at: string;
  ends_at: string;
}

interface MedicalCampaignCardProps {
  campaign: MedicalCampaign;
  index: number;
  onNavigate: (id: string) => void;
}

const QUICK_AMOUNTS = [5, 10, 25];

export function MedicalCampaignCard({ campaign, index, onNavigate }: MedicalCampaignCardProps) {
  const [showQuickDonate, setShowQuickDonate] = useState(false);

  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);
  const daysLeft = campaign.ends_at
    ? Math.max(0, Math.ceil((new Date(campaign.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const isAlmostFunded = progress >= 80;

  return (
    <>
      <FloatingHowItWorks title={"Medical Campaign Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Campaign Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Campaign Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Urgency badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        {isUrgent && (
          <Badge className="bg-destructive/90 text-destructive-foreground text-[10px] gap-1">
            <Flame className="w-3 h-3" /> Urgent
          </Badge>
        )}
        {isAlmostFunded && (
          <Badge className="bg-green-500/90 text-white text-[10px] gap-1">
            <Zap className="w-3 h-3" /> Almost There
          </Badge>
        )}
      </div>

      {/* Verified badge */}
      {campaign.verified && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-[10px] gap-1">
            <CheckCircle className="w-3 h-3 text-primary" /> Verified
          </Badge>
        </div>
      )}

      {/* Image */}
      {campaign.image_url && (
        <div className="h-40 overflow-hidden">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title & desc */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {campaign.description}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-bold text-foreground">€{campaign.current_amount.toFixed(0)}</span>
            <span className="text-muted-foreground">of €{campaign.target_amount.toFixed(0)}</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2.5" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent opacity-50 blur-sm"
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {campaign.monthly_donors_count + campaign.one_time_donors_count} donors
          </span>
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysLeft} days left
            </span>
          )}
        </div>

        {/* Patient info */}
        <div className="pt-2 border-t border-border/30 space-y-0.5">
          <p className="text-xs"><span className="font-semibold text-foreground">Patient:</span> <span className="text-muted-foreground">{campaign.patient_name}</span></p>
          <p className="text-xs"><span className="font-semibold text-foreground">Diagnosis:</span> <span className="text-muted-foreground">{campaign.diagnosis}</span></p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 active:scale-[0.97] text-xs"
            onClick={() => onNavigate(campaign.id)}
          >
            <Heart className="mr-1.5 h-3.5 w-3.5" /> Donate
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setShowQuickDonate(!showQuickDonate)}
          >
            <Zap className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Quick donate */}
        {showQuickDonate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex gap-2"
          >
            {QUICK_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                size="sm"
                variant="secondary"
                className="flex-1 text-xs active:scale-[0.97]"
                onClick={() => onNavigate(campaign.id)}
              >
                €{amt}
              </Button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
    </>
  );
}
