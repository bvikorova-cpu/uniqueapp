import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoffeeCreditsDisplay } from '@/components/coffee/CoffeeCreditsDisplay';
import { BuddyMatches } from '@/components/coffee/BuddyMatches';
import { CoffeeEvents } from '@/components/coffee/CoffeeEvents';
import { CoffeePreferences } from '@/components/coffee/CoffeePreferences';

const CoffeeBuddy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Coffee Buddy Matching</h1>
        <p className="text-muted-foreground">Connect with coffee lovers who share your taste</p>
      </div>

      <div className="mb-6">
        <CoffeeCreditsDisplay />
      </div>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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