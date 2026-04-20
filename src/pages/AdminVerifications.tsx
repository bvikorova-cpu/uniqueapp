import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, FileText, ExternalLink, AlertCircle, Building2, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv } from "@/lib/exportCsv";

interface Verification {
  id: string;
  employer_id: string;
  company_name: string;
  company_registration_number: string | null;
  company_address: string;
  company_website: string | null;
  company_phone: string;
  verification_status: string;
  rejection_reason: string | null;
  admin_notes: string | null;
  submitted_at: string;
  employer_verification_documents: Array<{
    id: string;
    document_type: string;
    document_name: string;
    document_url: string;
  }>;
}

const DOCUMENT_TYPES = {
  business_license: "Business License",
  tax_certificate: "Tax Certificate",
  company_registration: "Company Registration",
  proof_of_address: "Proof of Address",
  other: "Other Document",
};

export default function AdminVerifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'resubmit'>('approve');
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch verifications
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employer_verifications')
        .select('*, employer_verification_documents(*)')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as Verification[];
    },
  });

  // Review verification mutation
  const reviewVerification = useMutation({
    mutationFn: async () => {
      if (!selectedVerification) return;

      const updateData: any = {
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      };

      if (reviewAction === 'approve') {
        updateData.verification_status = 'approved';
        updateData.rejection_reason = null;
      } else if (reviewAction === 'reject') {
        if (!rejectionReason) throw new Error("Rejection reason is required");
        updateData.verification_status = 'rejected';
        updateData.rejection_reason = rejectionReason;
      } else {
        if (!rejectionReason) throw new Error("Resubmission reason is required");
        updateData.verification_status = 'requires_resubmission';
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('employer_verifications')
        .update(updateData)
        .eq('id', selectedVerification.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast({
        title: "Review Completed",
        description: `Verification ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'marked for resubmission'}`,
      });
      setReviewDialogOpen(false);
      setSelectedVerification(null);
      setRejectionReason("");
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openReviewDialog = (verification: Verification, action: 'approve' | 'reject' | 'resubmit') => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setAdminNotes(verification.admin_notes || "");
    setRejectionReason(verification.rejection_reason || "");
    setReviewDialogOpen(true);
  };

  const filteredVerifications = (status: string) => {
    if (!verifications) return [];
    if (status === 'all') return verifications;
    return verifications.filter(v => v.verification_status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Employer Verifications"
          subtitle="Review business documents and approve company accounts on the platform."
          icon={Building2}
          badge="Compliance"
          breadcrumbs={[{ label: "Verifications" }]}
          stats={[
            { label: "Pending", value: filteredVerifications("pending").length, accent: "amber" },
            { label: "Approved", value: filteredVerifications("approved").length, accent: "emerald" },
            { label: "Rejected", value: filteredVerifications("rejected").length, accent: "pink" },
            { label: "Resubmit", value: filteredVerifications("requires_resubmission").length, accent: "purple" },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                exportToCsv("verifications", verifications || [], [
                  { key: "company_name", label: "Company" },
                  { key: "company_phone", label: "Phone" },
                  { key: "company_address", label: "Address" },
                  { key: "verification_status", label: "Status" },
                  { key: "submitted_at", label: "Submitted" },
                ])
              }
              className="bg-white/15 backdrop-blur-xl border border-white/30 text-white hover:bg-white/25"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          }
        />

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({filteredVerifications('pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({filteredVerifications('approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({filteredVerifications('rejected').length})
            </TabsTrigger>
            <TabsTrigger value="requires_resubmission">
              Resubmission ({filteredVerifications('requires_resubmission').length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({verifications?.length || 0})
            </TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected', 'requires_resubmission', 'all'].map(status => (
            <TabsContent key={status} value={status}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {status === 'all' ? 'All Verifications' : 
                     status === 'requires_resubmission' ? 'Requires Resubmission' :
                     status.charAt(0).toUpperCase() + status.slice(1) + ' Verifications'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVerifications(status).map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{verification.company_name}</p>
                              <p className="text-sm text-muted-foreground">{verification.company_address}</p>
                              {verification.company_website && (
                                <a href={verification.company_website} target="_blank" rel="noopener noreferrer" 
                                   className="text-xs text-primary hover:underline flex items-center gap-1">
                                  Website <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{verification.company_phone}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {verification.employer_verification_documents.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs flex items-center gap-1 hover:underline"
                                >
                                  <FileText className="h-3 w-3" />
                                  {DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES]}
                                </a>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(verification.submitted_at), 'dd.MM.yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              verification.verification_status === 'approved' ? 'default' :
                              verification.verification_status === 'rejected' ? 'destructive' :
                              verification.verification_status === 'requires_resubmission' ? 'secondary' :
                              'outline'
                            }>
                              {verification.verification_status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {verification.verification_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {verification.verification_status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                              {verification.verification_status === 'requires_resubmission' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {verification.verification_status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {verification.verification_status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => openReviewDialog(verification, 'approve')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openReviewDialog(verification, 'reject')}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openReviewDialog(verification, 'resubmit')}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Resubmit
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredVerifications(status).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No verifications found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve Verification' :
                 reviewAction === 'reject' ? 'Reject Verification' :
                 'Request Resubmission'}
              </DialogTitle>
              <DialogDescription>
                {selectedVerification?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {(reviewAction === 'reject' || reviewAction === 'resubmit') && (
                <div>
                  <Label htmlFor="rejection_reason">
                    {reviewAction === 'reject' ? 'Rejection' : 'Resubmission'} Reason *
                  </Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the verification is being rejected or what needs to be resubmitted..."
                    rows={4}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="admin_notes">Admin Notes (optional)</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => reviewVerification.mutate()}
                  disabled={reviewVerification.isPending || ((reviewAction === 'reject' || reviewAction === 'resubmit') && !rejectionReason)}
                  className="flex-1"
                  variant={reviewAction === 'reject' ? 'destructive' : 'default'}
                >
                  {reviewVerification.isPending ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AdminPageShell>
    </AdminGuard>
  );
}
