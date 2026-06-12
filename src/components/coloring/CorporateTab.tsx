import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Sparkles, CheckCircle2, Utensils, Heart, Calendar } from "lucide-react";
import { CorporateInquiryForm } from "@/components/corporate/CorporateInquiryForm";

export function CorporateTab() {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const scrollToForm = (packageType: string, category: string) => {
    setSelectedPackage(packageType);
    setSelectedCategory(category);
    setTimeout(() => {
      document.getElementById("corporate-inquiry-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const renderPricingCard = (props: { title: string; icon: any; desc: string; price: string; priceLabel: string; features: string[]; popular?: boolean; onClick: () => void; buttonText: string }, index: number) => {
    const Icon = props.icon;
    return (
      <motion.div key={props.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
        <Card className={`backdrop-blur-xl bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-1 ${props.popular ? "border-2 border-primary" : "border-border/30 hover:border-primary/30"}`}>
          <CardHeader>
            {props.popular && <Badge className="w-fit mb-2">Popular</Badge>}
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              {props.title}
            </CardTitle>
            <CardDescription>{props.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{props.price}<span className="text-sm text-muted-foreground">{props.priceLabel}</span></div>
            <ul className="space-y-2 text-sm mb-4">
              {props.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={props.onClick}>{props.buttonText}</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Badge className="mb-4" variant="secondary"><Building2 className="w-4 h-4 mr-2" />B2B Solutions</Badge>
        <h2 className="text-4xl font-bold mb-4">Corporate & Event Solutions</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Professional coloring book solutions for companies, restaurants, weddings and events. Strengthen your brand with creativity.
        </p>
      </motion.div>

      <Tabs defaultValue="corporate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="corporate">Corporate Events</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="weddings">Weddings</TabsTrigger>
          <TabsTrigger value="events">Event Organizers</TabsTrigger>
        </TabsList>

        <TabsContent value="corporate" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {renderPricingCard({ title: "Startup", icon: Sparkles, desc: "For small companies", price: "€15", priceLabel: "/event", features: ["Company logo on 10 pages", "Basic brand colors", "PDF download"], onClick: () => scrollToForm("startup", "corporate"), buttonText: "Order" }, 0)}
            {renderPricingCard({ title: "Business", icon: Building2, desc: "For medium companies", price: "€30", priceLabel: "/event", features: ["20 custom pages", "Full branding", "Multiple formats"], onClick: () => scrollToForm("business", "corporate"), buttonText: "Order" }, 1)}
            {renderPricingCard({ title: "Enterprise", icon: Building2, desc: "For large corporations", price: "€60", priceLabel: "/event", features: ["Unlimited pages", "Complete branding", "Dedicated support"], popular: true, onClick: () => scrollToForm("enterprise", "corporate"), buttonText: "Order" }, 2)}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {renderPricingCard({ title: "Restaurant Basic", icon: Utensils, desc: "For small cafes", price: "€10", priceLabel: "/month", features: ["10 themed pages", "Restaurant logo"], onClick: () => scrollToForm("basic", "restaurant"), buttonText: "Subscribe" }, 0)}
            {renderPricingCard({ title: "Restaurant Premium", icon: Utensils, desc: "For family restaurants", price: "€25", priceLabel: "/month", features: ["Unlimited pages", "Menu-themed content", "QR code integration"], popular: true, onClick: () => scrollToForm("premium", "restaurant"), buttonText: "Subscribe" }, 1)}
            {renderPricingCard({ title: "Chain Solution", icon: Utensils, desc: "For restaurant chains", price: "Custom", priceLabel: "", features: ["Multi-location", "API integration"], onClick: () => scrollToForm("chain", "restaurant"), buttonText: "Contact" }, 2)}
          </div>
        </TabsContent>

        <TabsContent value="weddings" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {renderPricingCard({ title: "Wedding Basic", icon: Heart, desc: "For intimate weddings", price: "€25", priceLabel: "/wedding", features: ["15 personalized pages", "Couple names & date"], onClick: () => scrollToForm("basic", "wedding"), buttonText: "Order" }, 0)}
            {renderPricingCard({ title: "Wedding Premium", icon: Heart, desc: "For grand celebrations", price: "€50", priceLabel: "/wedding", features: ["30+ custom pages", "Photo integration", "Kids activity packs"], popular: true, onClick: () => scrollToForm("premium", "wedding"), buttonText: "Order" }, 1)}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {renderPricingCard({ title: "Event Starter", icon: Calendar, desc: "For small events", price: "€20", priceLabel: "/event", features: ["15 event pages", "Event branding"], onClick: () => scrollToForm("starter", "event"), buttonText: "Order" }, 0)}
            {renderPricingCard({ title: "Event Professional", icon: Calendar, desc: "For professional organizers", price: "€40", priceLabel: "/event", features: ["Unlimited pages", "Full customization", "Priority support"], popular: true, onClick: () => scrollToForm("professional", "event"), buttonText: "Order" }, 1)}
            {renderPricingCard({ title: "Agency Partner", icon: Calendar, desc: "For event agencies", price: "Custom", priceLabel: "", features: ["White label solution", "API access"], onClick: () => scrollToForm("agency", "event"), buttonText: "Contact" }, 2)}
          </div>
        </TabsContent>
      </Tabs>

      <div id="corporate-inquiry-form" className="mt-12">
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <CorporateInquiryForm defaultPackage={selectedPackage} defaultCategory={selectedCategory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
