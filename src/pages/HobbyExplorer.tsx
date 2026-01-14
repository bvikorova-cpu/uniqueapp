import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, ArrowLeft, Sparkles, Clock, DollarSign, Users, BookOpen, Check, Star, Play, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Hobby {
  name: string;
  category: string;
  description: string;
  timeRequired: string;
  costLevel: "Free" | "Low" | "Medium" | "High";
  social: "Solo" | "Social" | "Both";
  benefits: string[];
  firstSteps: string[];
  resources: string[];
}

const hobbies: Hobby[] = [
  {
    name: "Urban Sketching",
    category: "Creative",
    description: "Capture city life through quick, expressive drawings while exploring your neighborhood.",
    timeRequired: "1-2 hours/session",
    costLevel: "Low",
    social: "Both",
    benefits: ["Improves observation skills", "Reduces stress", "Documents memories", "Portable anywhere"],
    firstSteps: [
      "Get a small sketchbook (A5 or pocket size)",
      "Start with a simple pen or pencil",
      "Begin with 5-minute sketches of simple objects",
      "Join a local Urban Sketchers group",
      "Share your work online for feedback"
    ],
    resources: ["Urban Sketchers website", "YouTube tutorials", "Local art supply stores"]
  },
  {
    name: "Podcasting",
    category: "Creative",
    description: "Share your knowledge or stories with the world through audio content creation.",
    timeRequired: "3-5 hours/week",
    costLevel: "Low",
    social: "Both",
    benefits: ["Build an audience", "Improve communication", "Connect with experts", "Flexible schedule"],
    firstSteps: [
      "Choose a niche topic you're passionate about",
      "Plan your first 5 episode topics",
      "Get a USB microphone ($50-100)",
      "Use free software like Audacity",
      "Host on Anchor.fm for free distribution"
    ],
    resources: ["Anchor.fm", "Audacity software", "r/podcasting community"]
  },
  {
    name: "Indoor Rock Climbing",
    category: "Fitness",
    description: "Challenge yourself mentally and physically while scaling indoor walls.",
    timeRequired: "2-3 hours/session",
    costLevel: "Medium",
    social: "Social",
    benefits: ["Full body workout", "Problem solving", "Community", "Goal achievement"],
    firstSteps: [
      "Find a local climbing gym",
      "Take an intro class (usually included)",
      "Rent shoes initially to find your size",
      "Start with bouldering (no ropes needed)",
      "Learn basic climbing terminology"
    ],
    resources: ["Local climbing gyms", "REI climbing classes", "Mountain Project app"]
  },
  {
    name: "Language Learning",
    category: "Educational",
    description: "Open new worlds by learning to communicate in another language.",
    timeRequired: "30 min/day",
    costLevel: "Free",
    social: "Both",
    benefits: ["Cognitive benefits", "Travel opportunities", "Career advancement", "Cultural understanding"],
    firstSteps: [
      "Choose a language that excites you",
      "Download Duolingo for daily practice",
      "Find a language exchange partner",
      "Watch shows/movies in your target language",
      "Label items in your home"
    ],
    resources: ["Duolingo", "iTalki", "Language learning subreddits"]
  },
  {
    name: "Bread Baking",
    category: "Culinary",
    description: "Master the ancient art of creating delicious homemade bread from scratch.",
    timeRequired: "2-4 hours (with waiting)",
    costLevel: "Low",
    social: "Solo",
    benefits: ["Therapeutic process", "Impressive results", "Cost savings", "Creativity"],
    firstSteps: [
      "Start with a simple no-knead recipe",
      "Get a digital kitchen scale for accuracy",
      "Invest in a Dutch oven for crusty loaves",
      "Learn about hydration percentages",
      "Keep a bread journal of your experiments"
    ],
    resources: ["King Arthur Flour website", "The Bread Baker's Apprentice book", "r/Breadit"]
  },
  {
    name: "Astronomy",
    category: "Science",
    description: "Explore the cosmos through stargazing and celestial observation.",
    timeRequired: "1-2 hours/session",
    costLevel: "Free",
    social: "Both",
    benefits: ["Wonder and perspective", "Scientific learning", "Night photography", "Relaxation"],
    firstSteps: [
      "Download a stargazing app (SkyView, Stellarium)",
      "Learn major constellations visible in your area",
      "Find a dark sky location",
      "Join a local astronomy club",
      "Start with binoculars before buying a telescope"
    ],
    resources: ["NASA website", "Space.com", "Local astronomy clubs"]
  },
  {
    name: "Meditation & Mindfulness",
    category: "Wellness",
    description: "Cultivate inner peace and mental clarity through daily practice.",
    timeRequired: "10-30 min/day",
    costLevel: "Free",
    social: "Solo",
    benefits: ["Stress reduction", "Better sleep", "Improved focus", "Emotional regulation"],
    firstSteps: [
      "Start with 5 minutes daily",
      "Use a guided app like Headspace or Calm",
      "Find a consistent time each day",
      "Create a dedicated quiet space",
      "Be patient with yourself"
    ],
    resources: ["Headspace", "Insight Timer", "10% Happier podcast"]
  },
  {
    name: "Board Game Collecting",
    category: "Social",
    description: "Discover modern board games and build a collection for game nights.",
    timeRequired: "2-4 hours/session",
    costLevel: "Medium",
    social: "Social",
    benefits: ["Quality social time", "Strategic thinking", "Screen-free entertainment", "Community"],
    firstSteps: [
      "Visit BoardGameGeek.com for recommendations",
      "Start with gateway games (Ticket to Ride, Catan)",
      "Find a local board game café",
      "Join a gaming group on Meetup",
      "Watch tutorial videos before game night"
    ],
    resources: ["BoardGameGeek", "Shut Up & Sit Down reviews", "Local game stores"]
  }
];

const personalityTraits = [
  "Creative", "Analytical", "Social", "Introspective",
  "Active", "Relaxed", "Detail-oriented", "Big-picture thinker"
];

const HobbyExplorer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [freeTime, setFreeTime] = useState("");
  const [budget, setBudget] = useState("");
  const [recommendations, setRecommendations] = useState<Hobby[]>([]);
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length < 4 ? [...prev, trait] : prev
    );
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case "Free": return "bg-green-500";
      case "Low": return "bg-blue-500";
      case "Medium": return "bg-yellow-500";
      case "High": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const generateRecommendations = () => {
    let filtered = hobbies;

    // Filter by budget
    if (budget === "free") {
      filtered = filtered.filter(h => h.costLevel === "Free");
    } else if (budget === "low") {
      filtered = filtered.filter(h => h.costLevel === "Free" || h.costLevel === "Low");
    }

    // Sort by trait matching (simplified)
    if (selectedTraits.includes("Creative")) {
      filtered = filtered.sort((a, b) => 
        (a.category === "Creative" ? -1 : 1) - (b.category === "Creative" ? -1 : 1)
      );
    }

    setRecommendations(filtered.slice(0, 5));
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Hobby Explorer
            </h1>
            <p className="text-muted-foreground">Discover your next passion</p>
          </div>
        </div>

        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step 1: Personality Traits */}
        {step === 1 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-400" />
                What describes you best? (Select up to 4)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {personalityTraits.map((trait) => (
                  <Badge
                    key={trait}
                    variant={selectedTraits.includes(trait) ? "default" : "outline"}
                    className={`cursor-pointer text-sm py-2 px-4 ${
                      selectedTraits.includes(trait)
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "border-orange-500/50 hover:bg-orange-500/20"
                    }`}
                    onClick={() => toggleTrait(trait)}
                  >
                    {selectedTraits.includes(trait) && <Check className="h-3 w-3 mr-1" />}
                    {trait}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Selected: {selectedTraits.length}/4
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Free Time */}
        {step === 2 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                How much free time do you have?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={freeTime} onValueChange={setFreeTime} className="space-y-4">
                {[
                  { value: "minimal", label: "Minimal", desc: "Less than 30 minutes daily" },
                  { value: "moderate", label: "Moderate", desc: "1-2 hours a few times a week" },
                  { value: "plenty", label: "Plenty", desc: "Several hours weekly or more" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      freeTime === option.value
                        ? "border-orange-500 bg-orange-500/20"
                        : "border-orange-500/30 hover:border-orange-500/60"
                    }`}
                    onClick={() => setFreeTime(option.value)}
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

        {/* Step 3: Budget */}
        {step === 3 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-400" />
                What's your budget for a new hobby?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={budget} onValueChange={setBudget} className="space-y-4">
                {[
                  { value: "free", label: "Free", desc: "Looking for no-cost activities" },
                  { value: "low", label: "Low ($0-50)", desc: "Willing to spend a little to get started" },
                  { value: "medium", label: "Medium ($50-200)", desc: "Ready to invest in equipment or classes" },
                  { value: "any", label: "Any Budget", desc: "Cost isn't a major factor" }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                      budget === option.value
                        ? "border-orange-500 bg-orange-500/20"
                        : "border-orange-500/30 hover:border-orange-500/60"
                    }`}
                    onClick={() => setBudget(option.value)}
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

        {/* Step 4: Results */}
        {step === 4 && !selectedHobby && (
          <div className="space-y-6">
            <Card className="border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                  Your Hobby Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((hobby, index) => (
                    <Card
                      key={index}
                      className="border-orange-500/30 hover:border-orange-500/60 cursor-pointer transition-all"
                      onClick={() => setSelectedHobby(hobby)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{hobby.name}</h3>
                            <Badge variant="outline" className="text-xs">{hobby.category}</Badge>
                          </div>
                          <Badge className={getCostColor(hobby.costLevel)}>{hobby.costLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{hobby.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {hobby.timeRequired}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {hobby.social}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setStep(1)} className="w-full">
              Start New Exploration
            </Button>
          </div>
        )}

        {/* Hobby Detail View */}
        {selectedHobby && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedHobby(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recommendations
            </Button>

            <Card className="border-orange-500/30">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedHobby.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">{selectedHobby.category}</Badge>
                  </div>
                  <Badge className={getCostColor(selectedHobby.costLevel)}>{selectedHobby.costLevel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{selectedHobby.description}</p>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-orange-950/30">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium">{selectedHobby.timeRequired}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-950/30">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-medium">{selectedHobby.costLevel}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-950/30">
                    <Users className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-xs text-muted-foreground">Style</p>
                    <p className="text-sm font-medium">{selectedHobby.social}</p>
                  </div>
                </div>

                {/* First Steps */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-orange-400" />
                    First Steps to Get Started
                  </h4>
                  <ol className="space-y-3">
                    {selectedHobby.firstSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHobby.benefits.map((benefit, i) => (
                      <Badge key={i} variant="outline" className="border-orange-500/50">
                        <Check className="h-3 w-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-orange-400" />
                    Resources
                  </h4>
                  <ul className="space-y-2">
                    {selectedHobby.resources.map((resource, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-orange-400">•</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => toast({ title: "Great choice!", description: `${selectedHobby.name} added to your interests!` })}
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Start This Hobby
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(prev => prev + 1)}
                disabled={
                  (step === 1 && selectedTraits.length === 0) ||
                  (step === 2 && !freeTime)
                }
                className="bg-orange-600 hover:bg-orange-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={generateRecommendations}
                disabled={!budget}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Find Hobbies
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HobbyExplorer;
