import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoffeeCreditsDisplay } from '@/components/coffee/CoffeeCreditsDisplay';
import { BuddyMatches } from '@/components/coffee/BuddyMatches';
import { CoffeeEvents } from '@/components/coffee/CoffeeEvents';
import { CoffeePreferences } from '@/components/coffee/CoffeePreferences';
import { Users, Calendar, Settings, Coffee } from 'lucide-react';

const CoffeeBuddy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 mt-12 sm:mt-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-500/60 bg-card/80 backdrop-blur-md mb-3 animate-pulse">
          <Users className="h-5 w-5 text-amber-400" />
          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(30 80% 50%), hsl(var(--accent)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Coffee Buddy Matching
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">Connect with coffee lovers who share your taste</p>
      </div>

      {/* Feature Description */}
      <div className="mb-8 p-5 sm:p-6 rounded-xl bg-card/80 backdrop-blur-xl border border-amber-500/20">
        <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
          <Coffee className="h-5 w-5" /> What is Coffee Buddy?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Coffee Buddy matches you with like-minded coffee enthusiasts for café visits, tastings, and brewing sessions.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: "☕", text: "AI-powered matching" },
            { emoji: "📍", text: "Local café discovery" },
            { emoji: "🎉", text: "Community meetups" },
            { emoji: "🏆", text: "Achievement system" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <span>{item.emoji}</span>
              <span className="text-xs">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <CoffeeCreditsDisplay />
      </div>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-xl border border-amber-500/20">
          <TabsTrigger value="matches" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />Matches
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />Events
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-6">
          <BuddyMatches />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <CoffeeEvents />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <CoffeePreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoffeeBuddy;
