import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TicketPricingManagerProps {
  concertId: string;
  onSuccess?: () => void;
}

export const TicketPricingManager = ({ concertId, onSuccess }: TicketPricingManagerProps) => {
  const [ticketTypes, setTicketTypes] = useState([
    { name: "standard", price: "", max_quantity: "", description: "" }
  ]);
  const [loading, setLoading] = useState(false);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "", max_quantity: "", description: "" }]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: string, value: string) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validTickets = ticketTypes.filter(t => t.name && t.price);
    if (validTickets.length === 0) {
      toast.error("Add at least one ticket type with name and price");
      return;
    }

    try {
      setLoading(true);
      
      const ticketsToInsert = validTickets.map(ticket => ({
        concert_id: concertId,
        name: ticket.name.toLowerCase(),
        price: parseFloat(ticket.price),
        max_quantity: ticket.max_quantity ? parseInt(ticket.max_quantity) : null,
        description: ticket.description || null,
      }));

      const { error } = await supabase
        .from("concert_ticket_types")
        .insert(ticketsToInsert);

      if (error) throw error;

      toast.success("Ticket prices saved!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving tickets:", error);
      toast.error("Error saving ticket prices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Ticket Pricing Manager works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <form onSubmit={handleSubmit} className="space-y-4">
      {ticketTypes.map((ticket, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Ticket Type {index + 1}</h4>
              {ticketTypes.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTicketType(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Input
                  placeholder="standard, vip, premium"
                  value={ticket.name}
                  onChange={(e) => updateTicketType(index, "name", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Price (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="10.00"
                  value={ticket.price}
                  onChange={(e) => updateTicketType(index, "price", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Quantity (optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Leave empty for unlimited"
                value={ticket.max_quantity}
                onChange={(e) => updateTicketType(index, "max_quantity", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What's included..."
                value={ticket.description}
                onChange={(e) => updateTicketType(index, "description", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addTicketType} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Ticket Type
      </Button>

      <div className="bg-muted/50 p-4 rounded-lg text-sm">
        <p className="font-semibold mb-1">Commission Structure:</p>
        <p>• You receive 80% of ticket price</p>
        <p>• Platform fee: 20%</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Ticket Prices"}
      </Button>
    </form>
    </>
    );
};
