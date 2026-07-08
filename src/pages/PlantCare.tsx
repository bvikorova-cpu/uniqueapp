import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Camera, Calendar, Stethoscope } from "lucide-react";
import { PlantIdentifier } from "@/components/plant-care/PlantIdentifier";
import { CareCalendar } from "@/components/plant-care/CareCalendar";
import { PlantDiagnosis } from "@/components/plant-care/PlantDiagnosis";
import { MyPlants } from "@/components/plant-care/MyPlants";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const PlantCare = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">
            🌱 AI Garden & Plant Care
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Identify plants from photos, get personalized care schedules, and diagnose plant diseases with AI
          </p>
        </div>

        <FloatingHowItWorks
          title="How AI Garden & Plant Care works"
          intro="Identify, schedule and diagnose your plants with AI."
          steps={[
            { title: 'Identify', desc: 'Upload a photo to detect the species instantly.' },
            { title: 'Calendar', desc: 'Get a personalized watering and care schedule.' },
            { title: 'Diagnose', desc: 'Spot diseases and pests from leaf photos.' },
            { title: 'My Plants', desc: 'Track your collection and log care activity.' },
          ]}
        />


        <Tabs defaultValue="identify" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="identify" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Identify</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="diagnose" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Diagnose</span>
            </TabsTrigger>
            <TabsTrigger value="my-plants" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">My Plants</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identify">
            <PlantIdentifier />
          </TabsContent>

          <TabsContent value="calendar">
            <CareCalendar />
          </TabsContent>

          <TabsContent value="diagnose">
            <PlantDiagnosis />
          </TabsContent>

          <TabsContent value="my-plants">
            <MyPlants />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default PlantCare;