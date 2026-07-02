import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Camera, Calendar, MessageSquare, Wine, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CookingAI = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: "Recipe Generator",
      description: "Enter ingredients and get 3 amazing recipes",
      credits: 1,
      color: "from-orange-500 to-red-500",
      path: "/recipe-generator"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Weekly Meal Plan",
      description: "AI creates complete meal plan for the week",
      credits: 3,
      color: "from-green-500 to-emerald-500",
      path: "/meal-planner"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Food Scanner",
      description: "Snap food and find out calories and nutritional values",
      credits: 1,
      color: "from-blue-500 to-cyan-500",
      path: "/food-scanner"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Restaurant Menu Analyzer",
      description: "Analyze restaurant menu and get healthy recommendations",
      credits: 2,
      color: "from-purple-500 to-pink-500",
      path: "/restaurant-analyzer"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chef Chat",
      description: "Chat with experienced chef and get advice",
      credits: 1,
      color: "from-yellow-500 to-orange-500",
      path: "/chef-chat"
    },
    {
      icon: <Wine className="w-8 h-8" />,
      title: "Wine Pairing",
      description: "Wine and beverage recommendations for your dishes",
      credits: 1,
      color: "from-red-500 to-rose-500",
      path: "/wine-pairing"
    }
  ];

  return (
    <>
      <FloatingHowItWorks title="How Cooking AI works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-20 pb-8 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            🍳 AI Cooking Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            All AI cooking features in one place
          </p>
          <div className="max-w-3xl mx-auto text-sm text-muted-foreground space-y-2 text-left bg-card p-6 rounded-lg border">
            <p className="font-semibold text-foreground mb-2">How it works:</p>
            <p>• Each AI feature requires credits to use</p>
            <p>• Credits are deducted automatically when you generate content</p>
            <p>• Free tier includes 10 credits to get started</p>
            <p>• Subscribe for unlimited monthly credits</p>
            <p>• All generated content is saved to your account</p>
            <p>• Export or share your recipes and meal plans</p>
          </div>
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
                    {feature.credits} {feature.credits === 1 ? 'credit' : 'credits'}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => { window.location.href = `/cooking-ai?tool=${encodeURIComponent(feature.title)}`; }}>
                    Launch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-orange-100 to-red-100">
          <CardHeader>
            <CardTitle>💰 Pricing & Credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <CardDescription>10 credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic</CardTitle>
                  <CardDescription>100 credits/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€4.99</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Premium</CardTitle>
                  <CardDescription>500 credits/month</CardDescription>
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
    </>
    );
};

export default CookingAI;
