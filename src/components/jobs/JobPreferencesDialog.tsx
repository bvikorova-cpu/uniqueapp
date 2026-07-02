import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X } from "lucide-react";


import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface JobPreferencesDialogProps {
  userId: string;
}

const CATEGORIES = {
  it_software: "IT & Software",
  marketing_sales: "Marketing & Sales",
  finance_accounting: "Finance & Accounting",
  healthcare: "Healthcare",
  education: "Education",
  engineering: "Engineering",
  hospitality: "Hospitality",
  retail: "Retail",
  manufacturing: "Manufacturing",
  construction: "Construction",
  transportation: "Transportation",
  other: "Other",
};

const JOB_TYPES = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

export function JobPreferencesDialog({ userId }: JobPreferencesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    categories: [] as string[],
    job_types: [] as string[],
    locations: [] as string[],
    min_salary: "",
    max_salary: "",
    notify_enabled: true,
  });

  const [locationInput, setLocationInput] = useState("");

  // Fetch existing preferences
  const { data: existingPreferences } = useQuery({
    queryKey: ["jobPreferences", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_job_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: open && !!userId,
  });

  // Load existing preferences when dialog opens
  useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        categories: existingPreferences.categories || [],
        job_types: existingPreferences.job_types || [],
        locations: existingPreferences.locations || [],
        min_salary: existingPreferences.min_salary?.toString() || "",
        max_salary: existingPreferences.max_salary?.toString() || "",
        notify_enabled: existingPreferences.notify_enabled ?? true,
      });
    }
  }, [existingPreferences]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("user_job_preferences")
        .upsert({
          user_id: userId,
          categories: preferences.categories,
          job_types: preferences.job_types,
          locations: preferences.locations,
          min_salary: preferences.min_salary ? parseInt(preferences.min_salary) : null,
          max_salary: preferences.max_salary ? parseInt(preferences.max_salary) : null,
          notify_enabled: preferences.notify_enabled,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPreferences"] });
      toast({
        title: "✅ Preferences Saved",
        description: "You will receive notifications about new job offers matching your preferences",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  const toggleCategory = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleJobType = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      job_types: prev.job_types.includes(type)
        ? prev.job_types.filter((t) => t !== type)
        : [...prev.job_types, type],
    }));
  };

  const addLocation = () => {
    if (locationInput.trim() && !preferences.locations.includes(locationInput.trim())) {
      setPreferences((prev) => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()],
      }));
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setPreferences((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== location),
    }));
  };

  return (
    <>
      <FloatingHowItWorks title="How Job Preferences Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs md:text-sm">
          <Bell className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">{"Notification Settings"}</span>
          <span className="sm:hidden">Notify</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{"Job Preferences"}</DialogTitle>
          <DialogDescription>
            {"Set your preferences and receive notifications about new offers that match"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label>{"Enable Notifications"}</Label>
              <p className="text-sm text-muted-foreground">
                {"Receive alerts about new job offers"}
              </p>
            </div>
            <Switch
              checked={preferences.notify_enabled}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, notify_enabled: checked }))
              }
            />
          </div>

          {/* Categories */}
          <div>
            <Label>{"Categories"}</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {"Select categories that interest you (leave empty for all)"}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={preferences.categories.includes(key) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Job Types */}
          <div>
            <Label>{"Employment Type"}</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {"Select position types (leave empty for all)"}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(JOB_TYPES).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={preferences.job_types.includes(key) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleJobType(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <Label>{"Locations"}</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {"Add locations where you are looking for work (leave empty for all)"}
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder={"e.g.: Berlin, Prague, Remote..."}
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
              <Button onClick={addLocation} type="button">
                {"Add"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.locations.map((location) => (
                <Badge key={location} variant="secondary" className="cursor-pointer">
                  {location}
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={() => removeLocation(location)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <Label>{"Salary Range (€/month)"}</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {"Minimum and maximum gross salary (leave empty for any)"}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_salary" className="text-sm">
                  {"Minimum"}
                </Label>
                <Input
                  id="min_salary"
                  type="number"
                  placeholder="2000"
                  value={preferences.min_salary}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, min_salary: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_salary" className="text-sm">
                  {"Maximum"}
                </Label>
                <Input
                  id="max_salary"
                  type="number"
                  placeholder="5000"
                  value={preferences.max_salary}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, max_salary: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full"
          >
            {saveMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
