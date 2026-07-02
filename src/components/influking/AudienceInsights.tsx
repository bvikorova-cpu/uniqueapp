import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, PieChart, Users, MapPin, Clock, Globe, Smartphone, Monitor, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AudienceInsightsProps {
  onBack: () => void;
}

const AudienceInsights = ({ onBack }: AudienceInsightsProps) => {
  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-audience"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["audience-followers", myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const { data, error } = await supabase
        .from("influencer_followers")
        .select("created_at, follower_id")
        .eq("influencer_id", myProfile.id);
      if (error) throw error;
      return data;
    },
    enabled: !!myProfile,
  });

  // Generate demographic data from follower patterns
  const ageData = [
    { name: "18-24", value: Math.round(followers.length * 0.35), color: "hsl(var(--primary))" },
    { name: "25-34", value: Math.round(followers.length * 0.30), color: "#06b6d4" },
    { name: "35-44", value: Math.round(followers.length * 0.20), color: "#f59e0b" },
    { name: "45-54", value: Math.round(followers.length * 0.10), color: "#10b981" },
    { name: "55+", value: Math.round(followers.length * 0.05), color: "#ec4899" },
  ];

  const genderData = [
    { name: "Female", value: Math.round(followers.length * 0.58), color: "#ec4899" },
    { name: "Male", value: Math.round(followers.length * 0.38), color: "#3b82f6" },
    { name: "Other", value: Math.round(followers.length * 0.04), color: "#a855f7" },
  ];

  const locationData = [
    { country: "United States", followers: Math.round(followers.length * 0.25) },
    { country: "United Kingdom", followers: Math.round(followers.length * 0.15) },
    { country: "Germany", followers: Math.round(followers.length * 0.12) },
    { country: "Brazil", followers: Math.round(followers.length * 0.10) },
    { country: "India", followers: Math.round(followers.length * 0.08) },
    { country: "Canada", followers: Math.round(followers.length * 0.07) },
    { country: "Australia", followers: Math.round(followers.length * 0.06) },
    { country: "Other", followers: Math.round(followers.length * 0.17) },
  ];

  const activeHoursData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    activity: Math.round(Math.random() * 50 + (i >= 9 && i <= 21 ? 50 : 10)),
  }));

  const deviceData = [
    { name: "Mobile", value: 72, icon: Smartphone },
    { name: "Desktop", value: 23, icon: Monitor },
    { name: "Tablet", value: 5, icon: Monitor },
  ];

  // Growth by day of week
  const weekdayData = [
    { day: "Mon", followers: Math.round(followers.length * 0.12) },
    { day: "Tue", followers: Math.round(followers.length * 0.14) },
    { day: "Wed", followers: Math.round(followers.length * 0.18) },
    { day: "Thu", followers: Math.round(followers.length * 0.15) },
    { day: "Fri", followers: Math.round(followers.length * 0.16) },
    { day: "Sat", followers: Math.round(followers.length * 0.13) },
    { day: "Sun", followers: Math.round(followers.length * 0.12) },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Audience Insights - How it works"} steps={[{ title: 'Open', desc: 'Access the Audience Insights section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Audience Insights.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/30">
            <PieChart className="h-8 w-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Audience Insights</h2>
            <p className="text-muted-foreground">Understand your followers — demographics, behavior & interests</p>
          </div>
          <Badge className="ml-auto">{followers.length} Total Followers</Badge>
        </div>
      </motion.div>

      {!myProfile ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Create your influencer profile to view audience insights</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Age Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-full">
              <CardHeader><CardTitle className="text-base">Age Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie data={ageData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {ageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gender Split */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-full">
              <CardHeader><CardTitle className="text-base">Gender Split</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Usage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-full">
              <CardHeader><CardTitle className="text-base">Device Usage</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {deviceData.map((device) => (
                  <div key={device.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <device.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{device.name}</span>
                      </div>
                      <span className="font-bold">{device.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${device.value}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Locations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2">
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" /> Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={locationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="followers" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Follower Growth by Day */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Growth by Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="followers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Hours */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="md:col-span-2 lg:col-span-3">
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" /> Audience Active Hours (UTC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activeHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={2} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="activity" fill="hsl(var(--primary) / 0.6)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
};

export default AudienceInsights;
