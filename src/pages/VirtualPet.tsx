import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyPets } from "@/components/virtual-pet/MyPets";
import { PetShop } from "@/components/virtual-pet/PetShop";
import { PetCustomization } from "@/components/virtual-pet/PetCustomization";
import { PetBreeding } from "@/components/virtual-pet/PetBreeding";
import { PetTrading } from "@/components/virtual-pet/PetTrading";
import { MiniGames } from "@/components/virtual-pet/MiniGames";
import { Heart, Store, Palette, Dna, ArrowLeftRight, Gamepad2 } from "lucide-react";

const VirtualPet = () => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Virtual Pet Companion
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Adopt, raise, and evolve your virtual companion. Play mini-games, customize, breed, and trade!
            </p>
          </div>

          <Tabs defaultValue="pets" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="pets" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">My Pets</span>
              </TabsTrigger>
              <TabsTrigger value="shop" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Shop</span>
              </TabsTrigger>
              <TabsTrigger value="customize" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Customize</span>
              </TabsTrigger>
              <TabsTrigger value="breeding" className="gap-2">
                <Dna className="h-4 w-4" />
                <span className="hidden sm:inline">Breeding</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">Trading</span>
              </TabsTrigger>
              <TabsTrigger value="games" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Games</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pets" className="space-y-4">
              <MyPets onSelectPet={setSelectedPetId} />
            </TabsContent>

            <TabsContent value="shop" className="space-y-4">
              <PetShop />
            </TabsContent>

            <TabsContent value="customize" className="space-y-4">
              <PetCustomization selectedPetId={selectedPetId} />
            </TabsContent>

            <TabsContent value="breeding" className="space-y-4">
              <PetBreeding />
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