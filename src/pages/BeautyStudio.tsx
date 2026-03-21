import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Sparkles, Palette, ShoppingBag, BookOpen, Info, Star, Zap, CheckCircle } from "lucide-react";
import { VirtualMakeup } from "@/components/beauty/VirtualMakeup";
import { HairStyleGenerator } from "@/components/beauty/HairStyleGenerator";
import { ProductRecommender } from "@/components/beauty/ProductRecommender";
import { MakeupTutorials } from "@/components/beauty/MakeupTutorials";

const BeautyStudio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-3 sm:mb-4">
            ✨ Virtual Beauty Studio
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Try different makeup looks, hairstyles and get AI-powered beauty product recommendations
          </p>
        </div>

        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border-pink-500/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">What is Virtual Beauty Studio?</h3>
              <p className="text-sm text-muted-foreground">
                Virtual Beauty Studio is your AI-powered personal beauty consultant. Upload your photo and explore different makeup looks, hairstyles, get personalized product recommendations, and learn step-by-step makeup tutorials tailored to your preferences.
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
                <li>• <strong>Makeup:</strong> Upload a selfie and AI applies different makeup styles</li>
                <li>• <strong>Hair:</strong> Try various hairstyles and colors on your photo</li>
                <li>• <strong>Products:</strong> Get personalized beauty product recommendations</li>
                <li>• <strong>Tutorials:</strong> Generate step-by-step makeup guides</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Credit Costs
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Virtual Makeup Try-On: 5 credits</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Hairstyle Generator: 5 credits</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Product Recommendations: 2 credits</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Makeup Tutorials: 2 credits</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
            <strong>Key Features:</strong> AI-powered transformations • Multiple makeup styles (Natural, Glamour, Smoky, etc.) • Various hairstyle options • Personalized skincare recommendations • Detailed step-by-step tutorials with pro tips
          </div>
        </Card>

        <Tabs defaultValue="makeup" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-8 h-auto">
            <TabsTrigger value="makeup" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Makeup</span>
            </TabsTrigger>
            <TabsTrigger value="hair" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Hair</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tutorials</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="makeup">
            <VirtualMakeup />
          </TabsContent>

          <TabsContent value="hair">
            <HairStyleGenerator />
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
