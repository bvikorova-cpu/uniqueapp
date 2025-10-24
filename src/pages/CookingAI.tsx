import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Camera, Calendar, MessageSquare, Wine, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CookingAI = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: "Generátor receptov",
      description: "Zadaj ingrediencie a dostaneš 3 úžasné recepty",
      credits: 1,
      color: "from-orange-500 to-red-500",
      path: "/cooking-ai/recipe-generator"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Týždenný meal plan",
      description: "AI vytvorí kompletný jedálniček na celý týždeň",
      credits: 3,
      color: "from-green-500 to-emerald-500",
      path: "/cooking-ai/meal-planner"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Food Scanner",
      description: "Odfotiť jedlo a zisti kalórie a nutričné hodnoty",
      credits: 1,
      color: "from-blue-500 to-cyan-500",
      path: "/cooking-ai/food-scanner"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Restaurant Menu Analyzer",
      description: "Analyzuj menu reštaurácie a získaj zdravé odporúčania",
      credits: 2,
      color: "from-purple-500 to-pink-500",
      path: "/cooking-ai/restaurant-analyzer"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chef Chat",
      description: "Chatuj so skúseným šéfkuchárom a dostávaj rady",
      credits: 1,
      color: "from-yellow-500 to-orange-500",
      path: "/cooking-ai/chef-chat"
    },
    {
      icon: <Wine className="w-8 h-8" />,
      title: "Wine Pairing",
      description: "Odporúčania vína a nápojov k tvojim jedlám",
      credits: 1,
      color: "from-red-500 to-rose-500",
      path: "/cooking-ai/wine-pairing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            🍳 AI Kuchárske Nástroje
          </h1>
          <p className="text-xl text-muted-foreground">
            Všetky AI funkcie pre varenie na jednom mieste
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {feature.credits} {feature.credits === 1 ? 'kredit' : 'kredity'}
                  </span>
                  <Button variant="outline" size="sm">
                    Spustiť
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-orange-100 to-red-100">
          <CardHeader>
            <CardTitle>💰 Cenník & Kredity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <CardDescription>10 kreditov</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic</CardTitle>
                  <CardDescription>100 kreditov/mesiac</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€4.99</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Premium</CardTitle>
                  <CardDescription>500 kreditov/mesiac</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€9.99</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pro</CardTitle>
                  <CardDescription>Unlimited</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€19.99</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookingAI;
