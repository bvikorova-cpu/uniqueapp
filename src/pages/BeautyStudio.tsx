import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Palette, ShoppingBag, BookOpen } from "lucide-react";
import { VirtualMakeup } from "@/components/beauty/VirtualMakeup";
import { HairStyleGenerator } from "@/components/beauty/HairStyleGenerator";
import { NailArtDesigner } from "@/components/beauty/NailArtDesigner";
import { ProductRecommender } from "@/components/beauty/ProductRecommender";
import { MakeupTutorials } from "@/components/beauty/MakeupTutorials";

const BeautyStudio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            ✨ Virtual Beauty Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try different makeup looks, hairstyles and get AI-powered beauty product recommendations
          </p>
        </div>

        <Tabs defaultValue="makeup" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="makeup" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Makeup</span>
            </TabsTrigger>
            <TabsTrigger value="hair" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Hair</span>
            </TabsTrigger>
            <TabsTrigger value="nails" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Nails</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Tutorials</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="makeup">
            <VirtualMakeup />
          </TabsContent>

          <TabsContent value="hair">
            <HairStyleGenerator />
          </TabsContent>

          <TabsContent value="nails">
            <NailArtDesigner />
          </TabsContent>

          <TabsContent value="products">
            <ProductRecommender />
          </TabsContent>

          <TabsContent value="tutorials">
            <MakeupTutorials />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default BeautyStudio;
