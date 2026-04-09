import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Brain, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultIQData = [
  { date: "Week 1", iq: 98, memory: 45, logic: 52, speed: 40 },
  { date: "Week 2", iq: 100, memory: 50, logic: 55, speed: 45 },
  { date: "Week 3", iq: 102, memory: 55, logic: 58, speed: 50 },
  { date: "Week 4", iq: 101, memory: 58, logic: 56, speed: 52 },
  { date: "Week 5", iq: 104, memory: 62, logic: 60, speed: 55 },
  { date: "Week 6", iq: 106, memory: 65, logic: 63, speed: 60 },
];

const radarData = [
  { domain: "Verbal", score: 72 },
  { domain: "Logical", score: 85 },
  { domain: "Spatial", score: 68 },
  { domain: "Memory", score: 60 },
  { domain: "Speed", score: 55 },
  { domain: "Pattern", score: 78 },
];

export default function IQProgressCharts() {
  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📈 IQ Progress Tracking</h2>
      <Tabs defaultValue="iq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="iq" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" /> IQ Trend</TabsTrigger>
          <TabsTrigger value="skills" className="text-xs"><BarChart3 className="h-3 w-3 mr-1" /> Skills</TabsTrigger>
          <TabsTrigger value="radar" className="text-xs"><Brain className="h-3 w-3 mr-1" /> Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="iq">
          <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
            <CardHeader className="p-4">
              <CardTitle className="text-base">IQ Score Over Time</CardTitle>
              <CardDescription className="text-xs">Track your cognitive growth week by week</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={defaultIQData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[90, 120]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="iq" stroke="hsl(217, 91%, 60%)" strokeWidth={3} dot={{ fill: "hsl(217, 91%, 60%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <CardHeader className="p-4">
              <CardTitle className="text-base">Cognitive Skills Breakdown</CardTitle>
              <CardDescription className="text-xs">Memory, Logic & Processing Speed progress</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={defaultIQData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="memory" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="logic" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="speed" fill="hsl(280, 67%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card className="bg-gradient-to-br from-purple-500/5 to-violet-500/5 border-purple-500/20">
            <CardHeader className="p-4">
              <CardTitle className="text-base">Cognitive Profile</CardTitle>
              <CardDescription className="text-xs">Your strengths across 6 cognitive domains</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Radar dataKey="score" stroke="hsl(280, 67%, 55%)" fill="hsl(280, 67%, 55%)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
