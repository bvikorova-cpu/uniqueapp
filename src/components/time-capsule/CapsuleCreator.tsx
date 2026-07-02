import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Video, Mail, Calendar, Send, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CapsuleCreator = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [capsuleType, setCapsuleType] = useState<"text" | "video" | "letter">("text");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");

  const handleSubmit = async () => {
    if (!title || !deliveryDate) {
      toast({ title: "Missing Information", description: "Please fill in title and delivery date.", variant: "destructive" });
      return;
    }
    const now = new Date();
    const delivery = new Date(deliveryDate);
    if (delivery <= now) {
      toast({ title: "Invalid Date", description: "Delivery date must be in the future.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const durationYears = Math.floor((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365));
      const { error } = await supabase.functions.invoke("save-time-capsule", {
        body: { title, message, capsuleType, deliveryDate, recipientEmail, recipientName, durationYears, pricePaid: null, stripePaymentId: null },
      });
      if (error) throw error;
      toast({ title: "Time Capsule Created!", description: `Your message will be delivered on ${delivery.toLocaleDateString()}.` });
      setTitle(""); setMessage(""); setDeliveryDate(""); setRecipientEmail(""); setRecipientName("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create time capsule", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in", variant: "destructive" }); return; }
      const path = `time-capsule-videos/${session.user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
      setMessage(prev => prev + `\n[Video: ${urlData.publicUrl}]`);
      toast({ title: "Video uploaded!", description: "It will be included in your time capsule." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Capsule Creator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Capsule Creator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Create New Time Capsule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Capsule Title</Label>
            <Input id="title" placeholder="E.g., Letter to my 30-year-old self" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <Tabs value={capsuleType} onValueChange={(v) => setCapsuleType(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text"><FileText className="h-4 w-4 mr-1" /> Text</TabsTrigger>
              <TabsTrigger value="video"><Video className="h-4 w-4 mr-1" /> Video</TabsTrigger>
              <TabsTrigger value="letter"><Mail className="h-4 w-4 mr-1" /> Letter</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-3">
              <Label>Your Message</Label>
              <Textarea placeholder="Write your message here..." value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
            </TabsContent>
            <TabsContent value="video" className="space-y-3">
              <Label>Upload Video</Label>
              <Input type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }} />
              <Textarea placeholder="Add a note to your video..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
            </TabsContent>
            <TabsContent value="letter" className="space-y-3">
              <Label>Write Your Letter</Label>
              <Textarea placeholder="Dear future me..." value={message} onChange={(e) => setMessage(e.target.value)} rows={8} />
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label><Calendar className="h-4 w-4 inline mr-1" /> Delivery Date</Label>
              <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Recipient Name (Optional)</Label>
              <Input placeholder="Who should receive this?" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recipient Email (Optional)</Label>
            <Input type="email" placeholder="their@email.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</> : <><Send className="mr-2 h-5 w-5" /> Create Time Capsule</>}
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
