import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Heart, AlertTriangle, MapPin, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface CrisisCampaign {
  id: string;
  crisis_type: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  verified: boolean;
  urgent: boolean;
  location: string;
  images: string[];
  supporters_count: number;
  created_at: string;
  expires_at: string;
}

const crisisTypeLabels: Record<string, string> = {
  fire: "🔥 Fire", flood: "🌊 Flood", accident: "⚠️ Accident", natural_disaster: "🌪️ Disaster", other: "🆘 Other",
};

const quickAmounts = [10, 25, 50];

export function CrisisCampaignCard({ campaign }: { campaign: CrisisCampaign }) {
  const navigate = useNavigate();
  const [showQuickDonate, setShowQuickDonate] = useState(false);
  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);
  const timeLeft = formatDistanceToNow(new Date(campaign.expires_at), { addSuffix: true });

  return (
    <>
      <FloatingHowItWorks title={"Crisis Campaign Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Campaign Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Campaign Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden h-full flex flex-col border-destructive/20 hover:shadow-xl hover:shadow-destructive/10 transition-all duration-300">
        {campaign.images?.length > 0 && (
          <div className="relative h-44 overflow-hidden">
            <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {campaign.urgent && (
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Badge variant="destructive" className="absolute top-3 left-3">
                  <AlertTriangle className="h-3 w-3 mr-1" /> URGENT
                </Badge>
              </motion.div>
            )}
            <div className="absolute top-3 right-3 flex gap-1.5">
              {campaign.verified && (
                <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>
              )}
              <Badge variant="secondary">{crisisTypeLabels[campaign.crisis_type] || "🆘 Other"}</Badge>
            </div>
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-bold text-foreground">€{campaign.current_amount.toFixed(0)}</span>
              <span className="text-muted-foreground">of €{campaign.target_amount.toFixed(0)}</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2.5" />
              <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-destructive shadow-lg shadow-destructive/50"
                style={{ left: `${Math.min(progress, 97)}%` }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{progress.toFixed(0)}% funded</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />{campaign.supporters_count}</div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
            {campaign.location && (
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /><span>{campaign.location}</span></div>
            )}
            <div className="flex items-center gap-1.5 text-destructive font-medium"><Clock className="h-3.5 w-3.5" /><span>Expires {timeLeft}</span></div>
          </div>

          {showQuickDonate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
              {quickAmounts.map((amt) => (
                <Button key={amt} size="sm" variant="outline" className="flex-1 text-xs border-destructive/30 hover:bg-destructive/10" onClick={() => navigate(`/fundraising/crisis/${campaign.id}`)}>€{amt}</Button>
              ))}
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          <Button className="flex-1" variant="destructive" onClick={() => navigate(`/fundraising/crisis/${campaign.id}`)}>
            <AlertTriangle className="mr-1.5 h-4 w-4" /> Help Now
          </Button>
          <Button variant="outline" size="icon" className="border-destructive/30 hover:bg-destructive/10" onClick={() => setShowQuickDonate(!showQuickDonate)}>
            <Heart className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
    </>
  );
}
