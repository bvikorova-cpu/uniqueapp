import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, ArrowLeft, Sparkles, Volume2, Target, Zap, MessageSquare, Clock, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  tone: { score: number; feedback: string };
  clarity: { score: number; feedback: string };
  impact: { score: number; feedback: string };
  pacing: { score: number; feedback: string };
  engagement: { score: number; feedback: string };
  overallScore: number;
  suggestions: string[];
  strengths: string[];
}

const speechTemplates = [
  { title: "Elevator Pitch", duration: "30-60 sec", description: "Quick intro about yourself or your idea" },
  { title: "Wedding Toast", duration: "2-3 min", description: "Heartfelt message for the couple" },
  { title: "Business Presentation", duration: "5-10 min", description: "Professional pitch or report" },
  { title: "Motivational Speech", duration: "5-15 min", description: "Inspire and move your audience" },
  { title: "TED-Style Talk", duration: "10-18 min", description: "Share an idea worth spreading" }
];

const PublicSpeakingMaster = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [speechText, setSpeechText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Processing your speech...",
      });
      // Simulate transcription
      setTimeout(() => {
        setSpeechText("This is a simulated transcription of your recorded speech. In a real implementation, this would use speech-to-text technology to convert your spoken words into text for analysis.");
      }, 1000);
    } else {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone...",
      });
    }
  };

  const analyzeSpeech = () => {
    if (!speechText.trim()) {
      toast({
        title: "No Speech to Analyze",
        description: "Please enter or record a speech first.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis: AnalysisResult = {
        tone: {
          score: 78,
          feedback: "Your tone conveys confidence but could benefit from more variation. Consider adding more enthusiasm in key moments."
        },
        clarity: {
          score: 85,
          feedback: "Excellent clarity! Your message is well-structured and easy to follow. Main points are clearly articulated."
        },
        impact: {
          score: 72,
          feedback: "Good use of examples, but the emotional appeal could be stronger. Try adding a personal story or compelling statistics."
        },
        pacing: {
          score: 80,
          feedback: "Good rhythm overall. Consider slowing down during important points and using strategic pauses for emphasis."
        },
        engagement: {
          score: 75,
          feedback: "Solid engagement techniques. Adding rhetorical questions and audience callbacks would boost interaction."
        },
        overallScore: 78,
        suggestions: [
          "Open with a hook - a surprising fact or compelling question",
          "Use the 'rule of three' for memorable points",
          "End with a clear call-to-action",
          "Practice with varied vocal dynamics",
          "Add transitional phrases between sections"
        ],
        strengths: [
          "Clear and logical structure",
          "Professional vocabulary",
          "Confident delivery indicators",
          "Good use of concrete examples"
        ]
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const wordCount = speechText.trim().split(/\s+/).filter(w => w).length;
  const estimatedMinutes = Math.ceil(wordCount / 150); // Average speaking pace

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Public Speaking Master
            </h1>
            <p className="text-muted-foreground">AI-powered speech analysis and coaching</p>
          </div>
        </div>

        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="tips">Pro Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Your Speech
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={toggleRecording}
                      className={isRecording ? "" : "border-blue-500/50"}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Record Speech
                        </>
                      )}
                    </Button>
                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm text-red-400">Recording...</span>
                      </div>
                    )}
                  </div>

                  <Textarea
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    placeholder="Paste your speech here or use the record button above..."
                    className="min-h-[300px] resize-none bg-blue-950/30 border-blue-500/30"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{wordCount} words</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~{estimatedMinutes} min to deliver
                    </span>
                  </div>

                  <Button
                    onClick={analyzeSpeech}
                    disabled={isAnalyzing || !speechText.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {isAnalyzing ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Speech
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis ? (
                    <div className="space-y-6">
                      {/* Overall Score */}
                      <div className="text-center p-4 rounded-lg bg-blue-950/30">
                        <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                        <p className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                      </div>

                      {/* Individual Scores */}
                      <div className="space-y-4">
                        {[
                          { label: "Tone", data: analysis.tone, icon: Volume2 },
                          { label: "Clarity", data: analysis.clarity, icon: Target },
                          { label: "Impact", data: analysis.impact, icon: Zap },
                          { label: "Pacing", data: analysis.pacing, icon: Clock },
                          { label: "Engagement", data: analysis.engagement, icon: Users }
                        ].map((item) => (
                          <div key={item.label} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-2 text-sm font-medium">
                                <item.icon className="h-4 w-4 text-blue-400" />
                                {item.label}
                              </span>
                              <span className={`font-bold ${getScoreColor(item.data.score)}`}>
                                {item.data.score}%
                              </span>
                            </div>
                            <Progress 
                              value={item.data.score} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">{item.data.feedback}</p>
                          </div>
                        ))}
                      </div>

                      {/* Strengths */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-400" />
                          Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.strengths.map((strength, i) => (
                            <Badge key={i} variant="outline" className="border-green-500/50 text-green-400">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Suggestions */}
                      <div>
                        <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-blue-400 mt-1">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter your speech and click "Analyze" to receive detailed feedback</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {speechTemplates.map((template, index) => (
                <Card 
                  key={index} 
                  className="border-blue-500/30 hover:border-blue-500/60 transition-colors cursor-pointer"
                  onClick={() => toast({ title: template.title, description: "Template loaded! Start customizing." })}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-1">{template.title}</h3>
                    <Badge variant="outline" className="mb-2 border-blue-500/50">
                      <Clock className="h-3 w-3 mr-1" />
                      {template.duration}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <Card className="border-blue-500/30">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      Before Your Speech
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Practice out loud at least 5 times</li>
                      <li>• Time yourself to stay within limits</li>
                      <li>• Record yourself and review</li>
                      <li>• Prepare for common questions</li>
                      <li>• Visualize success</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      During Your Speech
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Make eye contact with individuals</li>
                      <li>• Use strategic pauses for impact</li>
                      <li>• Vary your vocal dynamics</li>
                      <li>• Move with purpose, not nervously</li>
                      <li>• Connect with your audience's emotions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicSpeakingMaster;
