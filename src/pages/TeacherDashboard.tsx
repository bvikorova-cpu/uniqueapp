import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Download, 
  Users, 
  BarChart, 
  Settings, 
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Share2,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreateCollectionDialog from "@/components/teacher/CreateCollectionDialog";
import InviteTeacherDialog from "@/components/teacher/InviteTeacherDialog";
import CollectionColoringPages from "@/components/teacher/CollectionColoringPages";

interface Collection {
  id: string;
  name: string;
  subject: string;
  description?: string;
  page_count: number;
  downloads: number;
  created_at: string;
}

interface Teacher {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SchoolProfile {
  id: string;
  school_name: string | null;
  school_logo_url: string | null;
  subscription_tier: string;
  subscription_status: string;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to access teacher dashboard");
        return;
      }
      setUser(session.user);
      loadDashboardData();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load or create school profile
      let { data: profile, error: profileError } = await supabase
        .from("school_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile && !profileError) {
        // Create school profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("school_profiles")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          console.error("Error creating school profile:", createError);
          return;
        }
        profile = newProfile;
      }

      if (profile) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        const isAdmin = !!roleData;

        // Check if subscription is active (skip for admins)
        if (!isAdmin && profile.subscription_status !== 'active') {
          toast.error("Please subscribe to access Teacher Dashboard");
          navigate('/schools');
          return;
        }

        setSchoolProfile(profile);
        setSchoolName(profile.school_name || "");

        // Load collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from("teacher_collections")
          .select("*")
          .eq("school_id", profile.id)
          .order("created_at", { ascending: false });

        if (!collectionsError && collectionsData) {
          setCollections(collectionsData);
        }

        // Load team members
        const { data: teamData, error: teamError } = await supabase
          .from("school_team_members")
          .select("*")
          .eq("school_id", profile.id)
          .order("invited_at", { ascending: false });

        if (!teamError && teamData) {
          setTeachers(teamData);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleNewCollection = () => {
    if (!schoolProfile) {
      toast.error("School profile not found");
      return;
    }
    setShowCreateDialog(true);
  };

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const handleEditCollection = (collection: Collection) => {
    setSelectedCollection(collection);
  };

  const handleDownloadCollection = async (id: string, name: string) => {
    toast.info(`Download ${name} - generating PDF...`);
  };

  const handleShareCollection = async (id: string) => {
    const shareUrl = `${window.location.origin}/collection/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const { error } = await supabase
        .from("teacher_collections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Collection deleted successfully");
      setCollections(collections.filter(c => c.id !== id));
    } catch (error: any) {
      console.error("Error deleting collection:", error);
      toast.error(error.message || "Failed to delete collection");
    }
  };

  const handleInviteTeacher = () => {
    if (!schoolProfile) {
      toast.error("School profile not found");
      return;
    }
    setShowInviteDialog(true);
  };

  const handleEditTeacher = (id: string) => {
    toast.info(`Edit teacher ${id} - feature coming soon!`);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const { error } = await supabase
        .from("school_team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Teacher removed successfully");
      setTeachers(teachers.filter(t => t.id !== id));
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      toast.error(error.message || "Failed to remove teacher");
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolProfile) return;

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("school_profiles")
        .update({ school_logo_url: publicUrl })
        .eq("id", schoolProfile.id);

      if (updateError) throw updateError;

      setSchoolProfile({ ...schoolProfile, school_logo_url: publicUrl });
      toast.success("Logo uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!schoolProfile) return;

    try {
      const { error } = await supabase
        .from("school_profiles")
        .update({ school_name: schoolName })
        .eq("id", schoolProfile.id);

      if (error) throw error;

      setSchoolProfile({ ...schoolProfile, school_name: schoolName });
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    }
  };

  const handleUpgradePlan = () => {
    navigate("/schools");
  };

  const handleCancelSubscription = () => {
    toast.info("Cancel subscription feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your educational content and team
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{collections.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {collections.reduce((acc, c) => acc + c.page_count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {collections.reduce((acc, c) => acc + c.downloads, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="collections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collections">
              <FolderOpen className="h-4 w-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Collections</h2>
              <Button onClick={handleNewCollection}>
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <CardDescription>{collection.subject}</CardDescription>
                      </div>
                      <Badge variant="secondary">{collection.page_count} pages</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Downloads</span>
                        <span className="font-medium">{collection.downloads}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{new Date(collection.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditCollection(collection)}>
                          <Edit className="h-4 w-4 mr-1" />
                          View/Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDownloadCollection(collection.id, collection.name)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleShareCollection(collection.id)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCollection(collection.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedCollection && (
              <div className="mt-8 pt-8 border-t">
                <CollectionColoringPages
                  collectionId={selectedCollection.id}
                  collectionName={selectedCollection.name}
                />
              </div>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Team Members</h2>
              <Button onClick={handleInviteTeacher}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Teacher
              </Button>
            </div>

            <div className="grid gap-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{teacher.role}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleEditTeacher(teacher.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTeacher(teacher.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">Usage Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Mathematics</span>
                      <Badge>142 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Science</span>
                      <Badge>98 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Geography</span>
                      <Badge>76 downloads</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Pages Generated</span>
                      <span className="font-bold">84</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Downloads</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Collections Created</span>
                      <span className="font-bold">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-bold">School Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>School Branding</CardTitle>
                <CardDescription>
                  Customize how your school's logo appears on coloring pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">School Logo</Label>
                  {schoolProfile?.school_logo_url && (
                    <img 
                      src={schoolProfile.school_logo_url} 
                      alt="School logo" 
                      className="w-20 h-20 object-cover rounded mb-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    disabled={uploadingLogo}
                    className="cursor-pointer"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">School Name</Label>
                  <Input 
                    type="text" 
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your school subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{schoolProfile?.subscription_tier || 'Free'}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {schoolProfile?.subscription_status || 'Inactive'}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {schoolProfile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleUpgradePlan}>Upgrade Plan</Button>
                  <Button variant="outline" onClick={handleCancelSubscription}>Cancel Subscription</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>


      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        schoolId={schoolProfile?.id || ""}
        onSuccess={loadDashboardData}
      />

      <InviteTeacherDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        schoolId={schoolProfile?.id || ""}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
