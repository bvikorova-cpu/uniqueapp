import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MyPets } from "@/components/virtual-pet/MyPets";
import { PetShop } from "@/components/virtual-pet/PetShop";
import { PetCustomization } from "@/components/virtual-pet/PetCustomization";
import { PetTrading } from "@/components/virtual-pet/PetTrading";
import { MiniGames } from "@/components/virtual-pet/MiniGames";
import { PetBattle } from "@/components/virtual-pet/PetBattle";
import { Heart, Store, Palette, ArrowLeftRight, Gamepad2, Coins, CreditCard, Info, Star, Zap, CheckCircle, Swords } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

const VirtualPet = () => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const { credits } = useAICredits();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-8">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Virtual Pet Companion
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Adopt, raise, and evolve your virtual companion. Play mini-games, customize, breed, and trade!
            </p>
            
            {/* Credits Display and Buy Button */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{credits.credits_remaining} Credits</span>
              </div>
              <Button 
                onClick={() => navigate('/ai-credits-store')}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Buy Credits
              </Button>
            </div>
          </div>

          {/* Description Section */}
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-pink-500/20">
            <div className="flex items-start gap-3 mb-4">
              <Info className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">What is Virtual Pet Companion?</h3>
                <p className="text-sm text-muted-foreground">
                  Virtual Pet Companion is your ultimate digital pet experience! Adopt adorable virtual pets, care for them daily, watch them evolve, customize their appearance with accessories, play fun mini-games to earn rewards, battle against AI opponents, and trade rare pets with other users. Build your collection and become the ultimate pet master!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  How to Use
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• <strong>My Pets:</strong> View and care for your adopted pets</li>
                  <li>• <strong>Battle:</strong> Select up to 4 pets and fight AI opponents! Power = Level×10 + Happiness/2 + Energy/2</li>
                  <li>• <strong>Shop:</strong> Buy accessories and items for your pets</li>
                  <li>• <strong>Customize:</strong> Personalize your pets with accessories</li>
                  <li>• <strong>Trading:</strong> Trade pets with other users</li>
                  <li>• <strong>Games:</strong> Play mini-games to earn rewards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Key Features
                </h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Multiple pet species to adopt</li>
                  <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Pet Battle Arena (win XP!)</li>
                  <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Pet evolution system (level up!)</li>
                  <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Fun mini-games with rewards</li>
                  <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Player-to-player trading system</li>
                  <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Rare and legendary pets</li>
                </ul>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
              <strong>Tip:</strong> Start by adopting a Cat or Dog (20 credits each), then feed and play with them daily to level up. Battle with your pets to earn extra XP - winners get +25-40 XP per pet, even losers get +10-20 XP! Higher level pets with good happiness and energy have more battle power.
            </div>
          </Card>

          <Tabs defaultValue="pets" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-6 mb-6 sm:mb-8">
                <TabsTrigger value="pets" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">My Pets</span>
                  <span className="sm:hidden">Pets</span>
                </TabsTrigger>
                <TabsTrigger value="battle" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Swords className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Battle</span>
                  <span className="sm:hidden">Battle</span>
                </TabsTrigger>
                <TabsTrigger value="shop" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Store className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Shop</span>
                  <span className="sm:hidden">Shop</span>
                </TabsTrigger>
                <TabsTrigger value="customize" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Customize</span>
                  <span className="sm:hidden">Edit</span>
                </TabsTrigger>
                <TabsTrigger value="trading" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Trading</span>
                  <span className="sm:hidden">Trade</span>
                </TabsTrigger>
                <TabsTrigger value="games" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Games</span>
                  <span className="sm:hidden">Play</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pets" className="space-y-4">
              <MyPets onSelectPet={setSelectedPetId} />
            </TabsContent>

            <TabsContent value="battle" className="space-y-4">
              <PetBattle />
            </TabsContent>

            <TabsContent value="shop" className="space-y-4">
              <PetShop />
            </TabsContent>

            <TabsContent value="customize" className="space-y-4">
              <PetCustomization selectedPetId={selectedPetId} />
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              <PetTrading />
            </TabsContent>

            <TabsContent value="games" className="space-y-4">
              <MiniGames selectedPetId={selectedPetId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VirtualPet;