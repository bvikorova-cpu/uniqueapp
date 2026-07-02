import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CheckinFormProps {
  selectedCafeId: string | null;
}

export const CheckinForm = ({ selectedCafeId }: CheckinFormProps) => {
  const [notes, setNotes] = useState('');
  const [drinkType, setDrinkType] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkinMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!selectedCafeId) {
        throw new Error('Please select a cafe first');
      }

      // Create check-in
      const { error: checkinError } = await supabase
        .from('coffee_checkins')
        .insert({
          user_id: user.id,
          cafe_id: selectedCafeId,
          notes,
          drink_type: drinkType
        });

      if (checkinError) throw checkinError;

      // Update user points
      const { error: pointsError } = await supabase.rpc('add_user_points', {
        p_user_id: user.id,
        p_points: 5,
        p_activity_type: 'coffee_checkin'
      });

      if (pointsError) throw pointsError;
    },
    onSuccess: () => {
      toast({
        title: 'Check-in successful!',
        description: 'You earned 5 points'
      });
      setNotes('');
      setDrinkType('');
      queryClient.invalidateQueries({ queryKey: ['coffee-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Check-in failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return (
    <>
      <FloatingHowItWorks title={"Checkin Form - How it works"} steps={[{ title: 'Open', desc: 'Access the Checkin Form section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Checkin Form.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Check In</CardTitle>
        <CardDescription>Share your coffee experience and earn 5 points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="drink-type">Coffee Type</Label>
          <Select value={drinkType} onValueChange={setDrinkType}>
            <SelectTrigger id="drink-type">
              <SelectValue placeholder="Select coffee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="espresso">Espresso</SelectItem>
              <SelectItem value="cappuccino">Cappuccino</SelectItem>
              <SelectItem value="latte">Latte</SelectItem>
              <SelectItem value="americano">Americano</SelectItem>
              <SelectItem value="flat-white">Flat White</SelectItem>
              <SelectItem value="mocha">Mocha</SelectItem>
              <SelectItem value="macchiato">Macchiato</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was your coffee?"
            rows={4}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={() => checkinMutation.mutate()}
          disabled={checkinMutation.isPending || !selectedCafeId}
        >
          {checkinMutation.isPending ? 'Checking in...' : 'Check In'}
        </Button>

        {!selectedCafeId && (
          <p className="text-sm text-muted-foreground text-center">
            Select a cafe from the Cafes tab first
          </p>
        )}
      </CardContent>
    </Card>
    </>
  );
};