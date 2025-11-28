import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, ArrowRight, RotateCcw, CheckCircle, XCircle, Star } from "lucide-react";

interface Choice {
  text: string;
  score: number;
  feedback: string;
  nextStep?: number;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  steps: {
    situation: string;
    choices: Choice[];
  }[];
}

const scenarios: Scenario[] = [
  {
    id: "verbal-classroom",
    title: "Verbal Bullying in Class",
    description: "A classmate keeps making fun of you in front of others",
    difficulty: "Easy",
    category: "School",
    steps: [
      {
        situation: "During class, a student loudly makes fun of your answer to a question. Other students laugh. The teacher doesn't seem to notice. What do you do?",
        choices: [
          { text: "Yell insults back at them", score: 0, feedback: "This could escalate the situation and get you in trouble too. It's better to stay calm." },
          { text: "Stay calm and ignore them, then talk to the teacher after class", score: 100, feedback: "Excellent! Staying calm denies the bully the reaction they want, and reporting to a trusted adult is the right approach." },
          { text: "Leave the classroom crying", score: 20, feedback: "It's okay to feel upset, but leaving might reinforce the bully's behavior. Try to stay calm and address it properly." },
          { text: "Laugh along with them to fit in", score: 10, feedback: "This might seem easier, but it validates the bully's behavior and can damage your self-esteem." }
        ]
      },
      {
        situation: "You talk to the teacher after class, but the bullying continues the next day. The bully says 'You're a snitch!' What's your next step?",
        choices: [
          { text: "Stop reporting and just take it", score: 0, feedback: "Never stop speaking up. The bully is trying to silence you." },
          { text: "Report again and ask for specific actions to be taken", score: 100, feedback: "Persistence is key. Keep documenting and escalate if needed." },
          { text: "Confront the bully alone after school", score: 10, feedback: "Confronting alone could be dangerous. Always involve trusted adults." },
          { text: "Post about it on social media to shame them", score: 20, feedback: "This could make things worse and even get you in trouble. Stick to proper channels." }
        ]
      }
    ]
  },
  {
    id: "cyberbullying",
    title: "Cyberbullying Attack",
    description: "Someone is spreading rumors about you online",
    difficulty: "Medium",
    category: "Online",
    steps: [
      {
        situation: "You discover someone has created a fake account pretending to be you and is posting embarrassing content. Friends are asking if it's really you. What do you do first?",
        choices: [
          { text: "Create fake accounts to attack them back", score: 0, feedback: "This makes you a bully too and could have legal consequences." },
          { text: "Screenshot everything, then report the account to the platform", score: 100, feedback: "Perfect! Evidence is crucial, and platform reporting is the proper first step." },
          { text: "Delete all your social media accounts immediately", score: 30, feedback: "While understandable, this won't stop the fake account and lets the bully win." },
          { text: "Try to figure out who it is and confront them at school", score: 20, feedback: "Confrontation could backfire. Focus on official channels first." }
        ]
      },
      {
        situation: "The platform takes down the account, but a new one appears. The posts are getting more harmful and personal. What's your escalation plan?",
        choices: [
          { text: "Give up, they'll always find a way", score: 0, feedback: "Never give up. There are always more steps you can take." },
          { text: "Tell your parents and consider involving police", score: 100, feedback: "Excellent! This level of persistent harassment may be criminal. Adult involvement is essential." },
          { text: "Try to trace their IP address yourself", score: 20, feedback: "Leave technical investigation to authorities. Your safety is what matters." },
          { text: "Post publicly asking people to report the account", score: 50, feedback: "Community support helps, but you should also involve adults and possibly authorities." }
        ]
      }
    ]
  },
  {
    id: "physical-threat",
    title: "Physical Threat",
    description: "Someone threatens to hurt you after school",
    difficulty: "Hard",
    category: "Safety",
    steps: [
      {
        situation: "A bigger student corners you in the hallway and says 'You're dead after school.' Other students saw it happen. What's your immediate response?",
        choices: [
          { text: "Say 'I'm not scared of you' and walk away tough", score: 30, feedback: "While confidence is good, antagonizing could escalate things. Safety first." },
          { text: "Immediately go to the nearest teacher or office and report it", score: 100, feedback: "Correct! Physical threats must be reported immediately. This is not 'snitching' - it's protecting yourself." },
          { text: "Find friends to back you up for the fight", score: 0, feedback: "Fighting puts you at risk of injury and punishment. Always seek adult help." },
          { text: "Stay quiet and hope they forget about it", score: 10, feedback: "Never ignore physical threats. They rarely just 'go away.'" }
        ]
      },
      {
        situation: "You reported it, but school is ending soon. The threat was made for after school. How do you stay safe getting home?",
        choices: [
          { text: "Leave by a different exit with friends or a trusted adult", score: 100, feedback: "Perfect! Change your routine and use safety in numbers." },
          { text: "Wait inside until very late when they've given up", score: 50, feedback: "Staying inside is safer, but make sure an adult knows where you are." },
          { text: "Go out the regular way - you won't let them change your life", score: 10, feedback: "Bravery is admirable, but not at the cost of your safety. Being smart isn't being weak." },
          { text: "Have a parent or guardian pick you up today", score: 90, feedback: "Excellent choice! Having a trusted adult present is one of the safest options." }
        ]
      }
    ]
  }
];

const SafetyRoleplay = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  const handleChoiceSelect = (choice: Choice) => {
    setSelectedChoice(choice);
    setTotalScore(totalScore + choice.score);
  };

  const handleNext = () => {
    if (!selectedScenario) return;
    
    if (currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedChoice(null);
    } else {
      // Scenario complete
      setCompletedScenarios([...completedScenarios, selectedScenario.id]);
    }
  };

  const resetScenario = () => {
    setSelectedScenario(null);
    setCurrentStep(0);
    setSelectedChoice(null);
    setTotalScore(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-amber-500";
      case "Hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getScoreMessage = () => {
    if (!selectedScenario) return "";
    const maxScore = selectedScenario.steps.length * 100;
    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage >= 80) return "Excellent! You handled this situation perfectly!";
    if (percentage >= 60) return "Good job! You made mostly safe choices.";
    if (percentage >= 40) return "You can improve. Review the feedback above.";
    return "Consider safer choices next time. Your safety is important!";
  };

  if (selectedScenario) {
    const step = selectedScenario.steps[currentStep];
    const isComplete = currentStep >= selectedScenario.steps.length - 1 && selectedChoice !== null;
    const maxScore = selectedScenario.steps.length * 100;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={resetScenario}>
          ← Back to Scenarios
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedScenario.title}</CardTitle>
                <CardDescription>Step {currentStep + 1} of {selectedScenario.steps.length}</CardDescription>
              </div>
              <Badge className={getDifficultyColor(selectedScenario.difficulty)}>
                {selectedScenario.difficulty}
              </Badge>
            </div>
            <Progress value={((currentStep + (selectedChoice ? 1 : 0)) / selectedScenario.steps.length) * 100} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{step.situation}</p>
            </div>

            <div className="space-y-2">
              {step.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => !selectedChoice && handleChoiceSelect(choice)}
                  disabled={selectedChoice !== null}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedChoice === choice
                      ? choice.score >= 80
                        ? "border-green-500 bg-green-500/10"
                        : choice.score >= 40
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-red-500 bg-red-500/10"
                      : selectedChoice
                      ? "opacity-50"
                      : "hover:bg-accent cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedChoice === choice && (
                      choice.score >= 80 
                        ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        : choice.score >= 40
                        ? <Star className="h-5 w-5 text-amber-500 mt-0.5" />
                        : <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p>{choice.text}</p>
                      {selectedChoice === choice && (
                        <p className="text-sm text-muted-foreground mt-2">{choice.feedback}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedChoice && !isComplete && (
              <Button onClick={handleNext} className="w-full">
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {isComplete && (
              <Card className="border-primary">
                <CardContent className="pt-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Scenario Complete!</h3>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-6 w-6 ${i < Math.ceil((totalScore / maxScore) * 5) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                      />
                    ))}
                  </div>
                  <p className="text-lg font-semibold">{totalScore} / {maxScore} points</p>
                  <p className="text-muted-foreground">{getScoreMessage()}</p>
                  <Button onClick={resetScenario}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Another Scenario
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Role-Play Scenarios
          </CardTitle>
          <CardDescription>
            Practice handling difficult situations in a safe environment. Learn what to do when...
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const isCompleted = completedScenarios.includes(scenario.id);
          
          return (
            <Card key={scenario.id} className={isCompleted ? "border-green-500/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{scenario.category}</Badge>
                  <Badge className={getDifficultyColor(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {scenario.steps.length} decisions
                  </span>
                  {isCompleted && (
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setCurrentStep(0);
                    setSelectedChoice(null);
                    setTotalScore(0);
                  }}
                  className="w-full mt-4"
                  variant={isCompleted ? "outline" : "default"}
                >
                  {isCompleted ? "Play Again" : "Start Scenario"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SafetyRoleplay;
