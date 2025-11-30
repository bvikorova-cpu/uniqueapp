import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyPets } from "@/components/virtual-pet/MyPets";
import { PetShop } from "@/components/virtual-pet/PetShop";
import { PetCustomization } from "@/components/virtual-pet/PetCustomization";
import { PetTrading } from "@/components/virtual-pet/PetTrading";
import { MiniGames } from "@/components/virtual-pet/MiniGames";
import { Heart, Store, Palette, ArrowLeftRight, Gamepad2 } from "lucide-react";

const VirtualPet = () => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

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
          </div>

          <Tabs defaultValue="pets" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-5 mb-6 sm:mb-8">
                <TabsTrigger value="pets" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">My Pets</span>
                  <span className="sm:hidden">Pets</span>
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