import { useState } from "react";
import { 
  Shield, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  useContentReports, 
  useUpdateReportStatus, 
  useShadowbanUser,
  useWarnUser,
  useTakeModeratorAction 
} from "@/hooks/useModeration";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ModerationStatus = Database["public"]["Enums"]["moderation_status"];

const ModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState<ModerationStatus | "all">("pending");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "approve" | "delete" | "warn" | "shadowban" | null;
    reportId?: string;
    userId?: string;
  }>({ open: false, type: null });
  const [actionNotes, setActionNotes] = useState("");

  const { data: reports, isLoading } = useContentReports(
    activeTab === "all" ? undefined : activeTab as ModerationStatus
  );
  const updateStatus = useUpdateReportStatus();
  const shadowban = useShadowbanUser();
  const warn = useWarnUser();
  const takeAction = useTakeModeratorAction();

  const getStatusBadge = (status: ModerationStatus | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "destructive", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "secondary", label: "Rejected" },
      deleted: { variant: "outline", label: "Deleted" },
      hidden: { variant: "outline", label: "Hidden" },
    };
    const config = variants[status || "pending"] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getViolationLabel = (violation: string) => {
    const labels: Record<string, string> = {
      spam: "Spam",
      harassment: "Harassment",
      hate_speech: "Hate Speech",
      violence: "Violence",
      adult_content: "Adult Content",
      misinformation: "Misinformation",
      scam: "Scam",
      copyright: "Copyright",
      impersonation: "Impersonation",
      other: "Other",
    };
    return labels[violation] || violation;
  };

  const handleAction = async () => {
    if (!actionDialog.type) return;

    try {
      switch (actionDialog.type) {
        case "approve":
          await updateStatus.mutateAsync({
            reportId: actionDialog.reportId!,
            status: "approved",
            resolutionNotes: actionNotes,
          });
          break;
        case "delete":
          await updateStatus.mutateAsync({
            reportId: actionDialog.reportId!,
            status: "deleted",
            resolutionNotes: actionNotes,
          });
          if (actionDialog.userId) {
            await takeAction.mutateAsync({
              userId: actionDialog.userId,
              actionType: "content_removed",
              reason: actionNotes,
              relatedReportId: actionDialog.reportId,
            });
          }
          break;
        case "warn":
          if (actionDialog.userId) {
            await warn.mutateAsync({
              userId: actionDialog.userId,
              reason: actionNotes,
              relatedContentId: selectedReport?.content_id,
            });
            await takeAction.mutateAsync({
              userId: actionDialog.userId,
              actionType: "warning",
              reason: actionNotes,
              relatedReportId: actionDialog.reportId,
            });
          }
          await updateStatus.mutateAsync({
            reportId: actionDialog.reportId!,
            status: "approved",
            resolutionNotes: `Warning issued: ${actionNotes}`,
          });
          break;
        case "shadowban":
          if (actionDialog.userId) {
            await shadowban.mutateAsync({
              userId: actionDialog.userId,
              reason: actionNotes,
            });
            await takeAction.mutateAsync({
              userId: actionDialog.userId,
              actionType: "shadowban",
              reason: actionNotes,
              relatedReportId: actionDialog.reportId,
            });
          }
          await updateStatus.mutateAsync({
            reportId: actionDialog.reportId!,
            status: "approved",
            resolutionNotes: `User shadowbanned: ${actionNotes}`,
          });
          break;
      }
    } finally {
      setActionDialog({ open: false, type: null });
      setActionNotes("");
      setSelectedReport(null);
    }
  };

  const pendingCount = reports?.filter(r => r.status === "pending").length || 0;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Moderation Dashboard"
        subtitle="Review reports, take moderator actions and keep the community safe."
        icon={Shield}
        badge={pendingCount > 0 ? `${pendingCount} Pending` : "All Clear"}
        breadcrumbs={[{ label: "Moderation" }]}
        stats={[
          { label: "Pending", value: reports?.filter((r) => r.status === "pending").length || 0, accent: "amber" },
          { label: "Reviewed", value: reports?.filter((r) => r.status === "reviewed").length || 0, accent: "cyan" },
          { label: "Resolved", value: reports?.filter((r) => r.status === "resolved").length || 0, accent: "emerald" },
          { label: "Total", value: reports?.length || 0, accent: "purple" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {reports?.filter(r => r.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {reports?.filter(r => 
                r.resolved_at && 
                new Date(r.resolved_at).toDateString() === new Date().toDateString()
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports?.filter(r => r.status === "approved").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {reports?.filter(r => r.status === "deleted").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Reports</CardTitle>
          <CardDescription>
            Review reports submitted by the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ModerationStatus | "all")}>
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingCount > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="deleted">Deleted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !reports?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reported</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Violation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">
                          {report.created_at && formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.content_type}</Badge>
                        </TableCell>
                        <TableCell>{getViolationLabel(report.violation_type)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedReport(report)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {report.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600"
                                  onClick={() => setActionDialog({
                                    open: true,
                                    type: "approve",
                                    reportId: report.id,
                                    userId: report.reported_user_id,
                                  })}
                                  title="Approve (dismiss report)"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => setActionDialog({
                                    open: true,
                                    type: "delete",
                                    reportId: report.id,
                                    userId: report.reported_user_id,
                                  })}
                                  title="Delete content"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the full report and take action
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Content Type:</span>
                  <p className="font-medium">{selectedReport.content_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Violation:</span>
                  <p className="font-medium">{getViolationLabel(selectedReport.violation_type)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reported:</span>
                  <p className="font-medium">
                    {selectedReport.created_at && formatDistanceToNow(new Date(selectedReport.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>{getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>
              
              {selectedReport.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Description:</span>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionDialog({
                        open: true,
                        type: "warn",
                        reportId: selectedReport.id,
                        userId: selectedReport.reported_user_id,
                      });
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Warn User
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setActionDialog({
                        open: true,
                        type: "shadowban",
                        reportId: selectedReport.id,
                        userId: selectedReport.reported_user_id,
                      });
                    }}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Shadowban
                  </Button>
                  <Button
                    variant="default"
                    className="ml-auto"
                    onClick={() => {
                      setActionDialog({
                        open: true,
                        type: "approve",
                        reportId: selectedReport.id,
                        userId: selectedReport.reported_user_id,
                      });
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Dismiss Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "approve" && "Dismiss Report"}
              {actionDialog.type === "delete" && "Delete Content"}
              {actionDialog.type === "warn" && "Warn User"}
              {actionDialog.type === "shadowban" && "Shadowban User"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "shadowban" 
                ? "The user's content will be hidden from others but they won't know."
                : "Add notes about your decision."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="notes">Notes / Reason</Label>
            <Textarea
              id="notes"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                actionDialog.type === "warn" 
                  ? "Warning message to the user..."
                  : "Your notes..."
              }
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              variant={actionDialog.type === "shadowban" || actionDialog.type === "delete" ? "destructive" : "default"}
              disabled={updateStatus.isPending || shadowban.isPending || warn.isPending || takeAction.isPending}
            >
              {(updateStatus.isPending || shadowban.isPending || warn.isPending || takeAction.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
};

export default ModerationDashboard;
