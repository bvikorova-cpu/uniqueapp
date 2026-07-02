import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, User, Calendar } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function AdminCampaignApplications() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-campaign-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_applications")
        .select(`
          *,
          brand_campaigns (
            id,
            campaign_name,
            brand_name,
            budget_min,
            budget_max
          )
        `)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ applicationId, action }: { applicationId: string; action: "approve" | "reject" }) => {
      const { data, error } = await supabase.functions.invoke("approve-campaign-application", {
        body: {
          applicationId,
          action,
          rejectionReason: action === "reject" ? rejectionReason : null,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaign-applications"] });
      toast.success(
        variables.action === "approve"
          ? "Application approved successfully"
          : "Application rejected"
      );
      setSelectedApp(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process application");
    },
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
    };
    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;
    return (
    <>
      <FloatingHowItWorks title={"Admin Campaign Applications - How it works"} steps={[{ title: 'Open', desc: 'Access the Admin Campaign Applications section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Admin Campaign Applications.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    </>
  );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingApps = applications?.filter((app) => app.status === "pending") || [];
  const reviewedApps = applications?.filter((app) => app.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Campaign Applications</h2>
        <p className="text-muted-foreground">Review and approve influencer applications for brand campaigns</p>
      </div>

      {pendingApps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Applications ({pendingApps.length})</h3>
          <div className="grid gap-4">
            {pendingApps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Application #{app.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Campaign: {app.brand_campaigns?.campaign_name || "Unknown Campaign"}
                      </CardDescription>
                      <CardDescription className="text-xs mt-1">
                        Brand: {app.brand_campaigns?.brand_name || "Unknown"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {app.message && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Application Message:</p>
                      <p className="text-sm text-muted-foreground">{app.message}</p>
                    </div>
                  )}

                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">Budget Range:</p>
                    <p className="text-lg font-bold">
                      €{app.brand_campaigns?.budget_min?.toLocaleString()} - €
                      {app.brand_campaigns?.budget_max?.toLocaleString()}
                    </p>
                  </div>

                  {selectedApp === app.id && (
                    <div className="space-y-3 pt-3 border-t">
                      <Textarea
                        placeholder="Rejection reason (optional)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {selectedApp !== app.id ? (
                      <>
                        <Button
                          onClick={() => setSelectedApp(app.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          Review
                        </Button>
                        <Button
                          onClick={() => approveMutation.mutate({ applicationId: app.id, action: "approve" })}
                          disabled={approveMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Quick Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedApp(null);
                            setRejectionReason("");
                          }}
                          disabled={approveMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => approveMutation.mutate({ applicationId: app.id, action: "reject" })}
                          disabled={approveMutation.isPending}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => approveMutation.mutate({ applicationId: app.id, action: "approve" })}
                          disabled={approveMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reviewedApps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Reviewed Applications ({reviewedApps.length})</h3>
          <div className="grid gap-4">
            {reviewedApps.map((app) => (
              <Card key={app.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Application #{app.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Campaign: {app.brand_campaigns?.campaign_name || "Unknown Campaign"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Reviewed on {app.approved_at ? new Date(app.approved_at).toLocaleDateString() : "N/A"}
                  </div>
                  {app.rejection_reason && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                      <span className="font-medium">Reason: </span>
                      {app.rejection_reason}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!applications || applications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No applications yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}