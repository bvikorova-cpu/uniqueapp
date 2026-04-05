import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export function AICourseOutlineView({ onBack }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("beginners");
  const [modules, setModules] = useState("6");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateOutline = async () => {
    if (!title.trim()) {
      toast({ title: "Missing Title", description: "Enter a course title", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-outline', title, audience, modules: parseInt(modules) }
      });
      if (error) throw error;
      setOutline(data.result);
      toast({ title: "Outline Generated!", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-violet-500" />
          <div>
            <h2 className="text-2xl font-black">AI Course Outline</h2>
            <p className="text-muted-foreground">AI designs your complete course structure</p>
          </div>
          <Badge className="ml-auto bg-violet-500/10 text-violet-500">4 Credits</Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Complete React Development" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="beginners">Beginners</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professionals">Professionals</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Modules</label>
                <select value={modules} onChange={e => setModules(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="4">4 Modules</option>
                  <option value="6">6 Modules</option>
                  <option value="8">8 Modules</option>
                  <option value="12">12 Modules</option>
                </select>
              </div>
            </div>
            <Button onClick={generateOutline} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><FileText className="w-4 h-4 mr-2" />Generate Outline (4 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {outline && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Outline</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outline); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-4">{outline}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
