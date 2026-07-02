import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Crown, Star, Medal, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface WeeklyWinner {
  chef_name: string;
  avatar: string;
  category: string;
  votes: number;
  dish: string;
}

export default function MasterChefWeeklyAwards() {
  const navigate = useNavigate();
  const [currentWeek] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  });

  const categories = [
    { name: "Best Appetizer", icon: Star, color: "text-yellow-500", winners: [] as WeeklyWinner[] },
    { name: "Best Main Course", icon: Trophy, color: "text-orange-500", winners: [] as WeeklyWinner[] },
    { name: "Best Dessert", icon: Crown, color: "text-pink-500", winners: [] as WeeklyWinner[] },
    { name: "Most Creative Dish", icon: Medal, color: "text-purple-500", winners: [] as WeeklyWinner[] },
    { name: "Best Presentation", icon: Award, color: "text-cyan-500", winners: [] as WeeklyWinner[] },
    { name: "People's Choice", icon: Star, color: "text-red-500", winners: [] as WeeklyWinner[] },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Weekly Awards works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Weekly Chef Awards
          </h1>
          <p className="text-muted-foreground text-lg">Celebrating the best chefs every week</p>
          <Badge variant="outline" className="mt-3 text-sm"><Calendar className="h-3 w-3 mr-1" /> Week {currentWeek} of {new Date().getFullYear()}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                    {cat.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Voting in progress</p>
                    <p className="text-xs mt-1">Winners announced Sunday evening</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">How Weekly Awards Work</h3>
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm text-muted-foreground">
              <div><strong className="text-foreground block mb-1">1. Compete</strong>Submit your dishes throughout the week</div>
              <div><strong className="text-foreground block mb-1">2. Get Votes</strong>Community votes determine finalists</div>
              <div><strong className="text-foreground block mb-1">3. Win Awards</strong>Top chefs get badges, XP & prizes</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
