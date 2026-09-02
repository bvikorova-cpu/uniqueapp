import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lightbulb, Loader2, ArrowLeft, MessageCircleReply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = [
  { value: "general", label: "General feedback" },
  { value: "new_feature", label: "New feature idea" },
  { value: "improvement", label: "Improve existing feature" },
  { value: "design", label: "Design / usability" },
  { value: "pricing", label: "Credits & pricing" },
  { value: "content", label: "Content & moderation" },
];

interface MySuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  response_message: string | null;
  response_at: string | null;
  created_at: string;
}

export default function Suggestions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [mySuggestions, setMySuggestions] = useState<MySuggestion[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to send a suggestion.");
      navigate("/auth");
      return;
    }
    if (title.trim().length < 4 || description.trim().length < 10) {
      toast.error("Please add a short title and a clear description.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("platform_suggestions" as never).insert({
      user_id: user.id,
      email: email || user.email || null,
      category,
      title: title.trim(),
      description: description.trim(),
      page_url: typeof window !== "undefined" ? window.location.href : null,
    } as never);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thank you! Your suggestion was sent to the Unique team.");
    setTitle("");
    setDescription("");
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Suggestions & ideas</h1>
            <p className="text-sm text-muted-foreground">
              Tell us what you would change or add to Unique. Every message goes straight to the team.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="font-semibold mb-1">How it works</div>
          <p className="text-muted-foreground">
            Pick a category, describe your idea and send it. We review all suggestions and use them to plan
            new features. Found a bug instead?{" "}
            <button type="button" className="underline" onClick={() => navigate("/report-bug")}>
              Report a bug
            </button>
            .
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Short title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add a dark mode toggle to the profile"
              required
              minLength={4}
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Your suggestion *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you would add or change and why it would help."
              required
              minLength={10}
              maxLength={4000}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="So we can reply to you"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
            Send suggestion
          </Button>
        </form>
      </Card>
    </div>
  );
}
