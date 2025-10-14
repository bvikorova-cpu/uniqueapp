import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, FileText, Linkedin, DollarSign, Download, History } from "lucide-react";
import InterviewSimulator from "@/components/career/InterviewSimulator";
import CVOptimizer from "@/components/career/CVOptimizer";
import LinkedInEnhancer from "@/components/career/LinkedInEnhancer";
import NegotiationCoach from "@/components/career/NegotiationCoach";
import CareerHistory from "@/components/career/CareerHistory";

const CareerHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("interview");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Professional Career Hub
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered tools to accelerate your career growth
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">CV Builder</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
            <TabsTrigger value="negotiation" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Negotiation</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interview">
            <InterviewSimulator />
          </TabsContent>

          <TabsContent value="cv">
            <CVOptimizer />
          </TabsContent>

          <TabsContent value="linkedin">
            <LinkedInEnhancer />
          </TabsContent>

          <TabsContent value="negotiation">
            <NegotiationCoach />
          </TabsContent>

          <TabsContent value="history">
            <CareerHistory />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default CareerHub;