import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro, Users, Swords, Gift, Trophy, Lock, BookOpen, Sparkles, Volume2 } from 'lucide-react';

export default function ShadowArena() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          🎭 Shadow Arena
        </h1>
        <p className="text-muted-foreground text-lg">
          Horror Platform: Community Storytelling Meets Creator Battle Arena
        </p>
      </div>

      {/* Overview */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-background via-background to-primary/5">
        <h2 className="text-2xl font-bold mb-3">Platform Overview</h2>
        <p className="text-muted-foreground">
          This section combines community sharing with a paid arena for creator battles, 
          generating recurring revenue through subscriptions, entry fees, and a unique gifting system.
        </p>
      </Card>

      {/* Section I: Basic Community */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Lock className="h-8 w-8 text-primary" />
          I. Basic Community & Monetization (Paywall)
        </h2>

        {/* Entry Subscription */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Euro className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🔑 Section Entry (Monthly Subscription)</h3>
              <Badge className="mb-3" variant="secondary">Shadow Arena Hub</Badge>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <p className="font-semibold text-primary">Fee: €2.00/month</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Purpose:</strong> Ensures stable recurring revenue and filters out unwanted/non-serious users
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Subscriber Benefits:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Access to entire story archive</li>
                    <li>✓ Unlimited Battle viewing</li>
                    <li>✓ Voting rights</li>
                    <li>✓ Submit your own stories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Anonymous Story Sharing */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">📝 Anonymous Story Sharing (Echoes of Fear)</h3>
              
              <div className="space-y-4 mt-4">
                <div>
                  <p className="font-semibold mb-2">Flow:</p>
                  <p className="text-sm text-muted-foreground">
                    Users submit their real-life scary experiences anonymously
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Enhancement:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-sm">Atmospheric AI Illustrations</p>
                        <p className="text-xs text-muted-foreground">Generate 2-3 dark images per story</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Volume2 className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-sm">Ambient AI Sounds</p>
                        <p className="text-xs text-muted-foreground">Create unique soundtracks for immersion</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">Community Voting (Free):</p>
                  <p className="text-sm text-muted-foreground">
                    Voting system determines "Top of the Week" stories, qualifying them for Battles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Section II: Battle Arena */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Swords className="h-8 w-8 text-primary" />
          II. The Battle Arena (Gamification & Main Monetization)
        </h2>
        <p className="text-muted-foreground mb-6">
          The heart of the platform, generating primary profit and viral reach.
        </p>

        {/* Battle Principle */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Swords className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">⚔️ Battle Principle</h3>
              
              <div className="space-y-4 mt-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="font-semibold text-primary mb-2">Entry Fee: €1.00 per creator, per battle</p>
                  <p className="text-sm text-muted-foreground">
                    Fee motivates serious participation and commitment
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Mechanism:</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Two selected (or volunteer) creators receive the same AI-generated horror challenge</li>
                    <li>• Challenge includes theme, keywords, and environment</li>
                    <li>• Time limit: 1 hour to create the scariest story</li>
                  </ul>
                </div>

                <div className="bg-accent/5 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Anonymity:</p>
                  <p className="text-sm text-muted-foreground">
                    Stories published anonymously (A vs. B). During voting, no one knows who wrote which story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Gifting System */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <Gift className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">💲 Monetization via Gifting System</h3>
              
              <div className="space-y-4 mt-4">
                <div>
                  <p className="font-semibold mb-2">Voting Mechanism:</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Users don't vote for free - they vote through paid digital Gifts purchased with real money
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-3">Gift Examples:</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm mb-1">👻 Faint Whisper</p>
                      <p className="text-primary font-bold">€0.10</p>
                      <p className="text-xs text-muted-foreground">Light vote weight</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm mb-1">😱 Scream</p>
                      <p className="text-primary font-bold">€0.50</p>
                      <p className="text-xs text-muted-foreground">Medium vote weight</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-sm mb-1">💰 Golden Fear Chest</p>
                      <p className="text-primary font-bold">€5.00</p>
                      <p className="text-xs text-muted-foreground">Heavy vote weight</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Prize Pool Mechanics:</p>
                  <p className="text-sm text-muted-foreground">
                    The sum of all Gifts sent during a Battle forms the Prize Pool for that battle
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Winner Reward */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🏆 Winner Reward</h3>
              
              <div className="space-y-4 mt-4">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                  <p className="font-bold text-lg mb-2">Winner Takes 80%</p>
                  <p className="text-sm text-muted-foreground">
                    The winner (story with highest Gift value) receives 80% of the total Prize Pool 
                    (after deducting €1 entry fees) credited as Credits/Quanta (platform digital currency)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      Platform Monetization:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 20% commission from Prize Pool</li>
                      <li>• + Entry Fees from both creators</li>
                      <li>• Revenue for infrastructure & organization</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Credits/Quanta Benefits:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Winnings in credits motivate creators to reinvest in the platform 
                      (custom commissions, premium services), generating additional revenue streams
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Revenue Streams Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Monthly Subscriptions</p>
            <p className="text-2xl font-bold text-primary">€2.00</p>
            <p className="text-xs text-muted-foreground">per user/month</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Battle Entry Fees</p>
            <p className="text-2xl font-bold text-primary">€1.00</p>
            <p className="text-xs text-muted-foreground">per creator/battle</p>
          </div>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Gift Commissions</p>
            <p className="text-2xl font-bold text-primary">20%</p>
            <p className="text-xs text-muted-foreground">of prize pool</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
