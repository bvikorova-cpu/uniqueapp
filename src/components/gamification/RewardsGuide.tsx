import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Trophy, Gift, Users, Crown, Zap, Target, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function RewardsGuide() {
  return (
    <>
      <FloatingHowItWorks title={"Rewards Guide - How it works"} steps={[{ title: 'Open', desc: 'Access the Rewards Guide section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Rewards Guide.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="mb-8 backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Star className="h-5 w-5 text-yellow-500" />
            How Rewards Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="points">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Points & Levels
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p><strong>Points (XP)</strong> are the currency of your progress. Every action earns XP!</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Creating posts:</strong> +10 XP per post</li>
                  <li><strong>Receiving likes:</strong> +2 XP per like</li>
                  <li><strong>Commenting:</strong> +5 XP per comment</li>
                  <li><strong>Daily login:</strong> +15 XP (streak bonuses available!)</li>
                  <li><strong>Completing activities:</strong> Various XP rewards</li>
                </ul>
                <p className="mt-2">As you accumulate XP, you'll <strong>level up</strong>! Each level unlocks new perks and features.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="daily">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  Daily Rewards & Streaks
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>Claim your <strong>Daily Reward</strong> every 24 hours for bonus XP!</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Day 1:</strong> Base reward (15 XP)</li>
                  <li><strong>Day 2-6:</strong> Increasing rewards</li>
                  <li><strong>Day 7:</strong> Weekly bonus (50+ XP!)</li>
                </ul>
                <p className="mt-2"><strong>Streak Bonus:</strong> The longer your streak, the bigger the rewards! Missing a day resets it.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="badges">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Badges & Achievements
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p><strong>Badges</strong> showcase your accomplishments on the platform.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Activity badges:</strong> Create posts, comments, and engage</li>
                  <li><strong>Streak badges:</strong> Maintain daily login streaks</li>
                  <li><strong>Social badges:</strong> Make friends, join groups, participate in events</li>
                  <li><strong>Special badges:</strong> Complete unique challenges and milestones</li>
                </ul>
                <p className="mt-2">Each badge awards bonus XP when earned!</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="leaderboard">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Leaderboard
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>The <strong>Leaderboard</strong> ranks top players by total XP.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>🥇 Gold:</strong> 1st place – The ultimate champion!</li>
                  <li><strong>🥈 Silver:</strong> 2nd place – Almost at the top!</li>
                  <li><strong>🥉 Bronze:</strong> 3rd place – Podium finish!</li>
                </ul>
                <p className="mt-2">Compete with others to climb the ranks. Updates in real-time!</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="premium">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Premium Store
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>The <strong>Premium Store</strong> offers exclusive items and perks!</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Exclusive badges:</strong> Rare achievements to show off</li>
                  <li><strong>Profile customizations:</strong> Stand out from the crowd</li>
                  <li><strong>XP boosters:</strong> Earn points faster</li>
                  <li><strong>Special features:</strong> Unlock premium functionality</li>
                </ul>
                <p className="mt-2">Items are purchased with credits. Earn credits through activities or buy them directly!</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tips">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  Tips for Success
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p><strong>Maximize your rewards:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Log in daily:</strong> Never miss your daily reward!</li>
                  <li><strong>Stay active:</strong> Post, comment, and engage regularly</li>
                  <li><strong>Complete challenges:</strong> Look for special events</li>
                  <li><strong>Build streaks:</strong> Consecutive days multiply rewards</li>
                  <li><strong>Explore all features:</strong> Different activities give different XP</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
