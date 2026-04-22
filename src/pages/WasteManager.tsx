import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recycle, ArrowLeft, Camera, Search, Leaf, Trash2, Package, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface WasteItem {
  name: string;
  category: "recyclable" | "compost" | "landfill" | "hazardous" | "special";
  instructions: string[];
  tips: string[];
  impact: string;
}

const wasteDatabase: Record<string, WasteItem> = {
  "plastic bottle": {
    name: "Plastic Bottle",
    category: "recyclable",
    instructions: [
      "Empty and rinse the bottle",
      "Remove the cap (recycle separately)",
      "Crush to save space",
      "Place in recycling bin"
    ],
    tips: [
      "Check the number inside the recycling symbol",
      "Most curbside programs accept #1 and #2 plastics",
      "Leave labels on - they're removed during processing"
    ],
    impact: "Recycling one plastic bottle saves enough energy to power a light bulb for 3 hours"
  },
  "banana peel": {
    name: "Banana Peel",
    category: "compost",
    instructions: [
      "Add to compost bin or pile",
      "Cut into smaller pieces for faster decomposition",
      "Mix with brown materials (leaves, cardboard)"
    ],
    tips: [
      "Great source of potassium for your garden",
      "Can also be used directly as plant fertilizer",
      "Freeze scraps until you have enough to compost"
    ],
    impact: "Composting food waste reduces methane emissions from landfills by up to 50%"
  },
  "battery": {
    name: "Battery",
    category: "hazardous",
    instructions: [
      "Never throw in regular trash",
      "Tape the terminals to prevent fires",
      "Take to a designated collection point",
      "Many stores offer battery recycling"
    ],
    tips: [
      "Rechargeable batteries can be used 500+ times",
      "Store dead batteries in a non-metal container",
      "Check local hazardous waste collection days"
    ],
    impact: "One battery can contaminate 500 liters of water - proper disposal is critical"
  },
  "cardboard": {
    name: "Cardboard",
    category: "recyclable",
    instructions: [
      "Flatten all boxes to save space",
      "Remove tape and labels if possible",
      "Keep dry - wet cardboard can't be recycled",
      "Place in recycling bin"
    ],
    tips: [
      "Pizza boxes with grease stains should be composted instead",
      "Shredded cardboard makes great compost material",
      "Remove any plastic windows from envelopes"
    ],
    impact: "Recycling 1 ton of cardboard saves 17 trees and 7,000 gallons of water"
  },
  "glass jar": {
    name: "Glass Jar",
    category: "recyclable",
    instructions: [
      "Rinse thoroughly",
      "Remove metal lids (recycle separately)",
      "Labels can stay on",
      "Place in glass recycling bin"
    ],
    tips: [
      "Glass can be recycled infinitely without quality loss",
      "Don't include ceramics, mirrors, or window glass",
      "Consider reusing jars for storage"
    ],
    impact: "Using recycled glass reduces air pollution by 20% and water pollution by 50%"
  }
};

const ecoTips = [
  { icon: Package, title: "Reduce", description: "Buy products with minimal packaging" },
  { icon: Recycle, title: "Reuse", description: "Repurpose items before discarding" },
  { icon: Leaf, title: "Compost", description: "Turn food scraps into garden gold" },
  { icon: Lightbulb, title: "Educate", description: "Teach others proper waste sorting" }
];

const WasteManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<WasteItem | null>(null);

  const getCategoryColor = (category: WasteItem["category"]) => {
    switch (category) {
      case "recyclable": return "bg-blue-500";
      case "compost": return "bg-green-500";
      case "landfill": return "bg-gray-500";
      case "hazardous": return "bg-red-500";
      case "special": return "bg-purple-500";
    }
  };

  const getCategoryIcon = (category: WasteItem["category"]) => {
    switch (category) {
      case "recyclable": return Recycle;
      case "compost": return Leaf;
      case "landfill": return Trash2;
      case "hazardous": return AlertTriangle;
      case "special": return Package;
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    const found = Object.entries(wasteDatabase).find(([key]) => 
      key.includes(query) || query.includes(key)
    );

    if (found) {
      setResult(found[1]);
    } else {
      setResult({
        name: searchQuery,
        category: "landfill",
        instructions: [
          "If you're unsure, place in general waste",
          "Check your local recycling guidelines",
          "Contact your waste management provider"
        ],
        tips: [
          "When in doubt, check online resources",
          "Many communities have waste sorting apps",
          "Call your local recycling center for specific items"
        ],
        impact: "Proper waste sorting helps keep recyclables out of landfills"
      });
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    toast({
      title: "Scanning...",
      description: "Point camera at the item",
    });

    setTimeout(() => {
      const items = Object.values(wasteDatabase);
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setResult(randomItem);
      setIsScanning(false);
      toast({
        title: "Item Identified!",
        description: `Found: ${randomItem.name}`,
      });
    }, 2000);
  };

  const CategoryIcon = result ? getCategoryIcon(result.category) : Recycle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Smart Waste Management
            </h1>
            <p className="text-muted-foreground">AI-powered recycling assistant</p>
          </div>
        </div>

        <Tabs defaultValue="identify" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="identify">Identify</TabsTrigger>
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="tips">Eco Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="identify" className="space-y-6">
            {/* Search & Scan */}
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-400" />
                  Identify Your Waste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type item name (e.g., plastic bottle, battery...)"
                    className="bg-green-950/30 border-green-500/30"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center text-muted-foreground">or</div>

                <Button
                  onClick={simulateScan}
                  disabled={isScanning}
                  variant="outline"
                  className="w-full border-green-500/50 h-24"
                >
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <span>Scanning...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-green-400" />
                      <span>Scan Item with Camera</span>
                    </div>
                  )}
                </Button>

                {/* Quick Examples */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Try:</span>
                  {Object.keys(wasteDatabase).map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="cursor-pointer border-green-500/50 hover:bg-green-500/20"
                      onClick={() => {
                        setSearchQuery(item);
                        setResult(wasteDatabase[item]);
                      }}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            {result && (
              <Card className="border-green-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CategoryIcon className="h-5 w-5 text-green-400" />
                      {result.name}
                    </CardTitle>
                    <Badge className={getCategoryColor(result.category)}>
                      {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instructions */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      How to Dispose
                    </h4>
                    <ol className="space-y-2">
                      {result.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Environmental Impact */}
                  <div className="p-4 rounded-lg bg-green-950/30 border border-green-500/30">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-400" />
                      Environmental Impact
                    </h4>
                    <p className="text-sm text-muted-foreground">{result.impact}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="guide">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { category: "recyclable" as const, title: "Recyclable", items: ["Paper & Cardboard", "Glass", "Metal Cans", "Plastic #1-2"] },
                { category: "compost" as const, title: "Compostable", items: ["Food Scraps", "Yard Waste", "Coffee Grounds", "Eggshells"] },
                { category: "hazardous" as const, title: "Hazardous", items: ["Batteries", "Paint", "Electronics", "Chemicals"] },
                { category: "special" as const, title: "Special Disposal", items: ["Mattresses", "Tires", "Appliances", "Medication"] }
              ].map((cat) => {
                const Icon = getCategoryIcon(cat.category);
                return (
                  <Card key={cat.category} className="border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={getCategoryColor(cat.category)}>
                          <Icon className="h-3 w-3 mr-1" />
                          {cat.title}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {cat.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <div className="grid md:grid-cols-2 gap-4">
              {ecoTips.map((tip, index) => (
                <Card key={index} className="border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <tip.icon className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-green-500/30 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-400" />
                  Daily Eco Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium mb-4">
                  "Use a reusable water bottle for all your drinks today!"
                </p>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.info("Accept Challenge — coming soon")}>
                  Accept Challenge
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WasteManager;
