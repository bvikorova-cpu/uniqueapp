import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Home, ArrowLeft, Calendar, Wrench, AlertTriangle, Check, Clock, Lightbulb, Flame, Droplets, Wind, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  frequency: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
  lastCompleted?: string;
}

const initialTasks: MaintenanceTask[] = [
  {
    id: "1",
    title: "Replace HVAC Filter",
    description: "Change air filter to maintain air quality and system efficiency",
    frequency: "Every 1-3 months",
    category: "HVAC",
    priority: "High",
    completed: false
  },
  {
    id: "2",
    title: "Test Smoke Detectors",
    description: "Press test button on all smoke and CO detectors",
    frequency: "Monthly",
    category: "Safety",
    priority: "High",
    completed: false
  },
  {
    id: "3",
    title: "Clean Gutters",
    description: "Remove debris from gutters and downspouts",
    frequency: "Twice yearly (Spring/Fall)",
    category: "Exterior",
    priority: "Medium",
    completed: false
  },
  {
    id: "4",
    title: "Flush Water Heater",
    description: "Drain tank to remove sediment buildup",
    frequency: "Annually",
    category: "Plumbing",
    priority: "Medium",
    completed: false
  },
  {
    id: "5",
    title: "Clean Dryer Vent",
    description: "Remove lint buildup from dryer vent to prevent fires",
    frequency: "Annually",
    category: "Appliances",
    priority: "High",
    completed: false
  },
  {
    id: "6",
    title: "Check Caulking",
    description: "Inspect and repair caulk around windows, tubs, and sinks",
    frequency: "Annually",
    category: "Interior",
    priority: "Low",
    completed: false
  },
  {
    id: "7",
    title: "Service HVAC System",
    description: "Professional inspection and tune-up",
    frequency: "Twice yearly (Spring/Fall)",
    category: "HVAC",
    priority: "Medium",
    completed: false
  },
  {
    id: "8",
    title: "Test Sump Pump",
    description: "Pour water into pit to verify pump activates",
    frequency: "Quarterly",
    category: "Plumbing",
    priority: "Medium",
    completed: false
  }
];

interface DIYTip {
  title: string;
  problem: string;
  solution: string;
  tools: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

const diyTips: DIYTip[] = [
  {
    title: "Unclog a Drain",
    problem: "Slow-draining sink or tub",
    solution: "1. Try a plunger first. 2. Use baking soda + vinegar (1/2 cup each, wait 30 min). 3. Use a drain snake for stubborn clogs. 4. Clean the P-trap if needed.",
    tools: ["Plunger", "Baking soda", "Vinegar", "Drain snake"],
    difficulty: "Easy"
  },
  {
    title: "Fix a Running Toilet",
    problem: "Toilet runs continuously",
    solution: "1. Check the flapper for wear/damage - replace if needed (~$5). 2. Adjust the float to proper water level. 3. Check fill valve for issues. Most fixes take 15-30 minutes.",
    tools: ["New flapper", "Adjustable wrench"],
    difficulty: "Easy"
  },
  {
    title: "Patch Drywall Holes",
    problem: "Small to medium holes in drywall",
    solution: "1. Clean edges of hole. 2. For small holes: apply spackle, let dry, sand. 3. For larger holes: use patch kit with mesh. 4. Prime and paint to match.",
    tools: ["Spackle", "Putty knife", "Sandpaper", "Paint"],
    difficulty: "Medium"
  },
  {
    title: "Silence Squeaky Doors",
    problem: "Door hinges squeak when opened",
    solution: "1. Remove hinge pin. 2. Clean with steel wool. 3. Apply WD-40 or petroleum jelly. 4. Reinstall pin and work door back and forth.",
    tools: ["WD-40 or lubricant", "Steel wool", "Hammer", "Nail"],
    difficulty: "Easy"
  }
];

const HomeMaintenance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [selectedDIY, setSelectedDIY] = useState<DIYTip | null>(null);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = (completedCount / tasks.length) * 100;
  const highPriorityPending = tasks.filter(t => t.priority === "High" && !t.completed).length;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          toast({
            title: "Task Completed! ✓",
            description: `${t.title} marked as done.`,
          });
        }
        return { 
          ...t, 
          completed: !t.completed,
          lastCompleted: !t.completed ? new Date().toLocaleDateString() : undefined
        };
      }
      return t;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500";
      case "Medium": return "bg-yellow-500";
      case "Low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "HVAC": return Wind;
      case "Safety": return Shield;
      case "Plumbing": return Droplets;
      case "Appliances": return Flame;
      default: return Home;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Home Maintenance Planner
            </h1>
            <p className="text-muted-foreground">Keep your home in top condition</p>
          </div>
          {highPriorityPending > 0 && (
            <Badge className="bg-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {highPriorityPending} Urgent
            </Badge>
          )}
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="tasks">Task List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="diy">DIY Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Progress Overview */}
            <Card className="border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Maintenance Progress</h3>
                    <p className="text-sm text-muted-foreground">{completedCount} of {tasks.length} tasks completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</p>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </CardContent>
            </Card>

            {/* Task List by Priority */}
            {["High", "Medium", "Low"].map((priority) => {
              const priorityTasks = tasks.filter(t => t.priority === priority);
              if (priorityTasks.length === 0) return null;

              return (
                <div key={priority}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge className={getPriorityColor(priority)}>{priority} Priority</Badge>
                    <span className="text-sm text-muted-foreground">
                      ({priorityTasks.filter(t => !t.completed).length} pending)
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {priorityTasks.map((task) => {
                      const Icon = getCategoryIcon(task.category);
                      return (
                        <Card 
                          key={task.id}
                          className={`border-blue-500/30 transition-all ${task.completed ? 'opacity-60' : ''}`}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                id={task.id}
                                checked={task.completed}
                                onCheckedChange={() => toggleTask(task.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="h-4 w-4 text-blue-400" />
                                  <Label 
                                    htmlFor={task.id}
                                    className={`font-semibold cursor-pointer ${task.completed ? 'line-through' : ''}`}
                                  >
                                    {task.title}
                                  </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.frequency}
                                  </span>
                                  <Badge variant="outline" className="text-xs">{task.category}</Badge>
                                  {task.lastCompleted && (
                                    <span className="text-green-400">
                                      <Check className="h-3 w-3 inline mr-1" />
                                      Last: {task.lastCompleted}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { month: "Monthly", tasks: ["Test smoke/CO detectors", "Check HVAC filter", "Inspect fire extinguisher"] },
                { month: "Quarterly", tasks: ["Test sump pump", "Clean range hood filter", "Check weather stripping"] },
                { month: "Biannually", tasks: ["Clean gutters", "Service HVAC", "Deep clean appliances", "Check roof for damage"] },
                { month: "Annually", tasks: ["Flush water heater", "Clean dryer vent", "Inspect plumbing", "Check caulking/grout", "Service garage door"] }
              ].map((schedule, index) => (
                <Card key={index} className="border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      {schedule.month}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {schedule.tasks.map((task, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-blue-400" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diy" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {diyTips.map((tip, index) => (
                <Card 
                  key={index}
                  className="border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition-all"
                  onClick={() => setSelectedDIY(tip)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wrench className="h-5 w-5 text-blue-400" />
                        {tip.title}
                      </CardTitle>
                      <Badge className={getDifficultyColor(tip.difficulty)}>{tip.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Problem:</strong> {tip.problem}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tip.tools.slice(0, 3).map((tool, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tool}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* DIY Detail Modal */}
            {selectedDIY && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg border-blue-500/30 bg-background max-h-[80vh] overflow-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-400" />
                        {selectedDIY.title}
                      </CardTitle>
                      <Badge className={getDifficultyColor(selectedDIY.difficulty)}>
                        {selectedDIY.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Problem</h4>
                      <p>{selectedDIY.problem}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        Solution
                      </h4>
                      <p className="text-sm whitespace-pre-line">{selectedDIY.solution}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tools Needed</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDIY.tools.map((tool, i) => (
                          <Badge key={i} variant="outline">{tool}</Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => setSelectedDIY(null)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Close
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeMaintenance;
