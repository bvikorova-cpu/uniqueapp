import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Users, Gift, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";

type UserRow = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  created_at: string | null;
  credits_remaining: number | null;
  mt_tier: string | null;
  mt_status: string | null;
  mt_expires_at: string | null;
  other_subscriptions: { tier: string | null; status: string | null; ends_at: string | null }[] | null;
  referred_by_id: string | null;
  referred_by_name: string | null;
  referral_code: string | null;
  referral_reward_amount: number | null;
  referral_reward_paid: boolean | null;
  referral_status: string | null;
  total_referrals: number | null;
  total_referral_earnings: number | null;
};

type RewardRow = {
  id: string;
  created_at: string;
  referrer_id: string;
  referrer_name: string | null;
  referrer_email: string | null;
  referred_user_id: string;
  referred_name: string | null;
  referred_email: string | null;
  code: string | null;
  amount: number | null;
  paid: boolean | null;
  auto_credited: boolean | null;
  source_kind: string | null;
  source_subscription_id: string | null;
};

const PAGE_SIZE = 50;

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const eur = (v: number | null | undefined) => `€${Number(v ?? 0).toFixed(2)}`;

type SubscriptionStatusFilter = "all" | "active" | "inactive" | "any_subscription";

export default function AdminUsersOverview() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatusFilter>("all");
  const [codeFilter, setCodeFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    name: "",
    email: "",
    status: "all" as SubscriptionStatusFilter,
    code: "",
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc("admin_list_users_overview", {
      p_search: query || null,
      p_name: activeFilters.name || null,
      p_email: activeFilters.email || null,
      p_subscription_status: activeFilters.status === "all" ? null : activeFilters.status,
      p_referral_code: activeFilters.code || null,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });
    if (error) {
      toast.error("Failed to load users", { description: error.message });
      setUsers([]);
    } else {
      setUsers((data as UserRow[]) || []);
    }
    setLoading(false);
  }, [query, page, activeFilters]);

  const loadRewards = useCallback(async () => {
    setLoadingRewards(true);
    const { data, error } = await (supabase as any).rpc("admin_list_referral_rewards", {
      p_limit: 200,
      p_offset: 0,
    });
    if (error) {
      toast.error("Failed to load referral rewards", { description: error.message });
      setRewards([]);
    } else {
      setRewards((data as RewardRow[]) || []);
    }
    setLoadingRewards(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadRewards(); }, [loadRewards]);

  const totalRewards = rewards.reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const unpaidRewards = rewards.filter((r) => !r.paid).reduce((s, r) => s + Number(r.amount ?? 0), 0);

  return (
    <AdminGuard>
      <Helmet>
        <title>Users & Referrals — Admin</title>
        <meta name="description" content="Admin overview of users, their subscriptions and referral rewards." />
      </Helmet>
      <AdminPageShell>
        <AdminPageHeader
          title="Users & Referrals"
          subtitle="Every user, their active memberships, credits and who earned the €5 from their invite code."
          icon={Users}
          badge="Admin"
          breadcrumbs={[{ label: "Users & Referrals" }]}
        />

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <AdminGlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Users on this page</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Referral rewards total</p>
            <p className="text-2xl font-bold">{eur(totalRewards)}</p>
          </AdminGlassCard>
          <AdminGlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Unpaid rewards</p>
            <p className="text-2xl font-bold">{eur(unpaidRewards)}</p>
          </AdminGlassCard>
        </div>

        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="rewards">Referral €5 rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6 space-y-4">
              <form
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); setPage(0); setQuery(search.trim()); }}
              >
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, username or email"
                  className="max-w-sm"
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4 mr-2" /> Search
                </Button>
                <Button type="button" variant="ghost" onClick={loadUsers} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </form>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>MegaTalent</TableHead>
                        <TableHead>Other memberships</TableHead>
                        <TableHead>Invited by</TableHead>
                        <TableHead>€5 reward</TableHead>
                        <TableHead>Their referrals</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                      {users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            <div className="font-medium">{u.full_name || u.username || "—"}</div>
                            <div className="text-xs text-muted-foreground">{u.email || u.user_id.slice(0, 8)}</div>
                          </TableCell>
                          <TableCell className="text-sm">{fmtDate(u.created_at)}</TableCell>
                          <TableCell className="text-sm font-medium">{u.credits_remaining ?? 0}</TableCell>
                          <TableCell className="text-sm">
                            {u.mt_tier ? (
                              <div className="space-y-1">
                                <Badge variant={u.mt_status === "active" ? "default" : "secondary"}>
                                  {u.mt_tier} · {u.mt_status}
                                </Badge>
                                <div className="text-xs text-muted-foreground">until {fmtDate(u.mt_expires_at)}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(u.other_subscriptions?.length ?? 0) === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {u.other_subscriptions!.map((s, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {s.tier || "sub"} · {s.status || "?"}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {u.referred_by_id ? (
                              <div>
                                <div>{u.referred_by_name || u.referred_by_id.slice(0, 8)}</div>
                                <div className="text-xs text-muted-foreground">code {u.referral_code || "—"}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {u.referral_reward_amount == null ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <Badge variant={u.referral_reward_paid ? "default" : "secondary"}>
                                {eur(u.referral_reward_amount)} {u.referral_reward_paid ? "paid" : "pending"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(u.total_referrals ?? 0)} · {eur(u.total_referral_earnings)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {page + 1}</span>
                <Button variant="outline" size="sm" disabled={users.length < PAGE_SIZE || loading} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4" /> Who earned €5 and from whose subscription.
                </p>
                <Button variant="ghost" size="sm" onClick={loadRewards} disabled={loadingRewards}>
                  <RefreshCw className={`h-4 w-4 ${loadingRewards ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {loadingRewards ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Earned by (referrer)</TableHead>
                        <TableHead>Invited user</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewards.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No referral rewards yet.
                          </TableCell>
                        </TableRow>
                      )}
                      {rewards.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm">{fmtDate(r.created_at)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{r.referrer_name || r.referrer_id.slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">{r.referrer_email || ""}</div>
                          </TableCell>
                          <TableCell>
                            <div>{r.referred_name || r.referred_user_id.slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">{r.referred_email || ""}</div>
                          </TableCell>
                          <TableCell className="text-sm">{r.code || "—"}</TableCell>
                          <TableCell className="text-sm font-medium">{eur(r.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={r.paid ? "default" : "secondary"}>{r.paid ? "Paid" : "Pending"}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.auto_credited ? "auto" : "manual"}
                            {r.source_kind ? ` · ${r.source_kind}` : ""}
                            {r.source_subscription_id ? ` · ${r.source_subscription_id.slice(0, 14)}…` : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
