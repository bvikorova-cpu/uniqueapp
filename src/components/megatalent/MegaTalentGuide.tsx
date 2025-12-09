import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Upload, Heart, MessageCircle, Trophy, Users, Gift, Crown, Sparkles } from "lucide-react";

export const MegaTalentGuide = () => {
  return (
    <Card className="mb-8 bg-gradient-to-br from-background to-muted/30 border-primary/20">
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
          <AccordionItem value="overview" className="border rounded-lg px-4 bg-card/50">
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

          <AccordionItem value="subscriptions" className="border rounded-lg px-4 bg-card/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>Subscription Plans</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                  <Star className="h-4 w-4 text-primary" /> Premium Plan - €10/month
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Unlimited talent submissions</li>
                  <li>Access to all 30+ talent categories</li>
                  <li>Vote on other participants' entries</li>
                  <li>Comment and interact with the community</li>
                  <li>Compete for monthly prizes</li>
                </ul>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                  <Crown className="h-4 w-4 text-amber-500" /> TOP Premium Plan - €15/month
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>All Premium features included</li>
                  <li><strong>+100,000 bonus votes</strong> to boost your entries</li>
                  <li><strong>+50% increased winning chance</strong></li>
                  <li>Priority placement in category feeds</li>
                  <li>Exclusive TOP Premium badge</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories" className="border rounded-lg px-4 bg-card/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Talent Categories</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>Choose from 7 main groups with 30+ specific categories:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="bg-muted/50 p-2 rounded">
                  <strong>🎨 Art & Creativity:</strong> Drawing, Painting, Digital Art, Photography, Makeup Art, Tattoo Design
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>🎤 Music:</strong> Singing, Instruments, DJ/Production, Beatbox, Rap/Freestyle
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>💃 Dance & Movement:</strong> Dance, Breakdance, Gymnastics, Parkour
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>💪 Sports & Fitness:</strong> Training, Yoga, Martial Arts, Extreme Sports
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>😂 Entertainment:</strong> Comedy, Stand-up, Magic, Impressions, Pranks
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>💡 Education:</strong> Tutorials, Cooking, DIY, Science Experiments
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="uploading" className="border rounded-lg px-4 bg-card/50">
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
              <div className="bg-blue-500/10 p-3 rounded-lg mt-2">
                <p className="text-sm">
                  <strong>💡 Tips for better submissions:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>Use high-quality photos or videos</li>
                  <li>Good lighting makes a big difference</li>
                  <li>Write engaging descriptions</li>
                  <li>Choose the most appropriate category</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="voting" className="border rounded-lg px-4 bg-card/50">
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
                <li>TOP Premium users get +100,000 bonus votes added to their total</li>
                <li>You can remove your vote by clicking the heart again</li>
              </ul>
              <p className="mt-2">
                <strong>Commenting:</strong> Click the 💬 comment icon to leave feedback and encouragement 
                for other participants. Building community connections can help you gain more visibility!
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prizes" className="border rounded-lg px-4 bg-card/50">
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
              <div className="bg-amber-500/10 p-3 rounded-lg mt-2">
                <p className="text-sm">
                  <strong>🏆 Prize Structure:</strong> Winners in each category receive cash prizes 
                  and recognition. The more votes you accumulate, the higher your chances of winning!
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="referral" className="border rounded-lg px-4 bg-card/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span>Referral Program</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p><strong>Earn money by inviting friends!</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Get your unique referral code from the Referral tab</li>
                <li>Share it with friends via social media or direct message</li>
                <li>Earn commission when they subscribe</li>
                <li>Track your earnings and referred users in real-time</li>
                <li>Request withdrawal once you reach the minimum threshold</li>
              </ul>
              <div className="bg-green-500/10 p-3 rounded-lg mt-2">
                <p className="text-sm">
                  <strong>💰 How it works:</strong> When someone uses your referral code to subscribe, 
                  you earn a percentage of their subscription fee. The more people you refer, 
                  the more you earn!
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tips" className="border rounded-lg px-4 bg-card/50">
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
  );
};
