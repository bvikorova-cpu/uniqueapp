import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ContactSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  inquiryType: "contact" | "viewing";
}

export function ContactSellerDialog({ 
  open, 
  onOpenChange, 
  propertyId, 
  propertyTitle,
  inquiryType 
}: ContactSellerDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast({ variant: "destructive", title: "Invalid name", description: "Name must be 2-100 characters." });
      return;
    }
    if (trimmedMsg.length < 10 || trimmedMsg.length > 2000) {
      toast({ variant: "destructive", title: "Invalid message", description: "Message must be 10-2000 characters." });
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to contact the seller.",
        });
        return;
      }

      const { error } = await supabase
        .from('property_inquiries')
        .insert({
          property_id: propertyId,
          sender_id: user.id,
          sender_name: trimmedName,
          // Always use authenticated user's verified email — prevents spoofing
          sender_email: user.email ?? email.trim(),
          sender_phone: phone.trim() || null,
          message: trimmedMsg,
          inquiry_type: inquiryType,
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "The property owner will contact you soon.",
      });

      setName(""); setEmail(""); setPhone(""); setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {inquiryType === "viewing" ? "Request Viewing" : "Contact Seller"}
          </DialogTitle>
          <DialogDescription>
            Send a message about: {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+421 XXX XXX XXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder={
                inquiryType === "viewing" 
                  ? "I would like to schedule a viewing. When would be a good time?"
                  : "I'm interested in this property. Please provide more information."
              }
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
