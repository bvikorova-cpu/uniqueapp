import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, Eye, TrendingUp, Mail, FileText, ArrowLeft, Download, MessageSquare, CheckCircle2, AlertCircle, Sparkles, Crown, BarChart3, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { ResponseTemplatesManager } from "@/components/jobs/ResponseTemplatesManager";
import { useEmployerPaymentStatus } from "@/hooks/useEmployerPaymentStatus";
import { useEmployerVerification } from "@/hooks/useEmployerVerification";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployerSubscriptionTiers } from "@/components/employer/EmployerSubscriptionTiers";
import { JobPostingsStatus } from "@/components/employer/JobPostingsStatus";
import { motion } from "framer-motion";

interface JobWithStats {
  id: string;
  title: string;
  company_name: string;
  location: string;
  created_at: string;
  is_active: boolean;
  applications_count: number;
  views_count: number;
}

interface Application {
  id: string;
  created_at: string;
  status: string;
  cover_letter: string;
  resume_url: string | null;
  applicant_id: string;
  job_id: string;
  job_title: string;
}

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscribed, loading: paymentLoading } = useEmployerPaymentStatus();
  const { verificationStatus, isApproved, loading: verificationLoading } = useEmployerVerification();

  useEffect(() => {
    if (!paymentLoading && !verificationLoading) {
      loadDashboardData();
    }
  }, [paymentLoading, verificationLoading]);

  const loadDashboardData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { navigate("/"); return; }
      setUser(currentUser);

      if (!subscribed) { setLoading(false); return; }

      const { data: jobsData, error: jobsError } = await supabase
        .from('job_listings')
        .select('*')
        .eq('employer_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (jobsError) throw jobsError;

      const jobsWithStats = jobsData.map(job => ({
        id: job.id, title: job.title, company_name: job.company_name,
        location: job.location, created_at: job.created_at,
        is_active: job.is_active || false, applications_count: job.applications_count || 0,
        views_count: job.views_count || 0,
      }));
      setJobs(jobsWithStats);

      const jobIds = jobsWithStats.map(j => j.id);
      if (jobIds.length > 0) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('job_applications')
          .select(`*, job_listings!inner(title, employer_id)`)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });
        if (applicationsError) throw applicationsError;

        setApplications(applicationsData.map((app: any) => ({
          id: app.id, created_at: app.created_at, status: app.status || 'pending',
          cover_letter: app.cover_letter || '', resume_url: app.resume_url,
          applicant_id: app.applicant_id, job_id: app.job_id, job_title: app.job_listings.title,
        })));
      }

      const totalApplications = jobsWithStats.reduce((sum, job) => sum + job.applications_count, 0);
      const totalViews = jobsWithStats.reduce((sum, job) => sum + job.views_count, 0);
      const activeJobs = jobsWithStats.filter(job => job.is_active).length;
      setStats({ totalJobs: jobsWithStats.length, activeJobs, totalApplications, totalViews });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('job_applications').update({ status: newStatus }).eq('id', applicationId);
      if (error) throw error;
      toast({ title: "Success", description: "Application status updated." });
      loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredApplications = applications
    .filter(app => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (jobFilter !== "all" && app.job_id !== jobFilter) return false;
      if (searchQuery && !app.cover_letter.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  const exportToCSV = () => {
    const headers = ["Position", "Date Applied", "Status", "Cover Letter", "Resume"];
    const rows = filteredApplications.map(app => [
      app.job_title,
      format(new Date(app.created_at), 'dd.MM.yyyy HH:mm'),
      app.status === 'pending' ? 'Pending' : app.status === 'accepted' ? 'Accepted' : 'Rejected',
      `"${app.cover_letter.replace(/"/g, '""')}"`,
      app.resume_url || 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `applications_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: "Export Successful", description: `Exported ${filteredApplications.length} applications to CSV.` });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    doc.setFontSize(18);
    doc.text('Job Applications', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Exported: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total: ${filteredApplications.length}`, margin, yPosition);
    yPosition += 10;

    filteredApplications.forEach((app, index) => {
      if (yPosition > pageHeight - 40) { doc.addPage(); yPosition = margin; }
      doc.setFontSize(12);
      doc.setFont(undefined!, 'bold');
      doc.text(`${index + 1}. ${app.job_title}`, margin, yPosition);
      yPosition += 7;
      doc.setFontSize(10);
      doc.setFont(undefined!, 'normal');
      doc.text(`Date: ${format(new Date(app.created_at), 'dd.MM.yyyy HH:mm')}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Status: ${app.status}`, margin, yPosition);
      yPosition += 5;
      doc.text('Cover Letter:', margin, yPosition);
      yPosition += 5;
      const lines = doc.splitTextToSize(app.cover_letter, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) { doc.addPage(); yPosition = margin; }
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    });

    doc.save(`applications_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: "Export Successful", description: `Exported ${filteredApplications.length} applications to PDF.` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Positions", value: stats.totalJobs, sub: `${stats.activeJobs} active`, icon: <Briefcase className="h-5 w-5" />, gradient: "from-blue-500 to-indigo-500" },
    { label: "Applications", value: stats.totalApplications, sub: `${applications.filter(a => a.status === 'pending').length} pending`, icon: <Users className="h-5 w-5" />, gradient: "from-emerald-500 to-teal-500" },
    { label: "Total Views", value: stats.totalViews, sub: "All positions", icon: <Eye className="h-5 w-5" />, gradient: "from-purple-500 to-fuchsia-500" },
    { label: "Conversion Rate", value: `${stats.totalViews > 0 ? ((stats.totalApplications / stats.totalViews) * 100).toFixed(1) : 0}%`, sub: "Applications / Views", icon: <TrendingUp className="h-5 w-5" />, gradient: "from-orange-500 to-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 space-y-6 max-w-6xl">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border border-primary/20 p-6 sm:p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <motion.div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30" whileHover={{ rotate: -5, scale: 1.05 }}>
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Employer Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your job listings and applications</p>
              </div>
            </div>
            {user && isApproved && (
              <CreateJobDialog
                userId={user.id}
                subscribed={subscribed}
                onRenewSubscription={() => {
                  document.getElementById('subscription-tiers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Verification & Payment Alerts */}
        {!isApproved && (
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                {verificationStatus === null && "Your company has not been verified yet. Start the verification process to post jobs."}
                {verificationStatus === 'pending' && "Your verification is being reviewed. This usually takes 1-2 business days."}
                {verificationStatus === 'rejected' && "Your verification was rejected. Please resubmit with updated documents."}
                {verificationStatus === 'requires_resubmission' && "Additional documents required. Please resubmit your verification."}
              </span>
              <Button size="sm" onClick={() => navigate('/employer-verification')} variant={verificationStatus === null ? "default" : "outline"}>
                {verificationStatus === null ? "Start Verification" : "View Status"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isApproved && !subscribed && (
          <Alert className="border-emerald-500/30 bg-emerald-500/5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <AlertDescription>
              <span className="font-semibold text-emerald-600">Verified!</span>
              <span className="ml-2 text-sm">Choose a subscription plan below to start posting jobs.</span>
            </AlertDescription>
          </Alert>
        )}

        {isApproved && (
          <div id="subscription-tiers">
            <EmployerSubscriptionTiers />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-black">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> My Positions
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white gap-1.5">
              <Users className="h-3.5 w-3.5" /> Applications
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white gap-1.5">
              <Receipt className="h-3.5 w-3.5" /> Packages
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Your Job Positions
                </CardTitle>
                <CardDescription>Performance statistics for your listings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead>Position</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Applications</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Posted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id} className="border-border/20 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-semibold">{job.title}</TableCell>
                        <TableCell className="text-muted-foreground">{job.location}</TableCell>
                        <TableCell>
                          <Badge className={job.is_active
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                          }>
                            {job.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">{job.applications_count}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{job.views_count}</TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{format(new Date(job.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                    {jobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-muted-foreground">No job positions yet. Create your first listing!</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Received Applications
                    </CardTitle>
                    <CardDescription>Review and manage candidate applications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredApplications.length === 0} className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToPDF} disabled={filteredApplications.length === 0} className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <Label className="text-xs font-medium">Search</Label>
                    <Input placeholder="Search cover letters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mt-1 bg-muted/30 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Status</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-border/50 bg-muted/30 px-3 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Position</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-border/50 bg-muted/30 px-3 py-1 text-sm" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                      <option value="all">All Positions</option>
                      {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Sort</Label>
                    <select className="w-full mt-1 h-9 rounded-md border border-border/50 bg-muted/30 px-3 py-1 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>

                <div className="space-y-3">
                  {filteredApplications.map((application, i) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-border/30 bg-card/60 hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h4 className="font-bold text-sm">{application.job_title}</h4>
                              <p className="text-xs text-muted-foreground">
                                Applied {format(new Date(application.created_at), 'MMM d, yyyy · h:mm a')}
                              </p>
                            </div>
                            <Badge className={
                              application.status === 'pending' ? "bg-amber-500/15 text-amber-600 border-amber-500/20" :
                              application.status === 'accepted' ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" :
                              "bg-destructive/15 text-destructive border-destructive/20"
                            }>
                              {application.status === 'pending' ? 'Pending' : application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                            </Badge>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                              <Mail className="h-3 w-3" /> Cover Letter
                            </div>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-4">{application.cover_letter}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {application.resume_url && (
                              <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={() => window.open(application.resume_url!, '_blank')}>
                                <FileText className="h-3 w-3" /> View Resume
                              </Button>
                            )}
                            {application.status === 'pending' && (
                              <>
                                <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => updateApplicationStatus(application.id, 'accepted')}>
                                  <CheckCircle2 className="h-3 w-3" /> Accept
                                </Button>
                                <Button size="sm" variant="destructive" className="text-xs h-8 gap-1" onClick={() => updateApplicationStatus(application.id, 'rejected')}>
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {filteredApplications.length === 0 && applications.length > 0 && (
                    <div className="text-center py-12">
                      <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No applications match the selected filters</p>
                    </div>
                  )}
                  {applications.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No applications received yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4">
            <JobPostingsStatus />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <ResponseTemplatesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
