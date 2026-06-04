import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Upload, Heart, Trophy, Users, Gift, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const MegaTalentGuide = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="mb-8 backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            How MegaTalent Works
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete guide to showcasing your talent and winning prizes
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="overview" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>What is MegaTalent?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  <strong>MegaTalent</strong> is a talent competition platform where you can showcase your skills 
                  across 30+ categories including art, music, dance, sports, comedy, and more.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Upload photos or videos of your talent</li>
                  <li>Compete in your chosen category</li>
                  <li>Receive votes from the community</li>
                  <li>Win real prizes based on your performance</li>
                  <li>Build your audience and get discovered</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="subscriptions" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span>Subscription Plans</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <h4 className="font-semibold flex items-center gap-2 text-foreground">
                    <Star className="h-4 w-4 text-primary" /> Premium Plan – €10/month
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>Unlimited talent submissions</li>
                    <li>Access to all 30+ talent categories</li>
                    <li>Vote on other participants' entries</li>
                    <li>Comment and interact with the community</li>
                    <li>Compete for monthly prizes</li>
                  </ul>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <h4 className="font-semibold flex items-center gap-2 text-foreground">
                    <Crown className="h-4 w-4 text-amber-500" /> TOP Premium Plan – €15/month
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>All Premium features included</li>
                    <li><strong>+100% algorithmic ranking boost</strong> (real votes × 2 in leaderboard)</li>
                    <li>Priority placement in category feeds</li>
                    <li>Exclusive TOP Premium badge</li>
                    <li><strong>Referral program (€5/month per friend)</strong> – same as Premium</li>
                  </ul>

                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="categories" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Talent Categories</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>Choose from 7 main groups with 30+ specific categories:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {[
                    { icon: "🎨", title: "Art & Creativity", desc: "Drawing, Painting, Digital Art, Photography, Makeup Art, Tattoo Design" },
                    { icon: "🎤", title: "Music", desc: "Singing, Instruments, DJ/Production, Beatbox, Rap/Freestyle" },
                    { icon: "💃", title: "Dance & Movement", desc: "Dance, Breakdance, Gymnastics, Parkour" },
                    { icon: "💪", title: "Sports & Fitness", desc: "Training, Yoga, Martial Arts, Extreme Sports" },
                    { icon: "😂", title: "Entertainment", desc: "Comedy, Stand-up, Magic, Impressions, Pranks" },
                    { icon: "💡", title: "Education", desc: "Tutorials, Cooking, DIY, Science Experiments" },
                  ].map(cat => (
                    <div key={cat.title} className="bg-muted/30 p-2 rounded-lg border border-border/20">
                      <strong>{cat.icon} {cat.title}:</strong> {cat.desc}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="uploading" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <span>Uploading Your Talent</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p><strong>How to submit your talent:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Select your talent category from the dropdown menu</li>
                  <li>Click "Upload Photo" or "Upload Video" button</li>
                  <li>Add a catchy title for your submission</li>
                  <li>Write a description explaining your talent</li>
                  <li>Click "Submit Entry" to publish</li>
                </ol>
                <div className="bg-blue-500/10 p-3 rounded-xl mt-2">
                  <p className="text-sm"><strong>💡 Tips for better submissions:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Use high-quality photos or videos</li>
                    <li>Good lighting makes a big difference</li>
                    <li>Write engaging descriptions</li>
                    <li>Choose the most appropriate category</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="voting" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Voting System</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p><strong>How voting works:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Click the ❤️ heart icon to vote for a submission</li>
                  <li>You can vote for multiple entries across categories</li>
                  <li>Votes are counted toward the creator's total score</li>
                  <li>Vote count shown is always the real number — no fake/bonus votes</li>
                  <li>You can remove your vote by clicking the heart again</li>
                </ul>
                <p className="mt-2">
                  <strong>Commenting:</strong> Click the 💬 comment icon to leave feedback for other participants. 
                  Building connections can help you gain more visibility!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="prizes" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>Prizes & Winning</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p><strong>How to win:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Winners are determined by total votes received</li>
                  <li>Competitions run on a monthly cycle</li>
                  <li>TOP Premium users have +50% increased winning chance</li>
                  <li>Each category has its own competition</li>
                </ul>
                <div className="bg-amber-500/10 p-3 rounded-xl mt-2">
                  <p className="text-sm">
                    <strong>🏆 Prize Structure:</strong> Winners in each category receive cash prizes 
                    and recognition. The more votes you accumulate, the higher your chances of winning!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="referral" className="border-2 border-green-500/30 rounded-xl px-4 bg-green-500/5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-bold">Referral Program – RECURRING INCOME!</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl mb-3">
                  <p className="text-green-500 font-bold text-lg mb-2">
                    🔄 PASSIVE RECURRING INCOME – NOT A ONE-TIME BONUS!
                  </p>
                  <p>
                    When you invite a friend and they subscribe, you earn <strong className="text-green-500">€5 EVERY SINGLE MONTH</strong> as long as they remain subscribed!
                  </p>
                </div>
                <p><strong>How it works:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Get your unique referral code from the Referral tab</li>
                  <li>Share it with friends via social media or direct message</li>
                  <li className="text-green-500 font-medium">Friend subscribes in January → You get €5</li>
                  <li className="text-green-500 font-medium">Friend pays again in February → You get ANOTHER €5</li>
                  <li className="text-green-500 font-medium">Friend pays in March → ANOTHER €5... and so on!</li>
                  <li>Track your earnings and referred users in real-time</li>
                </ul>
                <div className="bg-amber-500/10 p-3 rounded-xl mt-3">
                  <p className="text-sm"><strong>💰 Earnings Examples:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm mt-2">
                    <li>10 active friends = <strong className="text-green-500">€50/month</strong> passive income</li>
                    <li>50 active friends = <strong className="text-green-500">€250/month</strong> passive income</li>
                    <li>100 active friends = <strong className="text-amber-500">€500/month</strong> passive income</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tips" className="border rounded-xl px-4 bg-card/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-pink-500" />
                  <span>Tips for Success</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Be consistent:</strong> Upload regularly to stay visible</li>
                  <li><strong>Engage with others:</strong> Vote and comment on other entries</li>
                  <li><strong>Share your submissions:</strong> Promote on social media for more votes</li>
                  <li><strong>Quality over quantity:</strong> Focus on your best work</li>
                  <li><strong>Use referrals:</strong> Grow the community and earn extra income</li>
                  <li><strong>Consider TOP Premium:</strong> The bonus votes and winning boost can make a significant difference</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
};
