import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, ArrowLeft, Sun, Droplets, Thermometer, Sparkles, Calendar, Info, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PlantRecommendation {
  name: string;
  scientificName: string;
  difficulty: "Easy" | "Moderate" | "Expert";
  light: string;
  water: string;
  description: string;
  careSchedule: { task: string; frequency: string }[];
  benefits: string[];
}

const plantDatabase: PlantRecommendation[] = [
  {
    name: "Snake Plant",
    scientificName: "Sansevieria trifasciata",
    difficulty: "Easy",
    light: "Low to Bright Indirect",
    water: "Every 2-3 weeks",
    description: "Nearly indestructible, perfect for beginners. Purifies air and thrives on neglect.",
    careSchedule: [
      { task: "Water", frequency: "Every 2-3 weeks" },
      { task: "Dust leaves", frequency: "Monthly" },
      { task: "Fertilize", frequency: "Every 2 months (spring/summer)" },
      { task: "Repot", frequency: "Every 2-3 years" }
    ],
    benefits: ["Air purification", "Low maintenance", "Drought tolerant", "Releases oxygen at night"]
  },
  {
    name: "Pothos",
    scientificName: "Epipremnum aureum",
    difficulty: "Easy",
    light: "Low to Bright Indirect",
    water: "When top inch is dry",
    description: "Fast-growing vine that adapts to almost any condition. Great for hanging baskets.",
    careSchedule: [
      { task: "Water", frequency: "Weekly" },
      { task: "Trim vines", frequency: "Monthly" },
      { task: "Fertilize", frequency: "Monthly (spring/summer)" },
      { task: "Propagate cuttings", frequency: "As desired" }
    ],
    benefits: ["Fast growing", "Easy to propagate", "Trailing vines", "Adaptable"]
  },
  {
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    difficulty: "Moderate",
    light: "Bright Indirect",
    water: "When top 2 inches are dry",
    description: "Iconic Swiss cheese plant with dramatic fenestrated leaves. Makes a bold statement.",
    careSchedule: [
      { task: "Water", frequency: "Every 1-2 weeks" },
      { task: "Mist leaves", frequency: "Weekly" },
      { task: "Clean leaves", frequency: "Bi-weekly" },
      { task: "Add moss pole", frequency: "Once (for climbing)" }
    ],
    benefits: ["Statement piece", "Air purifying", "Fast grower", "Instagram-worthy"]
  },
  {
    name: "Peace Lily",
    scientificName: "Spathiphyllum",
    difficulty: "Easy",
    light: "Low to Medium",
    water: "When leaves droop slightly",
    description: "Elegant blooming plant that tells you when it's thirsty. Beautiful white flowers.",
    careSchedule: [
      { task: "Water", frequency: "Weekly" },
      { task: "Remove dead flowers", frequency: "As needed" },
      { task: "Fertilize", frequency: "Every 6 weeks" },
      { task: "Wipe leaves", frequency: "Monthly" }
    ],
    benefits: ["Blooming flowers", "Communicates needs", "Shade tolerant", "Air purifying"]
  },
  {
    name: "Fiddle Leaf Fig",
    scientificName: "Ficus lyrata",
    difficulty: "Expert",
    light: "Bright Indirect",
    water: "When top inch is dry",
    description: "Dramatic tree with violin-shaped leaves. Requires consistent care and placement.",
    careSchedule: [
      { task: "Water", frequency: "Every 7-10 days" },
      { task: "Rotate plant", frequency: "Weekly" },
      { task: "Dust leaves", frequency: "Bi-weekly" },
      { task: "Fertilize", frequency: "Monthly (growing season)" }
    ],
    benefits: ["Architectural beauty", "Statement plant", "Tall growth", "Designer favorite"]
  }
];

const PlantExpert = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [lightLevel, setLightLevel] = useState("");
  const [humidity, setHumidity] = useState("");
  const [spaceSize, setSpaceSize] = useState("");
  const [experience, setExperience] = useState("");
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantRecommendation | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const generateRecommendations = () => {
    // Filter based on criteria
    let filtered = plantDatabase;

    if (experience === "beginner") {
      filtered = filtered.filter(p => p.difficulty === "Easy");
    } else if (experience === "intermediate") {
      filtered = filtered.filter(p => p.difficulty !== "Expert");
    }

    if (lightLevel === "low") {
      filtered = filtered.filter(p => p.light.toLowerCase().includes("low"));
    }

    // If no matches, return all easy plants
    if (filtered.length === 0) {
      filtered = plantDatabase.filter(p => p.difficulty === "Easy");
    }

    setRecommendations(filtered);
    setStep(5);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Moderate": return "bg-yellow-500";
      case "Expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Interior Plant Expert
            </h1>
            <p className="text-muted-foreground">AI-powered plant recommendations for your space</p>
          </div>
        </div>

        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step 1: Light */}
        {step === 1 && (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-400" />
                How much natural light does your space get?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={lightLevel} onValueChange={setLightLevel} className="space-y-4">
                {[
                  { value: "low", label: "Low Light", desc: "No direct sunlight, north-facing or interior room" },
                  { value: "medium", label: "Medium Light", desc: "Some indirect sunlight, east or west-facing" },
                  { value: "bright", label: "Bright Indirect", desc: "Lots of light but no direct sun, near south-facing window" },
                  { value: "direct", label: "Direct Sunlight", desc: "Several hours of direct sun daily" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      lightLevel === option.value
                        ? "border-green-500 bg-green-500/20"
                        : "border-green-500/30 hover:border-green-500/60"
                    }`}
                    onClick={() => setLightLevel(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Humidity */}
        {step === 2 && (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-400" />
                What's the humidity level in your home?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={humidity} onValueChange={setHumidity} className="space-y-4">
                {[
                  { value: "dry", label: "Dry", desc: "Dry climate, heating/AC runs often" },
                  { value: "average", label: "Average", desc: "Normal indoor humidity" },
                  { value: "humid", label: "Humid", desc: "Naturally humid or near bathroom/kitchen" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      humidity === option.value
                        ? "border-green-500 bg-green-500/20"
                        : "border-green-500/30 hover:border-green-500/60"
                    }`}
                    onClick={() => setHumidity(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Space */}
        {step === 3 && (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-green-400" />
                How much space do you have?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={spaceSize} onValueChange={setSpaceSize} className="space-y-4">
                {[
                  { value: "small", label: "Small", desc: "Windowsill, desk, or shelf space only" },
                  { value: "medium", label: "Medium", desc: "Table or floor space for medium plants" },
                  { value: "large", label: "Large", desc: "Room for large floor plants or trees" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      spaceSize === option.value
                        ? "border-green-500 bg-green-500/20"
                        : "border-green-500/30 hover:border-green-500/60"
                    }`}
                    onClick={() => setSpaceSize(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-400" />
                What's your plant care experience?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={experience} onValueChange={setExperience} className="space-y-4">
                {[
                  { value: "beginner", label: "Beginner", desc: "New to plants, want easy-care options" },
                  { value: "intermediate", label: "Intermediate", desc: "Some experience, ready for more variety" },
                  { value: "expert", label: "Expert", desc: "Experienced plant parent, up for a challenge" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      experience === option.value
                        ? "border-green-500 bg-green-500/20"
                        : "border-green-500/30 hover:border-green-500/60"
                    }`}
                    onClick={() => setExperience(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Results */}
        {step === 5 && !selectedPlant && (
          <div className="space-y-6">
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-400" />
                  Perfect Plants for Your Space
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.map((plant, index) => (
                    <Card 
                      key={index}
                      className="border-green-500/30 hover:border-green-500/60 cursor-pointer transition-all"
                      onClick={() => setSelectedPlant(plant)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{plant.name}</h3>
                            <p className="text-xs text-muted-foreground italic">{plant.scientificName}</p>
                          </div>
                          <Badge className={getDifficultyColor(plant.difficulty)}>
                            {plant.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{plant.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Sun className="h-3 w-3" /> {plant.light}
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" /> {plant.water}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="w-full"
            >
              Start New Assessment
            </Button>
          </div>
        )}

        {/* Plant Detail View */}
        {selectedPlant && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedPlant(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recommendations
            </Button>

            <Card className="border-green-500/30">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedPlant.name}</CardTitle>
                    <p className="text-muted-foreground italic">{selectedPlant.scientificName}</p>
                  </div>
                  <Badge className={getDifficultyColor(selectedPlant.difficulty)}>
                    {selectedPlant.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{selectedPlant.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-950/30">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-400" /> Light
                    </p>
                    <p className="font-medium">{selectedPlant.light}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-950/30">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" /> Water
                    </p>
                    <p className="font-medium">{selectedPlant.water}</p>
                  </div>
                </div>

                {/* Care Schedule */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-400" />
                    Care Schedule
                  </h4>
                  <div className="space-y-2">
                    {selectedPlant.careSchedule.map((item, i) => (
                      <div key={i} className="flex justify-between p-3 rounded-lg bg-background/50 border border-green-500/20">
                        <span>{item.task}</span>
                        <Badge variant="outline">{item.frequency}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-green-400" />
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlant.benefits.map((benefit, i) => (
                      <Badge key={i} variant="outline" className="border-green-500/50">
                        <Check className="h-3 w-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => toast({ title: "Added to My Plants!", description: `${selectedPlant.name} has been saved.` })}
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  Add to My Plants
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(prev => prev + 1)}
                disabled={
                  (step === 1 && !lightLevel) ||
                  (step === 2 && !humidity) ||
                  (step === 3 && !spaceSize)
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={generateRecommendations}
                disabled={!experience}
                className="bg-green-600 hover:bg-green-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Get Recommendations
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantExpert;
