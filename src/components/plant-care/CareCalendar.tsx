import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Droplet, Sprout, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CareCalendar = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
    fetchPlants();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('plant_care_schedules')
        .select(`
          *,
          plants (name, image_url)
        `)
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPlants(data || []);
    } catch (error: any) {
      console.error('Error fetching plants:', error);
    }
  };

  const markAsDone = async (schedule: any) => {
    try {
      const today = new Date();
      const nextDue = addDays(today, schedule.frequency_days);

      const { error } = await supabase
        .from('plant_care_schedules')
        .update({
          last_done_date: format(today, 'yyyy-MM-dd'),
          next_due_date: format(nextDue, 'yyyy-MM-dd')
        })
        .eq('id', schedule.id);

      if (error) throw error;

      toast({
        title: "Task Completed!",
        description: `Next ${schedule.care_type} scheduled for ${format(nextDue, 'MMM d')}`,
      });

      fetchSchedules();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCareIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return <Droplet className="h-5 w-5 text-blue-500" />;
      case 'fertilizing':
        return <Sprout className="h-5 w-5 text-green-500" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Care Calendar - How it works"} steps={[{ title: 'Open', desc: 'Access the Care Calendar section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Care Calendar.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6">
        <p className="text-center">Loading care schedule...</p>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-green-500" />
          Care Schedule
        </h2>

        {schedules.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No care tasks scheduled</p>
            <p className="text-sm">Add plants to create care schedules</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className={`p-4 ${isOverdue(schedule.next_due_date) ? 'border-red-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {schedule.plants?.image_url && (
                      <img 
                        src={schedule.plants.image_url} 
                        alt={schedule.plants.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getCareIcon(schedule.care_type)}
                        <h3 className="font-semibold capitalize">{schedule.care_type}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schedule.plants?.name || 'Unknown plant'}
                      </p>
                      <p className="text-sm">
                        {isOverdue(schedule.next_due_date) ? (
                          <span className="text-red-500 font-semibold">Overdue!</span>
                        ) : (
                          <span>Due: {format(new Date(schedule.next_due_date), 'MMM d, yyyy')}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Every {schedule.frequency_days} days
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => markAsDone(schedule)}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Done
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};