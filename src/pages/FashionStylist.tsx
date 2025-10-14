import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WardrobeManager } from "@/components/fashion/WardrobeManager";
import { OutfitRecommender } from "@/components/fashion/OutfitRecommender";
import { VirtualTryOn } from "@/components/fashion/VirtualTryOn";
import { CapsuleWardrobe } from "@/components/fashion/CapsuleWardrobe";
import { ShoppingWishlist } from "@/components/fashion/ShoppingWishlist";
import { Shirt, Sparkles, Camera, Package, ShoppingBag } from "lucide-react";

const FashionStylist = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Virtual Fashion Stylist
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your personal fashion consultant powered by advanced styling algorithms
            </p>
          </div>

          <Tabs defaultValue="wardrobe" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="wardrobe" className="gap-2">
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">Wardrobe</span>
              </TabsTrigger>
              <TabsTrigger value="outfits" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Outfits</span>
              </TabsTrigger>
              <TabsTrigger value="tryon" className="gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Try-On</span>
              </TabsTrigger>
              <TabsTrigger value="capsule" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Capsule</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wardrobe" className="space-y-4">
              <WardrobeManager />
            </TabsContent>

            <TabsContent value="outfits" className="space-y-4">
              <OutfitRecommender />
            </TabsContent>

            <TabsContent value="tryon" className="space-y-4">
              <VirtualTryOn />
            </TabsContent>

            <TabsContent value="capsule" className="space-y-4">
              <CapsuleWardrobe />
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-4">
              <ShoppingWishlist />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FashionStylist;