import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, MessageCircle } from "lucide-react";
import { CoffeeSwipeDeck } from "./CoffeeSwipeDeck";
import { CoffeeChatsList } from "./CoffeeChatsList";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * Coffee Buddy — dating-style swiping for "spoločné kávičkovanie".
 * Fully credit-based: ✗ is free, ✓ costs credits and opens a chat where
 * paid credit gifts can be sent.
 */
export const BuddyMatches = () => {
  return (
    <>
      <FloatingHowItWorks
        title="Coffee Buddy - How it works"
        steps={[
          { title: "Browse", desc: "See coffee lovers looking for a coffee date, one card at a time." },
          { title: "Swipe", desc: "Tap ✗ to skip for free, or ✓ to spend 2 credits and open a chat instantly." },
          { title: "Chat", desc: "Write to your coffee buddy and arrange where to meet." },
          { title: "Gift", desc: "Send paid coffee gifts inside the chat — each gift costs credits." },
        ]}
      />
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-xl border border-amber-500/20 mb-6">
          <TabsTrigger
            value="discover"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm"
          >
            <Coffee className="h-3 w-3 sm:h-4 sm:w-4" /> Discover
          </TabsTrigger>
          <TabsTrigger
            value="chats"
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-1 text-xs sm:text-sm"
          >
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" /> Chats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          <CoffeeSwipeDeck />
        </TabsContent>
        <TabsContent value="chats">
          <CoffeeChatsList />
        </TabsContent>
      </Tabs>
    </>
  );
};
