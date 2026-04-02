import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CafeList } from '@/components/coffee/CafeList';
import { CheckinForm } from '@/components/coffee/CheckinForm';
import { ReviewsList } from '@/components/coffee/ReviewsList';
import { CoffeeLeaderboard } from '@/components/coffee/CoffeeLeaderboard';
import { Coffee, MapPin, Star, Trophy } from 'lucide-react';

const CoffeeCheckins = () => {
  const [selectedCafe, setSelectedCafe] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-500/60 bg-card/80 backdrop-blur-md mb-3 animate-pulse">
          <Coffee className="h-5 w-5 text-amber-400" />
          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(30 80% 50%), hsl(var(--accent)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Coffee Check-ins & Reviews
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">Discover cafes, share your experiences, and earn rewards</p>
      </div>

      <div className="mb-6">
        <CoffeeCreditsDisplay />
      </div>

      <Tabs defaultValue="cafes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-xl border border-amber-500/20">
          <TabsTrigger value="cafes" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />Cafes
          </TabsTrigger>
          <TabsTrigger value="checkin" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <Coffee className="h-3 w-3 sm:h-4 sm:w-4" />Check In
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />Reviews
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />Top
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cafes" className="mt-6">
          <CafeList onSelectCafe={setSelectedCafe} />
        </TabsContent>

        <TabsContent value="checkin" className="mt-6">
          <CheckinForm selectedCafeId={selectedCafe} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewsList />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <CoffeeLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoffeeCheckins;
