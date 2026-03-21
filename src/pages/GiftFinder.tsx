import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Gift, ArrowLeft, ArrowRight, Copy, Download, Sparkles, Check, Heart, Star, Cake, Briefcase, GraduationCap, Baby, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface GiftSuggestion {
  name: string;
  description: string;
  priceRange: string;
  category: string;
}

const occasions = [
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "anniversary", label: "Anniversary", icon: Heart },
  { id: "wedding", label: "Wedding", icon: Star },
  { id: "graduation", label: "Graduation", icon: GraduationCap },
  { id: "baby-shower", label: "Baby Shower", icon: Baby },
  { id: "holiday", label: "Holiday", icon: Gift },
  { id: "thank-you", label: "Thank You", icon: Users },
  { id: "corporate", label: "Corporate", icon: Briefcase }
];

const interests = [
  "Technology", "Fashion", "Sports", "Music", "Art", "Cooking", 
  "Gaming", "Books", "Travel", "Fitness", "Gardening", "Photography",
  "DIY Crafts", "Wine & Spirits", "Beauty", "Home Decor"
];

const budgetRanges = [
  { id: "budget", label: "Under $25", range: "$0-$25" },
  { id: "moderate", label: "$25 - $75", range: "$25-$75" },
  { id: "premium", label: "$75 - $150", range: "$75-$150" },
  { id: "luxury", label: "$150+", range: "$150+" }
];

const GiftFinder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [recipientAge, setRecipientAge] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const generateGifts = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const mockSuggestions: GiftSuggestion[] = [
        {
          name: "Personalized Star Map",
          description: `A custom star map showing the night sky on a special date - perfect for ${recipient}.`,
          priceRange: selectedBudget === "budget" ? "$20-$25" : "$40-$60",
          category: "Personalized"
        },
        {
          name: "Smart Home Device",
          description: "A voice-controlled assistant that matches their tech interests.",
          priceRange: "$50-$100",
          category: "Technology"
        },
        {
          name: "Experience Gift Box",
          description: `A curated experience box tailored to ${selectedInterests.slice(0, 2).join(" & ")} interests.`,
          priceRange: "$75-$150",
          category: "Experience"
        },
        {
          name: "Luxury Subscription Box",
          description: "3-month subscription to a curated box in their favorite category.",
          priceRange: "$60-$90",
          category: "Subscription"
        },
        {
          name: "Custom Photo Book",
          description: "Beautifully designed photo book with memories and personalized messages.",
          priceRange: "$30-$50",
          category: "Personalized"
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsGenerating(false);
      setStep(5);
    }, 2000);
  };

  const copyToClipboard = () => {
    const text = suggestions.map(s => 
      `${s.name} (${s.priceRange}): ${s.description}`
    ).join("\n\n");
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard!",
      description: "Gift suggestions have been copied.",
    });
  };

  const downloadAsPDF = () => {
    // Simulate PDF download
    const text = `Gift Suggestions for ${recipient}\n\nOccasion: ${selectedOccasion}\nBudget: ${selectedBudget}\nInterests: ${selectedInterests.join(", ")}\n\n${suggestions.map(s => `• ${s.name} (${s.priceRange})\n  ${s.description}`).join("\n\n")}`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gift-ideas-${recipient.toLowerCase().replace(/\s/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Gift suggestions saved as text file.",
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return recipient.trim() !== "";
      case 2: return selectedOccasion !== "";
      case 3: return selectedInterests.length > 0;
      case 4: return selectedBudget !== "";
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Gift Finder Pro
            </h1>
            <p className="text-muted-foreground">AI-powered perfect gift recommendations</p>
          </div>
        </div>

        {/* Progress */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step 1: Recipient */}
        {step === 1 && (
          <Card className="border-pink-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-400" />
                Who is the gift for?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipient's Name or Relationship</Label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., Mom, Best Friend Sarah, Partner"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Age (optional)</Label>
                <Input
                  value={recipientAge}
                  onChange={(e) => setRecipientAge(e.target.value)}
                  placeholder="e.g., 30, Teen, Senior"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Occasion */}
        {step === 2 && (
          <Card className="border-pink-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-400" />
                What's the occasion?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {occasions.map((occasion) => (
                  <div
                    key={occasion.id}
                    onClick={() => setSelectedOccasion(occasion.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      selectedOccasion === occasion.id
                        ? "border-pink-500 bg-pink-500/20"
                        : "border-pink-500/30 hover:border-pink-500/60"
                    }`}
                  >
                    <occasion.icon className={`h-8 w-8 mx-auto mb-2 ${
                      selectedOccasion === occasion.id ? "text-pink-400" : "text-muted-foreground"
                    }`} />
                    <p className="text-sm font-medium">{occasion.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <Card className="border-pink-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                What are their interests? (Select all that apply)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer text-sm py-2 px-4 ${
                      selectedInterests.includes(interest)
                        ? "bg-pink-600 hover:bg-pink-700"
                        : "border-pink-500/50 hover:bg-pink-500/20"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {selectedInterests.includes(interest) && <Check className="h-3 w-3 mr-1" />}
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Selected: {selectedInterests.length} interest(s)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <Card className="border-pink-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-400" />
                What's your budget?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedBudget} onValueChange={setSelectedBudget}>
                <div className="grid grid-cols-2 gap-4">
                  {budgetRanges.map((budget) => (
                    <div
                      key={budget.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
                        selectedBudget === budget.id
                          ? "border-pink-500 bg-pink-500/20"
                          : "border-pink-500/30"
                      }`}
                      onClick={() => setSelectedBudget(budget.id)}
                    >
                      <RadioGroupItem value={budget.id} id={budget.id} />
                      <Label htmlFor={budget.id} className="cursor-pointer">
                        <p className="font-medium">{budget.label}</p>
                        <p className="text-sm text-muted-foreground">{budget.range}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Results */}
        {step === 5 && (
          <div className="space-y-6">
            <Card className="border-pink-500/30 bg-gradient-to-br from-pink-950/30 to-red-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    Gift Suggestions for {recipient}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadAsPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-background/50 border border-pink-500/20"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{suggestion.name}</h3>
                        <Badge className="bg-pink-600">{suggestion.priceRange}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{suggestion.description}</p>
                      <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => {
                setStep(1);
                setSuggestions([]);
                setRecipient("");
                setSelectedOccasion("");
                setSelectedInterests([]);
                setSelectedBudget("");
              }}
              variant="outline"
              className="w-full"
            >
              Find Another Gift
            </Button>
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
                disabled={!canProceed()}
                className="bg-gradient-to-r from-pink-600 to-red-600"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generateGifts}
                disabled={!canProceed() || isGenerating}
                className="bg-gradient-to-r from-pink-600 to-red-600"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find Perfect Gifts
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftFinder;
