import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, Eye, TrendingUp, Mail, FileText, ArrowLeft, Download, MessageSquare, CreditCard } from "lucide-react";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { hasPaid, loading: paymentLoading } = useEmployerPaymentStatus();

  useEffect(() => {
    if (!paymentLoading) {
      loadDashboardData();
    }
  }, [paymentLoading]);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // Check payment status before loading data
      if (!hasPaid) {
        setLoading(false);
        return;
      }

      // Load jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_listings')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      const jobsWithStats = jobsData.map(job => ({
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        created_at: job.created_at,
        is_active: job.is_active || false,
        applications_count: job.applications_count || 0,
        views_count: job.views_count || 0,
      }));

      setJobs(jobsWithStats);

      // Load applications for user's jobs
      const jobIds = jobsWithStats.map(j => j.id);
      if (jobIds.length > 0) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('job_applications')
          .select(`
            *,
            job_listings!inner(title, employer_id)
          `)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (applicationsError) throw applicationsError;

        const formattedApplications = applicationsData.map((app: any) => ({
          id: app.id,
          created_at: app.created_at,
          status: app.status || 'pending',
          cover_letter: app.cover_letter || '',
          resume_url: app.resume_url,
          applicant_id: app.applicant_id,
          job_id: app.job_id,
          job_title: app.job_listings.title,
        }));

        setApplications(formattedApplications);
      }

      // Calculate stats
      const totalApplications = jobsWithStats.reduce((sum, job) => sum + job.applications_count, 0);
      const totalViews = jobsWithStats.reduce((sum, job) => sum + job.views_count, 0);
      const activeJobs = jobsWithStats.filter(job => job.is_active).length;

      setStats({
        totalJobs: jobsWithStats.length,
        activeJobs,
        totalApplications,
        totalViews,
      });
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa načítať údaje.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Úspech",
        description: "Stav žiadosti bol aktualizovaný.",
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa aktualizovať stav.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      // Filter by status
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      
      // Filter by job
      if (jobFilter !== "all" && app.job_id !== jobFilter) return false;
      
      // Search in cover letter
      if (searchQuery && !app.cover_letter.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      if (sortBy === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  const exportToCSV = () => {
    const headers = ["Position", "Date Applied", "Status", "Cover Letter", "Resume"];
    const rows = filteredApplications.map(app => [
      app.job_title,
      format(new Date(app.created_at), 'dd.MM.yyyy HH:mm'),
      app.status === 'pending' ? 'Pending' :
       app.status === 'accepted' ? 'Accepted' :
       app.status === 'rejected' ? 'Rejected' : app.status,
      `"${app.cover_letter.replace(/"/g, '""')}"`,
      app.resume_url || 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `applications_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: t('jobs.dashboard.exportSuccess', 'Export Successful'),
      description: `Exported ${filteredApplications.length} applications to CSV.`,
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Title
    doc.setFontSize(18);
    doc.text('Job Applications', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Exported: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Number of applications: ${filteredApplications.length}`, margin, yPosition);
    yPosition += 10;

    // Applications
    filteredApplications.forEach((app, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${app.job_title}`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Date: ${format(new Date(app.created_at), 'dd.MM.yyyy HH:mm')}`, margin, yPosition);
      yPosition += 5;

      const statusText = app.status === 'pending' ? 'Pending' :
                         app.status === 'accepted' ? 'Accepted' :
                         app.status === 'rejected' ? 'Rejected' : app.status;
      doc.text(`Status: ${statusText}`, margin, yPosition);
      yPosition += 5;

      doc.text('Cover Letter:', margin, yPosition);
      yPosition += 5;

      // Wrap text for cover letter
      const coverLetterLines = doc.splitTextToSize(
        app.cover_letter,
        pageWidth - 2 * margin
      );
      
      coverLetterLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });

      if (app.resume_url) {
        yPosition += 2;
        doc.text(`Resume: ${app.resume_url}`, margin, yPosition);
        yPosition += 5;
      }

      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    });

    doc.save(`applications_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    toast({
      title: t('jobs.dashboard.exportSuccess', 'Export Successful'),
      description: `Exported ${filteredApplications.length} applications to PDF.`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('jobs.dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('jobs.dashboard.overview')}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('jobs.dashboard.totalJobs')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} {t('jobs.dashboard.activeJobs', 'active')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('jobs.dashboard.totalApplications')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {applications.filter(a => a.status === 'pending').length} {t('jobs.dashboard.pending', 'pending')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('jobs.dashboard.totalViews')}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                {t('jobs.dashboard.allJobs', 'All positions combined')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('jobs.dashboard.avgConversion', 'Avg. conversion')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalViews > 0 
                  ? ((stats.totalApplications / stats.totalViews) * 100).toFixed(1) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t('jobs.dashboard.applicationsViews', 'Applications/Views')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">{t('jobs.dashboard.myJobs', 'My Positions')}</TabsTrigger>
            <TabsTrigger value="applications">{t('jobs.dashboard.applications')}</TabsTrigger>
            <TabsTrigger value="templates">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('jobs.dashboard.templates')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('jobs.dashboard.yourJobPositions', 'Your Job Positions')}</CardTitle>
                <CardDescription>
                  {t('jobs.dashboard.jobStats', 'Statistics of your listings')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('jobs.dashboard.jobTitle')}</TableHead>
                      <TableHead>{t('jobs.dashboard.location')}</TableHead>
                      <TableHead>{t('jobs.dashboard.status')}</TableHead>
                      <TableHead className="text-right">{t('jobs.dashboard.applications')}</TableHead>
                      <TableHead className="text-right">{t('jobs.dashboard.views')}</TableHead>
                      <TableHead className="text-right">{t('jobs.dashboard.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>
                          <Badge variant={job.is_active ? 'default' : 'secondary'}>
                            {job.is_active ? t('jobs.dashboard.active') : t('jobs.dashboard.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{job.applications_count}</TableCell>
                        <TableCell className="text-right">{job.views_count}</TableCell>
                        <TableCell className="text-right">
                          {format(new Date(job.created_at), 'dd.MM.yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {t('jobs.dashboard.noJobs')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('jobs.dashboard.receivedApplications', 'Received Applications')}</CardTitle>
                    <CardDescription>
                      {t('jobs.dashboard.manageApplications', 'Manage job applications')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      disabled={filteredApplications.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('jobs.dashboard.exportCSV')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToPDF}
                      disabled={filteredApplications.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('jobs.dashboard.exportPDF')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {/* Filters and Search */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{t('jobs.dashboard.search')}</Label>
                      <Input
                        placeholder={t('jobs.dashboard.searchPlaceholder', 'Search...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t('jobs.dashboard.filterByStatus')}</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">{t('jobs.dashboard.allStatuses')}</option>
                        <option value="pending">{t('jobs.dashboard.pending')}</option>
                        <option value="accepted">{t('jobs.dashboard.accepted')}</option>
                        <option value="rejected">{t('jobs.dashboard.rejected')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('jobs.dashboard.filterByJob')}</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                      >
                        <option value="all">{t('jobs.dashboard.allJobs')}</option>
                        {jobs.map(job => (
                          <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('jobs.dashboard.sortBy')}</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="newest">{t('jobs.dashboard.newest')}</option>
                        <option value="oldest">{t('jobs.dashboard.oldest')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Results summary */}
                  <div className="text-sm text-muted-foreground">
                    {t('jobs.dashboard.showingResults', `Showing ${filteredApplications.length} of ${applications.length} applications`)}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{application.job_title}</CardTitle>
                            <CardDescription>
                              {t('jobs.dashboard.appliedDate', 'Applied')} {format(new Date(application.created_at), 'dd.MM.yyyy HH:mm')}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            application.status === 'pending' ? 'secondary' :
                            application.status === 'accepted' ? 'default' :
                            application.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {application.status === 'pending' ? t('jobs.dashboard.pending') :
                             application.status === 'accepted' ? t('jobs.dashboard.accepted') :
                             application.status === 'rejected' ? t('jobs.dashboard.rejected') : application.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {t('jobs.dashboard.coverLetter')}
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {application.cover_letter}
                          </p>
                        </div>
                        
                        {application.resume_url && (
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(application.resume_url!, '_blank')}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {t('jobs.dashboard.viewResume')}
                            </Button>
                          </div>
                        )}

                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'accepted')}
                            >
                              {t('jobs.dashboard.accept', 'Accept')}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            >
                              {t('jobs.dashboard.reject', 'Reject')}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {filteredApplications.length === 0 && applications.length > 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {t('jobs.dashboard.noMatchingApplications', 'No applications match the selected filters')}
                    </div>
                  )}
                  {applications.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {t('jobs.dashboard.noApplications')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <ResponseTemplatesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
