import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, MessageCircle, MapPin, Heart, AlertTriangle, ExternalLink } from 'lucide-react';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface EmergencyResource {
  name: string;
  description: string;
  phone?: string;
  website?: string;
  available: string;
  type: 'crisis' | 'support' | 'local';
}

const defaultResources: EmergencyResource[] = [
  {
    name: 'Forget-Me-Not Trust Line (SK)',
    description: '24/7 anonymous psychological help in crisis situations',
    phone: '0800 800 566',
    available: '24/7',
    type: 'crisis',
  },
  {
    name: 'IPčko – internet counseling for young people',
    description: 'Online chat and email counseling from psychologists',
    website: 'https://ipcko.sk',
    available: '7:00 – 24:00',
    type: 'support',
  },
  {
    name: 'Emergency line',
    description: 'For immediate threat to life or health',
    phone: '112',
    available: '24/7',
    type: 'crisis',
  },
  {
    name: 'League for Mental Health',
    description: 'Directory of support groups and experts internationally',
    website: 'https://dusevnezdravie.sk',
    available: 'Varies',
    type: 'local',
  },
];

interface EmergencyResourcesProps {
  resources?: EmergencyResource[];
  showCrisisAlert?: boolean;
}

export const EmergencyResources = ({ 
  resources = defaultResources, 
  showCrisisAlert = true 
}: EmergencyResourcesProps) => {
  return (
    <Card>
      <FloatingHowItWorks title="EmergencyResources — How it works" steps={[{title:"Open this tool",desc:"Access EmergencyResources within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Emergency Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCrisisAlert && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>If you're in immediate danger</AlertTitle>
            <AlertDescription>
              Please call emergency services (112) or go to your nearest emergency room.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${
                resource.type === 'crisis' 
                  ? 'border-red-500/30 bg-red-500/5' 
                  : 'bg-muted/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {resource.name}
                        {resource.type === 'crisis' && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            CRISIS
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Available: {resource.available}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {resource.phone && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${resource.phone}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </a>
                        </Button>
                      )}
                      {resource.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={resource.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Visit
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            You are not alone. Help is available. 💚
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProgressGraphs = ({ 
  data = [
    { date: 'Mon', mood: 7, anxiety: 4, energy: 6 },
    { date: 'Tue', mood: 6, anxiety: 5, energy: 5 },
    { date: 'Wed', mood: 8, anxiety: 3, energy: 7 },
    { date: 'Thu', mood: 7, anxiety: 4, energy: 6 },
    { date: 'Fri', mood: 9, anxiety: 2, energy: 8 },
    { date: 'Sat', mood: 8, anxiety: 3, energy: 7 },
    { date: 'Sun', mood: 7, anxiety: 4, energy: 6 },
  ]
}: { data?: Array<{ date: string; mood: number; anxiety: number; energy: number }> }) => {
  const maxValue = 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Mood</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">Anxiety</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Energy</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-40">
            {data.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center gap-0.5 h-32">
                  <motion.div
                    className="w-2 bg-green-500 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.mood / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  />
                  <motion.div
                    className="w-2 bg-orange-500 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.anxiety / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                  />
                  <motion.div
                    className="w-2 bg-blue-500 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.energy / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {(data.reduce((acc, d) => acc + d.mood, 0) / data.length).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Mood</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {(data.reduce((acc, d) => acc + d.anxiety, 0) / data.length).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Anxiety</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {(data.reduce((acc, d) => acc + d.energy, 0) / data.length).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Energy</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
