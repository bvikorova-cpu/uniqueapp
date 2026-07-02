import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Plus, Mail, Send, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CollaborativeCapsule = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [contributors, setContributors] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const addContributor = () => setContributors(prev => [...prev, ""]);
  const updateContributor = (i: number, val: string) => setContributors(prev => { const n = [...prev]; n[i] = val; return n; });
  const removeContributor = (i: number) => setContributors(prev => prev.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    if (!title || !deliveryDate) {
      toast({ title: "Missing Info", description: "Please fill in title and delivery date.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Collaborative Capsule Created!", description: `Invitations sent to ${contributors.filter(c => c).length} contributors.` });
      setLoading(false);
      setTitle(""); setDescription(""); setContributors([""]); setDeliveryDate("");
    }, 1500);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Collaborative Capsule'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Collaborative Capsule panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Collaborative Capsule
      </h2>
      <p className="text-sm text-muted-foreground">Create a group time capsule where multiple people contribute messages, photos, and videos.</p>

      <Card className="border-primary/20">
        <CardHeader><CardTitle className="text-lg">New Group Capsule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Capsule Title</Label>
            <Input placeholder="E.g., Class of 2025 Reunion Capsule" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="What is this capsule about?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Delivery Date</Label>
            <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Contributors</Label>
            {contributors.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <Input type="email" placeholder="contributor@email.com" value={c} onChange={(e) => updateContributor(i, e.target.value)} />
                {contributors.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeContributor(i)} className="shrink-0 text-destructive">×</Button>
                )}
              </motion.div>
            ))}
            <Button variant="outline" size="sm" onClick={addContributor} className="gap-1"><Plus className="w-3 h-3" /> Add Contributor</Button>
          </div>

          <Button className="w-full" size="lg" onClick={handleCreate} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><Send className="mr-2 h-4 w-4" /> Create & Send Invitations</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-amber-500/5">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-2">How Collaborative Capsules Work</h3>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Create a capsule and invite contributors via email</li>
            <li>Each contributor receives a private link to add their message</li>
            <li>Everyone can add text, photos, or video messages</li>
            <li>On the delivery date, all contributors receive the combined capsule</li>
          </ol>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
