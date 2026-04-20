import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Euro, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv } from "@/lib/exportCsv";

interface PlatformEarning {
  id: string;
  gift_id: string;
  total_amount: number;
  chef_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  admin_notes: string | null;
  chef_id: string;
  chef_name: string;
  chef_email: string;
}

export default function AdminMasterChefPayouts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<PlatformEarning[]>([]);
  const [selectedEarning, setSelectedEarning] = useState<PlatformEarning | null>(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access admin panel",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      await loadEarnings();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('masterchef_platform_earnings')
        .select(`
          *,
          masterchef_sent_gifts!inner (
            chef_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique chef IDs
      const chefIds = [...new Set((data || []).map(e => e.masterchef_sent_gifts.chef_id))];
      
      // Fetch chef profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', chefIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedEarnings: PlatformEarning[] = (data || []).map(earning => ({
        id: earning.id,
        gift_id: earning.gift_id,
        total_amount: earning.total_amount,
        chef_amount: earning.chef_amount,
        commission_amount: earning.commission_amount,
        commission_rate: earning.commission_rate,
        status: earning.status,
        created_at: earning.created_at,
        paid_at: earning.paid_at,
        admin_notes: earning.admin_notes,
        chef_id: earning.masterchef_sent_gifts.chef_id,
        chef_name: profilesMap.get(earning.masterchef_sent_gifts.chef_id)?.full_name || 'Unknown Chef',
        chef_email: profilesMap.get(earning.masterchef_sent_gifts.chef_id)?.email || 'N/A'
      }));

      setEarnings(formattedEarnings);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive",
      });
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedEarning) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('masterchef_platform_earnings')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', selectedEarning.id);

      if (error) throw error;

      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('type', 'masterchef_payout')
        .eq('related_id', selectedEarning.id);

      toast({
        title: "Payout Processed",
        description: `€${selectedEarning.chef_amount.toFixed(2)} marked as paid to ${selectedEarning.chef_name}`,
      });

      setIsPayoutDialogOpen(false);
      setSelectedEarning(null);
      setAdminNotes("");
      await loadEarnings();
    } catch (error) {
      console.error('Error processing payout:', error);
      toast({
        title: "Error",
        description: "Failed to process payout",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openPayoutDialog = (earning: PlatformEarning) => {
    setSelectedEarning(earning);
    setAdminNotes(earning.admin_notes || "");
    setIsPayoutDialogOpen(true);
  };

  const pendingEarnings = earnings.filter(e => e.status === 'pending');
  const paidEarnings = earnings.filter(e => e.status === 'paid');
  const totalPending = pendingEarnings.reduce((sum, e) => sum + e.chef_amount, 0);
  const totalCommissions = earnings.reduce((sum, e) => sum + e.commission_amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="MasterChef Payouts"
          subtitle="Manage chef gift commissions and process secure payouts."
          icon={ChefHat}
          badge="MasterChef"
          breadcrumbs={[{ label: "MasterChef Payouts" }]}
          stats={[
            { label: "Pending €", value: `€${totalPending.toFixed(0)}`, accent: "amber" },
            { label: "Pending #", value: pendingEarnings.length, accent: "purple" },
            { label: "Paid #", value: paidEarnings.length, accent: "emerald" },
            { label: "Comm. €", value: `€${totalCommissions.toFixed(0)}`, accent: "cyan" },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                exportToCsv("masterchef-payouts", earnings, [
                  { key: "chef_name", label: "Chef" },
                  { key: "chef_email", label: "Email" },
                  { key: "total_amount", label: "Total €" },
                  { key: "chef_amount", label: "Chef €" },
                  { key: "commission_amount", label: "Commission €" },
                  { key: "status", label: "Status" },
                  { key: "created_at", label: "Date" },
                  { key: "paid_at", label: "Paid" },
                ])
              }
              className="bg-white/15 backdrop-blur-xl border border-white/30 text-white hover:bg-white/25"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalPending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {pendingEarnings.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <Euro className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Platform earnings (20%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{paidEarnings.reduce((sum, e) => sum + e.chef_amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {paidEarnings.length} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payouts Table */}
        {pendingEarnings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Chef</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Chef Amount (80%)</TableHead>
                    <TableHead>Platform Fee (20%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEarnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell>
                        {new Date(earning.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{earning.chef_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {earning.chef_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>€{earning.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        €{earning.chef_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        €{earning.commission_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openPayoutDialog(earning)}
                        >
                          Process Payout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Paid Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Completed Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paidEarnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No completed payouts yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Paid</TableHead>
                    <TableHead>Chef</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidEarnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell>
                        {earning.paid_at
                          ? new Date(earning.paid_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{earning.chef_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {earning.chef_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        €{earning.chef_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        €{earning.commission_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {earning.admin_notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payout Dialog */}
        <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payout</DialogTitle>
            </DialogHeader>
            {selectedEarning && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Chef</Label>
                      <p className="font-medium">{selectedEarning.chef_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedEarning.chef_email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Amount to Pay</Label>
                      <p className="text-2xl font-bold text-green-600">
                        €{selectedEarning.chef_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Admin Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this payout (e.g., transaction ID, payment method)..."
                    rows={4}
                  />
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>Important:</strong> Make sure you have manually transferred €
                    {selectedEarning.chef_amount.toFixed(2)} to {selectedEarning.chef_name} before
                    marking this as paid.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPayoutDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessPayout}
                disabled={processing}
              >
                {processing ? "Processing..." : "Mark as Paid"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminPageShell>
    </AdminGuard>
  );
}
