import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Crown, 
  ShoppingBag, 
  Euro, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Ban,
  CheckCircle,
  XCircle
} from "lucide-react";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data
  const stats = {
    totalUsers: 1248,
    premiumUsers: 892,
    totalEarnings: 8920,
    monthlyGrowth: 12.5,
    activeContests: 3,
    pendingPayouts: 245
  };

  const recentUsers = [
    { id: 1, name: "Peter Novák", email: "peter@email.com", status: "premium", joined: "2024-01-15" },
    { id: 2, name: "Anna Svoboda", email: "anna@email.com", status: "free", joined: "2024-01-14" },
    { id: 3, name: "Tomáš Černý", email: "tomas@email.com", status: "premium", joined: "2024-01-13" },
    { id: 4, name: "Jana Horáková", email: "jana@email.com", status: "premium", joined: "2024-01-12" },
  ];

  const pendingContent = [
    { id: 1, user: "Martin Kováč", type: "Video", title: "Tanečný cover", reports: 2, status: "pending" },
    { id: 2, user: "Lucia Dvořák", type: "Foto", title: "Spevácky výkon", reports: 0, status: "pending" },
    { id: 3, user: "Michal Procházka", type: "Video", title: "Gitarová improvizácia", reports: 1, status: "pending" },
  ];

  const payoutRequests = [
    { id: 1, user: "Peter Novák", amount: 45, type: "Referral", status: "pending", date: "2024-01-15" },
    { id: 2, user: "Anna Svoboda", amount: 25, type: "Contest", status: "approved", date: "2024-01-14" },
    { id: 3, user: "Tomáš Černý", amount: 5, type: "Referral", status: "pending", date: "2024-01-13" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Admin{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Panel
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">Správa Megatalent platformy</p>
          </div>
          <Badge className="bg-gold text-gold-foreground px-4 py-2">
            Administrátor
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Celkom používateľov</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Premium členi</p>
                  <p className="text-2xl font-bold">{stats.premiumUsers}</p>
                </div>
                <Crown className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mesačné príjmy</p>
                  <p className="text-2xl font-bold">€{stats.totalEarnings}</p>
                </div>
                <Euro className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rast (%)</p>
                  <p className="text-2xl font-bold">+{stats.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktívne súťaže</p>
                  <p className="text-2xl font-bold">{stats.activeContests}</p>
                </div>
                <Crown className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Čakajúce výplaty</p>
                  <p className="text-2xl font-bold">{stats.pendingPayouts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Používatelia</TabsTrigger>
            <TabsTrigger value="content">Obsah</TabsTrigger>
            <TabsTrigger value="payouts">Výplaty</TabsTrigger>
            <TabsTrigger value="settings">Nastavenia</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Správa používateľov</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="Hľadať používateľa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meno</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dátum registrácie</TableHead>
                      <TableHead>Akcie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'premium' ? 'default' : 'secondary'}>
                            {user.status === 'premium' ? 'Premium' : 'Bezplatný'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderácia obsahu</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Používateľ</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Názov</TableHead>
                      <TableHead>Nahlásenia</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Akcie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingContent.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.user}</TableCell>
                        <TableCell>{content.type}</TableCell>
                        <TableCell>{content.title}</TableCell>
                        <TableCell>
                          {content.reports > 0 && (
                            <Badge variant="destructive">{content.reports}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {content.status === 'pending' ? 'Čaká' : 'Schválený'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Správa výplat</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Používateľ</TableHead>
                      <TableHead>Suma</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Dátum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Akcie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRequests.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.user}</TableCell>
                        <TableCell className="font-semibold">€{payout.amount}</TableCell>
                        <TableCell>{payout.type}</TableCell>
                        <TableCell>{payout.date}</TableCell>
                        <TableCell>
                          <Badge variant={payout.status === 'approved' ? 'default' : 'secondary'}>
                            {payout.status === 'approved' ? 'Schválené' : 'Čaká'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nastavenia súťaže</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Mesačná výhra (€)</label>
                    <Input type="number" defaultValue="100000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cena predplatného (€)</label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Referenčná odmena (€)</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <Button variant="hero">Uložiť zmeny</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Systémové nastavenia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Maximálna veľkosť videa (MB)</label>
                    <Input type="number" defaultValue="100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Limit nahrávaní za deň</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auto-moderácia</label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Povoliť automatickú moderáciu obsahu</span>
                    </div>
                  </div>
                  <Button variant="hero">Uložiť zmeny</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;