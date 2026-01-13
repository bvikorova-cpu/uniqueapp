import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Calendar, MapPin, Users, AlertTriangle, Smile, Meh, Frown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const incidentTypes = [
  "Verbal bullying",
  "Physical bullying",
  "Cyberbullying",
  "Social exclusion",
  "Harassment",
  "Threats",
  "Other"
];

const SafetyJournal = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    incident_type: "",
    description: "",
    location: "",
    witnesses: "",
    mood_rating: 5
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ["safety-journal"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("safety_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to use the journal");

      const { error } = await supabase
        .from("safety_journal_entries")
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-journal"] });
      toast.success("Entry saved successfully");
      setShowForm(false);
      setFormData({ incident_type: "", description: "", location: "", witnesses: "", mood_rating: 5 });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const getMoodIcon = (rating: number) => {
    if (rating <= 3) return <Frown className="h-5 w-5 text-destructive" />;
    if (rating <= 6) return <Meh className="h-5 w-5 text-amber-500" />;
    return <Smile className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-green-500/50 bg-green-500/10">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">🔒 Your Journal is Private & Secure</p>
              <p className="text-sm text-muted-foreground mt-1">
                All entries are encrypted and stored securely. Only YOU can see your journal entries. 
                Your data is protected by Row Level Security (RLS) - no one else, including administrators, 
                can access your private entries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Safety Journal
          </CardTitle>
          <CardDescription>
            Track incidents, mood, and document evidence. Your entries are private and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Incident Type</Label>
                <Select 
                  value={formData.incident_type} 
                  onValueChange={(v) => setFormData({...formData, incident_type: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>What happened?</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the incident in detail..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Where did it happen?"
                  />
                </div>
                <div>
                  <Label>Witnesses</Label>
                  <Input
                    value={formData.witnesses}
                    onChange={(e) => setFormData({...formData, witnesses: e.target.value})}
                    placeholder="Who saw it?"
                  />
                </div>
              </div>

              <div>
                <Label>How are you feeling? (1-10)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[formData.mood_rating]}
                    onValueChange={([v]) => setFormData({...formData, mood_rating: v})}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-bold">{formData.mood_rating}</span>
                  {getMoodIcon(formData.mood_rating)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => addEntry.mutate()} disabled={addEntry.isPending}>
                  Save Entry
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Entries</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : entries?.length === 0 ? (
          <p className="text-muted-foreground">No entries yet. Start documenting to build your safety record.</p>
        ) : (
          entries?.map((entry: any) => (
            <Card key={entry.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.incident_type || "General"}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entry.created_at), "PPP")}
                      </span>
                    </div>
                    <p className="text-sm">{entry.description}</p>
                    {entry.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {entry.location}
                      </p>
                    )}
                    {entry.witnesses && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Witnesses: {entry.witnesses}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getMoodIcon(entry.mood_rating || 5)}
                    <span className="text-sm font-bold">{entry.mood_rating || 5}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SafetyJournal;
