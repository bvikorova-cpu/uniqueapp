import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Wand2, Disc3, Download } from "lucide-react";
import { SongGenerator } from "@/components/music-producer/SongGenerator";
import { RemixStudio } from "@/components/music-producer/RemixStudio";
import { MySongs } from "@/components/music-producer/MySongs";

const AIMusicProducer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">
            🎵 AI Music Producer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create original songs from text/mood, generate melodies, beats & lyrics, remix existing songs
          </p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Song</span>
              <span className="sm:hidden">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="remix" className="flex items-center gap-2">
              <Disc3 className="h-4 w-4" />
              <span className="hidden sm:inline">Remix Studio</span>
              <span className="sm:hidden">Remix</span>
            </TabsTrigger>
            <TabsTrigger value="my-songs" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">My Songs</span>
              <span className="sm:hidden">Songs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <SongGenerator />
          </TabsContent>

          <TabsContent value="remix">
            <RemixStudio />
          </TabsContent>

          <TabsContent value="my-songs">
            <MySongs />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AIMusicProducer;
