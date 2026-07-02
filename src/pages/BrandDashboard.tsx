import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Calendar, Euro, Tag } from "lucide-react";
import { BrandCampaignPayments } from "@/components/brand/BrandCampaignPayments";
import { BrandApplicationsManager } from "@/components/brand/BrandApplicationsManager";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type BrandCampaign = {
  id: string;
  brand_name: string;
  campaign_name: string;
  description: string | null;
  budget_min: number;
  budget_max: number;
  deadline: string;
  status: string;
  tags: string[] | null;
  created_at: string;
};

function CreateCampaignDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [tags, setTags] = useState<string>("");

  const reset = () => {
    setBrandName("");
    setCampaignName("");
    setDescription("");
    setBudgetMin("");
    setBudgetMax("");
    setDeadline("");
    setTags("");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not authenticated");

      const min = Number(budgetMin);
      const max = Number(budgetMax);

      if (!brandName.trim()) throw new Error("Enter brand name");
      if (!campaignName.trim()) throw new Error("Enter campaign name");
      if (!deadline) throw new Error("Enter deadline");
      if (!Number.isFinite(min) || min <= 0) throw new Error("Minimum budget must be a number > 0");
      if (!Number.isFinite(max) || max <= 0) throw new Error("Maximum budget must be a number > 0");
      if (max < min) throw new Error("Maximum budget must be greater than or equal to minimum");

      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error } = await supabase.from("brand_campaigns").insert({
        user_id: auth.user.id,
        brand_name: brandName.trim(),
        campaign_name: campaignName.trim(),
        description: description.trim() ? description.trim() : null,
        budget_min: min,
        budget_max: max,
        deadline,
        status: "active",
        tags: parsedTags.length ? parsedTags : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign was created");
      onCreated();
      reset();
      setOpen(false);
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to create campaign");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Brand Campaign</DialogTitle>
          <DialogDescription>
            Create a campaign and start collecting applications from creators.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Nike" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_name">Campaign Name</Label>
              <Input
                id="campaign_name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Winter Campaign" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should the creator produce? What outputs?" 
              rows={4}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Min Budget (€)</Label>
              <Input
                id="budget_min"
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="200"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Max Budget (€)</Label>
              <Input
                id="budget_max"
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="800"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="beauty, fashion, tiktok"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BrandDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Brand Dashboard | Kampane";
    const ensureMeta = () => {
      const name = "description";
      const content = "Brand dashboard for managing campaigns, applications and payments.";
      let tag = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);

      let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", window.location.href);
    };
    ensureMeta();
  }, []);

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["brand-campaigns"],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_campaigns")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as BrandCampaign[];
    },
  });

  const stats = useMemo(() => {
    const total = campaigns?.length ?? 0;
    const active = (campaigns ?? []).filter((c) => c.status === "active").length;
    return { total, active };
  }, [campaigns]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <FloatingHowItWorks title="Brand Campaigns" intro="Create paid campaigns, manage creator applications, and pay out winners." steps={[
        { title: "Create a campaign", desc: "Click New Campaign, set budget in EUR, dates, tags and required deliverables." },
        { title: "Review applications", desc: "Creators apply — accept, reject, or negotiate in the Applications tab." },
        { title: "Fund escrow", desc: "Payments are held in Stripe escrow until you approve the delivered work." },
        { title: "Release payouts", desc: "Approve completed work to release funds (80/20 or 85/15 split applies)." },
        { title: "Track performance", desc: "Use the Payments tab for a full history and downloadable receipts." }
      ]} />
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Create campaigns, track applications and manage payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateCampaignDialog onCreated={() => queryClient.invalidateQueries({ queryKey: ["brand-campaigns"] })} />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 mb-6" aria-label="Overview">
        <Card>
          <CardHeader>
            <CardTitle>Total Campaigns</CardTitle>
            <CardDescription>Number of campaigns you have created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
            <CardDescription>Campaigns visible to creators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </section>

      <main>
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="applications">Applications & Escrow</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <section aria-label="Campaign list" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="grid gap-4">
                  {campaigns.map((c) => (
                    <Card key={c.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="truncate">{c.campaign_name}</CardTitle>
                            <CardDescription className="mt-1 truncate">{c.brand_name}</CardDescription>
                          </div>
                          <Badge variant={c.status === "active" ? "default" : "secondary"}>
                            {c.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {c.description ? (
                          <p className="text-sm text-muted-foreground">{c.description}</p>
                        ) : null}

                        <div className="grid gap-2 sm:grid-cols-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Euro className="h-4 w-4 shrink-0" />
                            <span className="text-foreground font-medium">
                              €{c.budget_min.toLocaleString()} – €{c.budget_max.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span className="text-foreground font-medium">{new Date(c.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                              {(c.tags ?? []).slice(0, 3).join(", ") || "—"}
                            </span>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10">
                    <p className="text-muted-foreground">
                      You don't have any campaigns yet. Click on "Add campaign".
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <section aria-label="Applications and escrow">
              <BrandApplicationsManager />
            </section>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <section aria-label="Payments">
              <BrandCampaignPayments />
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
