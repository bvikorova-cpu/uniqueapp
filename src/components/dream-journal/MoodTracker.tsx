import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MoodTrackerProps {
  onSuccess: () => void;
}

const MoodTracker = ({ onSuccess }: MoodTrackerProps) => {
  const { toast } = useToast();
  const [mood, setMood] = useState("neutral");
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("mood_logs").insert([{
        mood: mood as any,
        energy_level: energyLevel[0],
        stress_level: stressLevel[0],
        notes: notes || null,
        user_id: user.id
      }]);

      if (insertError) throw insertError;

      toast({ title: "Success", description: "Mood logged successfully!" });
      setMood("neutral");
      setEnergyLevel([5]);
      setStressLevel([5]);
      setNotes("");
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Mood Tracker'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Mood Tracker panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="mood">How are you feeling?</Label>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="very_good">😄 Very Good</SelectItem>
            <SelectItem value="good">🙂 Good</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="bad">😕 Bad</SelectItem>
            <SelectItem value="very_bad">😢 Very Bad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <Label>Energy Level</Label>
          <span className="text-sm text-muted-foreground">{energyLevel[0]}/10</span>
        </div>
        <Slider
          value={energyLevel}
          onValueChange={setEnergyLevel}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <Label>Stress Level</Label>
          <span className="text-sm text-muted-foreground">{stressLevel[0]}/10</span>
        </div>
        <Slider
          value={stressLevel}
          onValueChange={setStressLevel}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything specific affecting your mood today?"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Save Mood Log
      </Button>
    </form>
    </>
  );
};

export default MoodTracker;