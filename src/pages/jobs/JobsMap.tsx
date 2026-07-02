import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Map as MapIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_JOBSMAP = [
  { title: "Zoom & pan", desc: "Move around the map \u2014 job pins cluster; zoom in to split clusters into individual roles." },
  { title: "Tap a pin", desc: "See a preview card with job title, company and salary. Tap it to open the full detail." },
  { title: "Filter", desc: "Apply the same filters as the main Jobs board \u2014 role, seniority, remote-ok, salary." },
];

// Fix default marker icons (Vite breaks them)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function JobsMap() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("job_listings")
        .select("id, title, company_name, location, latitude, longitude")
        .eq("is_active", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(500);
      setJobs(data ?? []);
      setLoading(false);
    })();
  }, []);

  const center: [number, number] = jobs.length ? [Number(jobs[0].latitude), Number(jobs[0].longitude)] : [48.1486, 17.1077];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/15 via-primary/10 to-cyan-500/5 border border-teal-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-xl"><MapIcon className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Jobs Map</h1>
            <p className="text-sm text-muted-foreground">{jobs.length} jobs with location</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : jobs.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center text-muted-foreground">
          No jobs with map coordinates yet. Employers can add lat/lng when posting.
        </CardContent></Card>
      ) : (
        <Card className="overflow-hidden"><CardContent className="p-0">
          <MapContainer center={center} zoom={5} style={{ height: "70vh", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {jobs.map(j => (
              <Marker key={j.id} position={[Number(j.latitude), Number(j.longitude)]}>
                <Popup>
                  <div className="space-y-1">
                    <div className="font-bold">{j.title}</div>
                    <div className="text-xs">{j.company_name} • {j.location}</div>
                    <button className="text-xs text-primary underline" onClick={() => navigate(`/jobs?id=${j.id}`)}>Open</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </CardContent></Card>
      )}
    </div>
  );
}
