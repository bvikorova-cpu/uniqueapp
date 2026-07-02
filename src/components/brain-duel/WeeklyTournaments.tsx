import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Clock, Users, Crown, Star, Flame, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WeeklyTournamentsProps {
  currentStreak?: number;
}

export const WeeklyTournaments = ({ currentStreak = 0 }: WeeklyTournamentsProps) => {
  const navigate = useNavigate();
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + (7 - now.getDay()));
  weekEnd.setHours(23, 59, 59);
  const daysLeft = Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <FloatingHowItWorks title={"Weekly Tournaments - How it works"} steps={[{ title: 'Open', desc: 'Access the Weekly Tournaments section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weekly Tournaments.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Current Weekly Event */}
      <Card className="relative overflow-hidden border-2 border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-cyan-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Tournament
            </CardTitle>
            <Badge className="bg-primary/15 text-primary border-primary/30 gap-1">
              <Clock className="h-3 w-3" /> {daysLeft} days left
            </Badge>
          </div>
          <CardDescription>Compete this week for exclusive rewards</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Crown, title: "1st Place", reward: "500 Credits + Badge", bg: "bg-yellow-500/10 border-yellow-500/20", color: "text-yellow-500" },
              { icon: Trophy, title: "2nd Place", reward: "300 Credits", bg: "bg-slate-400/10 border-slate-400/20", color: "text-slate-400" },
              { icon: Star, title: "3rd Place", reward: "150 Credits", bg: "bg-amber-600/10 border-amber-600/20", color: "text-amber-600" },
            ].map((place, i) => (
              <motion.div
                key={place.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`text-center p-4 rounded-xl border backdrop-blur-sm ${place.bg}`}
              >
                <place.icon className={`h-6 w-6 ${place.color} mx-auto mb-2`} />
                <div className="text-sm font-bold">{place.title}</div>
                <div className="text-xs text-muted-foreground">{place.reward}</div>
              </motion.div>
            ))}
          </div>

          <Button className="w-full gap-2" onClick={() => {
            toast.success("Joining Weekly Tournament — 20 credits will be deducted at match start");
            navigate("/brain-duel?mode=tournament");
          }}>
            <Trophy className="h-4 w-4" /> Enter Weekly Tournament (20 credits)
          </Button>
        </CardContent>
      </Card>

      {/* Seasonal Events */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Seasonal Events
          </CardTitle>
          <CardDescription>Limited-time events with exclusive rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              name: "Brain Marathon",
              desc: "50 questions, no breaks, top score wins",
              reward: "1000 Credits + Marathon Badge",
              status: "active",
              participants: 142,
            },
            {
              name: "Speed Demon Challenge",
              desc: "Answer 20 questions as fast as possible",
              reward: "750 Credits + Speed Badge",
              status: "upcoming",
              participants: 0,
            },
            {
              name: "Category Master",
              desc: "Win in all 10 categories this season",
              reward: "2000 Credits + Legend Badge",
              status: "active",
              participants: 89,
            },
          ].map((event, i) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                event.status === "active" ? "border-primary/30 bg-primary/5" : "border-muted bg-muted/20"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{event.name}</h4>
                      <Badge variant={event.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {event.status === "active" ? "Live" : "Scheduled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{event.desc}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-primary">
                        <Gift className="h-3 w-3" /> {event.reward}
                      </span>
                      {event.participants > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" /> {event.participants} joined
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={event.status === "active" ? "default" : "outline"}
                    disabled={event.status !== "active"}
                  >
                    {event.status === "active" ? "Join" : "Soon"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
};