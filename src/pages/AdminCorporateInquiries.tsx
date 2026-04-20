import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Phone, Calendar, Users, MessageSquare, Eye, CheckCircle, XCircle, Briefcase, Download } from "lucide-react";
import { format } from "date-fns";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { exportToCsv } from "@/lib/exportCsv";

interface CorporateInquiry {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  package_type: string;
  event_type: string | null;
  expected_attendees: number | null;
  event_date: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  pending: "bg-yellow-500",
  contacted: "bg-blue-500",
  in_progress: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels = {
  pending: "Pending",
  contacted: "Contacted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function AdminCorporateInquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<CorporateInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<CorporateInquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchInquiries();
  }, [filterStatus]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("corporate_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("corporate_inquiries")
        .update({ status: newStatus })
        .eq("id", inquiryId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Inquiry status has been updated successfully",
      });

      fetchInquiries();
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getPackageLabel = (packageType: string) => {
    const labels: { [key: string]: string } = {
      startup: "Startup (€15)",
      business: "Business (€30)",
      corporate_premium: "Corporate Premium (€60)",
      mini_restaurant: "Mini Restaurant (€5/mo)",
      standard_restaurant: "Standard Restaurant (€12/mo)",
      chain_restaurant: "Chain Restaurant (€25/loc)",
      wedding_basic: "Wedding Basic (€20)",
      wedding_premium: "Wedding Premium (€40)",
      wedding_luxury: "Wedding Luxury (€80)",
      wedding_vip: "Wedding VIP (€150+)",
      event_organizer: "Event Organizer",
      custom: "Custom Solution",
    };
    return labels[packageType] || packageType;
  };

  const statusCount = (s: string) => inquiries.filter((i) => i.status === s).length;

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Corporate Inquiries"
          subtitle="Manage corporate event leads, restaurant onboarding and wedding packages."
          icon={Briefcase}
          badge="Sales"
          breadcrumbs={[{ label: "Corporate Inquiries" }]}
          stats={[
            { label: "Pending", value: statusCount("pending"), accent: "amber" },
            { label: "In Progress", value: statusCount("in_progress"), accent: "purple" },
            { label: "Completed", value: statusCount("completed"), accent: "emerald" },
            { label: "Total", value: inquiries.length, accent: "cyan" },
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                exportToCsv("corporate-inquiries", inquiries, [
                  { key: "company_name", label: "Company" },
                  { key: "contact_name", label: "Contact" },
                  { key: "email", label: "Email" },
                  { key: "phone", label: "Phone" },
                  { key: "package_type", label: "Package" },
                  { key: "event_type", label: "Event" },
                  { key: "expected_attendees", label: "Attendees" },
                  { key: "event_date", label: "Date" },
                  { key: "status", label: "Status" },
                  { key: "created_at", label: "Submitted" },
                ])
              }
              className="bg-white/15 backdrop-blur-xl border border-white/30 text-white hover:bg-white/25"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          }
        />

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="secondary">
                {inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inquiries List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading inquiries...</p>
                </CardContent>
              </Card>
            ) : inquiries.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No inquiries found</p>
                </CardContent>
              </Card>
            ) : (
              inquiries.map((inquiry) => (
                <Card
                  key={inquiry.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInquiry?.id === inquiry.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {inquiry.company_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {inquiry.contact_name} • {getPackageLabel(inquiry.package_type)}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[inquiry.status as keyof typeof statusColors]}>
                        {statusLabels[inquiry.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {inquiry.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Inquiry Details */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedInquiry ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Inquiry Details
                      </CardTitle>
                      <CardDescription>
                        Submitted on {format(new Date(selectedInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[selectedInquiry.status as keyof typeof statusColors]}>
                      {statusLabels[selectedInquiry.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Info */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Company:</span>
                        <p className="font-medium">{selectedInquiry.company_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact Person:</span>
                        <p className="font-medium">{selectedInquiry.contact_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">
                          <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                            {selectedInquiry.email}
                          </a>
                        </p>
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="font-medium">
                            <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                              {selectedInquiry.phone}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Package:</span>
                        <p className="font-medium">{getPackageLabel(selectedInquiry.package_type)}</p>
                      </div>
                      {selectedInquiry.event_type && (
                        <div>
                          <span className="text-muted-foreground">Event Type:</span>
                          <p className="font-medium">{selectedInquiry.event_type}</p>
                        </div>
                      )}
                      {selectedInquiry.expected_attendees && (
                        <div>
                          <span className="text-muted-foreground">Expected Attendees:</span>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedInquiry.expected_attendees}
                          </p>
                        </div>
                      )}
                      {selectedInquiry.event_date && (
                        <div>
                          <span className="text-muted-foreground">Event Date:</span>
                          <p className="font-medium">{format(new Date(selectedInquiry.event_date), "MMMM d, yyyy")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </h3>
                    <p className="text-sm bg-secondary/50 p-4 rounded-lg whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </p>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h3 className="font-semibold mb-3">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === "pending" ? "default" : "outline"}
                        onClick={() => updateInquiryStatus(selectedInquiry.id, "pending")}
                      >
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === "contacted" ? "default" : "outline"}
                        onClick={() => updateInquiryStatus(selectedInquiry.id, "contacted")}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Contacted
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === "in_progress" ? "default" : "outline"}
                        onClick={() => updateInquiryStatus(selectedInquiry.id, "in_progress")}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === "completed" ? "default" : "outline"}
                        onClick={() => updateInquiryStatus(selectedInquiry.id, "completed")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === "cancelled" ? "destructive" : "outline"}
                        onClick={() => updateInquiryStatus(selectedInquiry.id, "cancelled")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an inquiry to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AdminPageShell>
    </AdminGuard>
  );
}
