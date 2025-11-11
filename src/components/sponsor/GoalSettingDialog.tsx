import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const goalSchema = z.object({
  goal_type: z.enum(["votes", "rank", "daily_average"]),
  target_value: z.coerce.number().min(1, "Target must be at least 1"),
  deadline: z.string().min(1, "Please select a deadline"),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalSettingDialogProps {
  sponsorId: string;
  currentGoal?: any;
  onGoalSet: () => void;
}

export function GoalSettingDialog({ sponsorId, currentGoal, onGoalSet }: GoalSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goal_type: currentGoal?.goal_type || "votes",
      target_value: currentGoal?.target_value || 100,
      deadline: currentGoal?.deadline ? new Date(currentGoal.deadline).toISOString().split('T')[0] : "",
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("sponsor_goals")
        .upsert({
          sponsor_id: sponsorId,
          goal_type: data.goal_type,
          target_value: data.target_value,
          deadline: new Date(data.deadline).toISOString(),
          status: "active",
        }, {
          onConflict: "sponsor_id",
        });

      if (error) throw error;

      toast.success("Goal set successfully!");
      setOpen(false);
      onGoalSet();
    } catch (error) {
      console.error("Error setting goal:", error);
      toast.error("Failed to set goal");
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
          <Target className="mr-2 h-4 w-4" />
          {currentGoal ? "Update Goal" : "Set Goal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-purple-500/50">
        <DialogHeader>
          <DialogTitle className="text-white">Set Your Performance Goal</DialogTitle>
          <DialogDescription className="text-gray-400">
            Define a target to track your progress and stay motivated
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Goal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/40 border-purple-500/30 text-white">
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="votes">Total Votes</SelectItem>
                      <SelectItem value="rank">Category Rank</SelectItem>
                      <SelectItem value="daily_average">Daily Average Votes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-400">
                    Choose what you want to achieve
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Target Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter target value"
                      className="bg-black/40 border-purple-500/30 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    {form.watch("goal_type") === "votes" && "Total votes you want to reach"}
                    {form.watch("goal_type") === "rank" && "Target ranking position (e.g., 1 for #1)"}
                    {form.watch("goal_type") === "daily_average" && "Average votes per day"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={minDate.toISOString().split('T')[0]}
                      className="bg-black/40 border-purple-500/30 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    When do you want to achieve this goal?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-purple-500/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Goal...
                  </>
                ) : (
                  "Set Goal"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
