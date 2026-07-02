import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CoffeePreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [coffeeTypes, setCoffeeTypes] = useState<string[]>([]);
  const [atmosphere, setAtmosphere] = useState<string[]>([]);
  const [budget, setBudget] = useState('moderate');

  const { data: profile } = useQuery({
    queryKey: ['coffee-profile-prefs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('coffee_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCoffeeTypes(data.favorite_coffee_types || []);
        setAtmosphere(data.preferred_atmosphere || []);
        setBudget(data.budget_preference || 'moderate');
      }

      return data;
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('coffee_profiles')
        .update({
          favorite_coffee_types: coffeeTypes,
          preferred_atmosphere: atmosphere,
          budget_preference: budget
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Preferences updated!',
        description: 'Your coffee preferences have been saved'
      });
      queryClient.invalidateQueries({ queryKey: ['coffee-profile-prefs'] });
    }
  });

  const coffeeOptions = ['Espresso', 'Cappuccino', 'Latte', 'Americano', 'Flat White', 'Mocha'];
  const atmosphereOptions = ['Quiet', 'Social', 'Cozy', 'Modern', 'Outdoor', 'Work-friendly'];

  return (
    <>
      <FloatingHowItWorks title={"Coffee Preferences - How it works"} steps={[{ title: 'Open', desc: 'Access the Coffee Preferences section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coffee Preferences.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Coffee Preferences</CardTitle>
        <CardDescription>Help us match you with like-minded coffee lovers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base mb-3 block">Favorite Coffee Types</Label>
          <div className="grid grid-cols-2 gap-3">
            {coffeeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={coffeeTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCoffeeTypes([...coffeeTypes, type]);
                    } else {
                      setCoffeeTypes(coffeeTypes.filter(t => t !== type));
                    }
                  }}
                />
                <label htmlFor={type} className="text-sm cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base mb-3 block">Preferred Atmosphere</Label>
          <div className="grid grid-cols-2 gap-3">
            {atmosphereOptions.map((atm) => (
              <div key={atm} className="flex items-center space-x-2">
                <Checkbox
                  id={atm}
                  checked={atmosphere.includes(atm)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAtmosphere([...atmosphere, atm]);
                    } else {
                      setAtmosphere(atmosphere.filter(a => a !== atm));
                    }
                  }}
                />
                <label htmlFor={atm} className="text-sm cursor-pointer">
                  {atm}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="budget" className="text-base mb-3 block">Budget Preference</Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="budget">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Budget (€-€€)</SelectItem>
              <SelectItem value="moderate">Moderate (€€-€€€)</SelectItem>
              <SelectItem value="premium">Premium (€€€€)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full" 
          onClick={() => updatePreferences.mutate()}
          disabled={updatePreferences.isPending}
        >
          {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
    </>
  );
};