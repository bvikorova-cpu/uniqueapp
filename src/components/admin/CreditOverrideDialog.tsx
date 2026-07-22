import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Coins, Plus, Minus } from "lucide-react";

interface CreditOverrideDialogProps {
  userId: string;
  userName: string;
  onUpdate?: () => void;
}

const CREDIT_TYPES = [
  { id: 'ai_credits', name: 'AI Credits', table: 'ai_credits', field: 'credits_remaining' },
  { id: 'analyzer_credits', name: 'Analyzer Credits', table: 'analyzer_credits', field: 'credits_remaining' },
  { id: 'iq_credits', name: 'IQ Credits', table: 'brain_duel_credits', field: 'credits' },
  { id: 'antique_credits', name: 'Antique Credits', table: 'antique_credits', field: 'credits_remaining' },
  { id: 'astrology_credits', name: 'Astrology Credits', table: 'astrology_credits', field: 'credits_remaining' },
];

export const CreditOverrideDialog = ({ userId, userName, onUpdate }: CreditOverrideDialogProps) => {
  const [open, setOpen] = useState(false);
  const [creditType, setCreditType] = useState('ai_credits');
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'add' | 'remove'>('add');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => { if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number",
        variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const selectedType = CREDIT_TYPES.find(t => t.id === creditType);
      if (!selectedType) throw new Error('Invalid credit type');

      // First check if user has credits record
      const { data: existing } = await supabase
        .from(selectedType.table as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const adjustAmount = operation === 'add' ? Number(amount) : -Number(amount);

      if (existing) {
        // Update existing record
        const currentCredits = existing[selectedType.field] || 0;
        const newCredits = Math.max(0, currentCredits + adjustAmount);

        const { error } = await supabase
          .from(selectedType.table as any)
          .update({ [selectedType.field]: newCredits })
          .eq('user_id', userId);

        if (error) throw error;
      } else if (operation === 'add') {
        // Create new record only if adding credits
        const { error } = await supabase
          .from(selectedType.table as any)
          .insert({ 
            user_id: userId, 
            [selectedType.field]: Number(amount)
          });

        if (error) throw error;
      } else { toast({
          title: "No Credits Found",
          description: "User has no credits to remove",
          variant: "destructive" });
        setLoading(false);
        return;
      }

      toast({
        title: "Credits Updated",
        description: `${operation === 'add' ? 'Added' : 'Removed'} ${amount} ${selectedType.name} ${operation === 'add' ? 'to' : 'from'} ${userName}` });

      setOpen(false);
      setAmount('');
      onUpdate?.();
    } catch (error) { console.error('Credit override error:', error);
      toast({
        title: "Error",
        description: "Failed to update credits",
        variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Coins className="h-4 w-4 mr-1" />
          Credits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credit Override - {userName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Credit Type</Label>
            <Select value={creditType} onValueChange={setCreditType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDIT_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Operation</Label>
            <div className="flex gap-2">
              <Button 
                variant={operation === 'add' ? 'default' : 'outline'}
                onClick={() => setOperation('add')}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button 
                variant={operation === 'remove' ? 'destructive' : 'outline'}
                onClick={() => setOperation('remove')}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Apply Credit Change'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
