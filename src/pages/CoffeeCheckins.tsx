import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoffeeCreditsDisplay } from '@/components/coffee/CoffeeCreditsDisplay';
import { CafeList } from '@/components/coffee/CafeList';
import { CheckinForm } from '@/components/coffee/CheckinForm';
import { ReviewsList } from '@/components/coffee/ReviewsList';
import { CoffeeLeaderboard } from '@/components/coffee/CoffeeLeaderboard';

const CoffeeCheckins = () => {
  const [selectedCafe, setSelectedCafe] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-black mb-2">Coffee Check-ins & Reviews</h1>
        <p className="text-muted-foreground">Discover cafes, share your experiences, and earn rewards</p>
      </div>

      <div className="mb-6">
        <CoffeeCreditsDisplay />
      </div>

      <Tabs defaultValue="cafes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cafes">Cafes</TabsTrigger>
          <TabsTrigger value="checkin">Check In</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
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