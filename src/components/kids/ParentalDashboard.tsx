import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Clock, 
  Eye, 
  Lock, 
  Bell,
  BarChart3,
  Users,
  Star,
  Award
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ChildProfile {
  id: string;
  name: string;
  avatar?: string;
  age: number;
  watchTime: number;
  maxWatchTime: number;
  completedLessons: number;
  earnedStars: number;
}

interface ParentalDashboardProps {
  children?: ChildProfile[];
  onUpdateSettings?: (settings: any) => void;
}

const defaultChildren: ChildProfile[] = [
  {
    id: "1",
    name: "Tommy",
    age: 7,
    watchTime: 45,
    maxWatchTime: 60,
    completedLessons: 12,
    earnedStars: 35,
  },
  {
    id: "2",
    name: "Emma",
    age: 5,
    watchTime: 30,
    maxWatchTime: 45,
    completedLessons: 8,
    earnedStars: 22,
  },
];

export const ParentalDashboard = ({
  children = defaultChildren,
}: ParentalDashboardProps) => {
  const [settings, setSettings] = useState({
    contentFilter: true,
    ageRestriction: true,
    adsFree: true,
    notifications: true,
    downloadEnabled: false,
  });

  const [timeLimits, setTimeLimits] = useState<Record<string, number>>({
    "1": 60,
    "2": 45,
  });

  return (
    <>
      <FloatingHowItWorks title={"Parental Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Parental Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Parental Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Parental Dashboard
        </h2>
        <Badge variant="outline" className="text-green-500 border-green-500">
          <Lock className="h-3 w-3 mr-1" />
          Secured
        </Badge>
      </div>

      {/* Children Profiles */}
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{child.age} years old</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Watch Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Watch time today
                  </span>
                  <span>{child.watchTime}/{child.maxWatchTime} min</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      child.watchTime / child.maxWatchTime > 0.8
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (child.watchTime / child.maxWatchTime) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Time Limit Slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Daily limit: {timeLimits[child.id]} min
                </label>
                <Slider
                  value={[timeLimits[child.id]]}
                  onValueChange={([value]) =>
                    setTimeLimits((prev) => ({ ...prev, [child.id]: value }))
                  }
                  min={15}
                  max={120}
                  step={15}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Award className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{child.completedLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-lg font-bold">{child.earnedStars}</p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "contentFilter",
              icon: Eye,
              label: "Content Filter",
              description: "Block inappropriate content",
            },
            {
              key: "ageRestriction",
              icon: Users,
              label: "Age Restriction",
              description: "Show only age-appropriate content",
            },
            {
              key: "adsFree",
              icon: Shield,
              label: "Ad-Free",
              description: "Remove all advertisements",
            },
            {
              key: "notifications",
              icon: Bell,
              label: "Notifications",
              description: "Get notified about child activity",
            },
            {
              key: "downloadEnabled",
              icon: BarChart3,
              label: "Downloads",
              description: "Allow video downloads",
            },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <setting.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings[setting.key as keyof typeof settings]}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, [setting.key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default ParentalDashboard;
