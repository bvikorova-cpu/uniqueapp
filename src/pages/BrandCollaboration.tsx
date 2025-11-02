import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, DollarSign, Star, TrendingUp } from "lucide-react";

const BrandCollaboration = () => {
  const opportunities = [
    {
      brand: "TechStyle Co.",
      campaign: "Summer Collection",
      budget: "$500-1,000",
      deadline: "3 days",
      tags: ["Fashion", "AI Art"],
    },
    {
      brand: "Digital Dreams",
      campaign: "Product Launch",
      budget: "$300-600",
      deadline: "5 days",
      tags: ["Marketing", "Social Media"],
    },
    {
      brand: "Creative Studio",
      campaign: "Brand Identity",
      budget: "$800-1,500",
      deadline: "7 days",
      tags: ["Design", "Branding"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Handshake className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Brand Collaboration Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with brands for sponsored content. Platform takes 20% of deals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Premium Brands</h3>
            <p className="text-muted-foreground">Work with top companies</p>
          </Card>
          <Card className="p-6 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Fair Pay</h3>
            <p className="text-muted-foreground">You keep 80%</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Build Portfolio</h3>
            <p className="text-muted-foreground">Grow your reputation</p>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Available Opportunities</h2>
          {opportunities.map((opp, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{opp.brand}</h3>
                  <p className="text-muted-foreground mb-3">{opp.campaign}</p>
                  <div className="flex gap-2 flex-wrap">
                    {opp.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary mb-1">{opp.budget}</p>
                  <p className="text-sm text-muted-foreground">Deadline: {opp.deadline}</p>
                </div>
              </div>
              <Button className="w-full">Apply Now</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCollaboration;
