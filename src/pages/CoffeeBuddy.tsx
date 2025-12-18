import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoffeeCreditsDisplay } from '@/components/coffee/CoffeeCreditsDisplay';
import { BuddyMatches } from '@/components/coffee/BuddyMatches';
import { CoffeeEvents } from '@/components/coffee/CoffeeEvents';
import { CoffeePreferences } from '@/components/coffee/CoffeePreferences';

const CoffeeBuddy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 mt-12 sm:mt-0">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Coffee Buddy Matching</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Connect with coffee lovers who share your taste</p>
      </div>

      {/* Feature Description */}
      <div className="mb-8 p-6 bg-black/80 rounded-xl border border-amber-600/50">
        <h3 className="text-xl font-bold text-amber-400 mb-3">What is Coffee Buddy?</h3>
        <p className="text-white mb-4">
          Coffee Buddy is a social matching platform designed for coffee enthusiasts who want to connect with like-minded people. 
          Whether you're looking for a coffee tasting partner, someone to explore new cafés with, or just a friend who shares your 
          passion for the perfect brew, Coffee Buddy helps you find your ideal match.
        </p>
        
        <h4 className="text-lg font-semibold text-amber-400 mb-2">How to Use</h4>
        <ul className="text-white space-y-2 mb-4">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">1.</span>
            <span><strong>Set Your Preferences:</strong> Go to the Preferences tab to specify your favorite coffee types, brewing methods, and what you're looking for in a coffee buddy.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">2.</span>
            <span><strong>Discover Matches:</strong> Browse through your personalized matches in the Matches tab, filtered by shared coffee interests and compatibility.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">3.</span>
            <span><strong>Join Events:</strong> Participate in coffee-themed events like tastings, café tours, and brewing workshops through the Events tab.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">4.</span>
            <span><strong>Earn Credits:</strong> Check in at cafés, write reviews, and participate in events to earn coffee credits for premium features.</span>
          </li>
        </ul>

        <h4 className="text-lg font-semibold text-amber-400 mb-2">Key Features</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">☕</span>
            <span>AI-powered matching based on coffee preferences</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📍</span>
            <span>Discover local cafés and coffee spots</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🎉</span>
            <span>Coffee events and community meetups</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⭐</span>
            <span>Review and rate cafés you visit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🏆</span>
            <span>Leaderboard and achievement system</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💬</span>
            <span>Connect and chat with coffee buddies</span>
          </div>
        </div>
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