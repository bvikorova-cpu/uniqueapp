import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Trophy, Gift, Users, Crown, Zap, Target, Calendar } from "lucide-react";

export default function RewardsGuide() {
  return (
    <Card className="mb-8">
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
              <p><strong>Points (XP)</strong> are the currency of your progress on our platform. Every action you take earns you XP!</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Creating posts:</strong> +10 XP per post</li>
                <li><strong>Receiving likes:</strong> +2 XP per like</li>
                <li><strong>Commenting:</strong> +5 XP per comment</li>
                <li><strong>Daily login:</strong> +15 XP (streak bonuses available!)</li>
                <li><strong>Completing activities:</strong> Various XP rewards</li>
              </ul>
              <p className="mt-2">As you accumulate XP, you'll <strong>level up</strong>! Each level unlocks new perks and features. The higher your level, the more exclusive content and abilities you gain access to.</p>
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
              <p>Claim your <strong>Daily Reward</strong> every 24 hours to earn bonus XP!</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Day 1:</strong> Base reward (15 XP)</li>
                <li><strong>Day 2-6:</strong> Increasing rewards</li>
                <li><strong>Day 7:</strong> Weekly bonus (50+ XP!)</li>
              </ul>
              <p className="mt-2"><strong>Streak Bonus:</strong> The longer your consecutive daily claim streak, the bigger your rewards! Missing a day resets your streak, so come back every day to maximize your earnings.</p>
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
              <p><strong>Badges</strong> are special achievements that showcase your accomplishments on the platform.</p>
              <p><strong>How to earn badges:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Activity badges:</strong> Create posts, comments, and engage with content</li>
                <li><strong>Streak badges:</strong> Maintain daily login streaks</li>
                <li><strong>Social badges:</strong> Make friends, join groups, participate in events</li>
                <li><strong>Special badges:</strong> Complete unique challenges and milestones</li>
              </ul>
              <p className="mt-2">Each badge awards bonus XP when earned. Collect them all to show off your dedication!</p>
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
              <p>The <strong>Leaderboard</strong> shows the top players ranked by their total XP.</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>🥇 Gold:</strong> 1st place - The ultimate champion!</li>
                <li><strong>🥈 Silver:</strong> 2nd place - Almost at the top!</li>
                <li><strong>🥉 Bronze:</strong> 3rd place - Podium finish!</li>
              </ul>
              <p className="mt-2">Compete with other users to climb the ranks. The leaderboard updates in real-time as you earn more XP!</p>
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
              <p>The <strong>Premium Store</strong> is your destination for exclusive items and perks!</p>
              <p><strong>What you can find:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Exclusive badges:</strong> Show off rare achievements</li>
                <li><strong>Profile customizations:</strong> Stand out from the crowd</li>
                <li><strong>XP boosters:</strong> Earn points faster</li>
                <li><strong>Special features:</strong> Unlock premium functionality</li>
              </ul>
              <p className="mt-2">Items can be purchased with credits. Earn credits through activities or purchase them directly!</p>
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
              <p><strong>Maximize your rewards with these tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Log in daily:</strong> Never miss your daily reward!</li>
                <li><strong>Stay active:</strong> Post, comment, and engage regularly</li>
                <li><strong>Complete challenges:</strong> Look for special events and challenges</li>
                <li><strong>Build streaks:</strong> Consecutive days multiply your rewards</li>
                <li><strong>Explore all features:</strong> Different activities give different XP</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
