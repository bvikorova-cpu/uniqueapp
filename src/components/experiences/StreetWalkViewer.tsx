import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Footprints, Loader2 } from "lucide-react";

export const STREET_WALK_COORDS: Record<string, { lat: number; lng: number }> = {
  Paris: { lat: 48.858093, lng: 2.294694 },
  Tokyo: { lat: 35.659482, lng: 139.70055 },
  "New York": { lat: 40.758, lng: -73.9855 },
  London: { lat: 51.500729, lng: -0.124625 },
  Dubai: { lat: 25.197197, lng: 55.27437 },
  Barcelona: { lat: 41.403629, lng: 2.174356 },
  Rome: { lat: 41.890251, lng: 12.492373 },
  Istanbul: { lat: 41.008587, lng: 28.98006 },
  Sydney: { lat: -33.856784, lng: 151.215297 },
  Singapore: { lat: 1.283404, lng: 103.860530 },
  "Hong Kong": { lat: 22.279, lng: 114.16 },
  "Las Vegas": { lat: 36.114647, lng: -115.172813 },
  "San Francisco": { lat: 37.807999, lng: -122.475177 },
  "Los Angeles": { lat: 34.101558, lng: -118.32691 },
  Miami: { lat: 25.78206, lng: -80.13089 },
  Amsterdam: { lat: 52.37403, lng: 4.88969 },
  Prague: { lat: 50.086479, lng: 14.411379 },
  Vienna: { lat: 48.184517, lng: 16.312222 },
  Bangkok: { lat: 13.75005, lng: 100.491428 },
  Seoul: { lat: 37.579617, lng: 126.977041 },
  Athens: { lat: 37.971532, lng: 23.725749 },
  Lisbon: { lat: 38.691584, lng: -9.216486 },
  Moscow: { lat: 55.753930, lng: 37.620795 },
  Cairo: { lat: 29.975297, lng: 31.130806 },
  "Mexico City": { lat: 19.432608, lng: -99.133209 },
  Toronto: { lat: 43.642567, lng: -79.387054 },
  Copenhagen: { lat: 55.680950, lng: 12.590100 },
  Stockholm: { lat: 59.325300, lng: 18.071100 },
};

export const hasStreetWalk = (destination: string) => Boolean(STREET_WALK_COORDS[destination]);

let mapsLoader: Promise<void> | null = null;

const loadMaps = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.google?.maps?.StreetViewPanorama) return Promise.resolve();
  if (mapsLoader) return mapsLoader;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) return Promise.reject(new Error("Google Maps key is not configured"));

  mapsLoader = new Promise<void>((resolve, reject) => {
    w.__uniqueInitMaps = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__uniqueInitMaps${channel ? `&channel=${channel}` : ""}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoader;
};

interface StreetWalkViewerProps {
  destination: string;
  landmark?: string;
  onClose: () => void;
}

const StreetWalkViewer = ({ destination, landmark, onClose }: StreetWalkViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const coords = STREET_WALK_COORDS[destination];
    if (!coords) {
      setError("Street walk is not available for this destination.");
      setLoading(false);
      return;
    }

    loadMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        const service = new g.maps.StreetViewService();
        service.getPanorama({ location: coords, radius: 200 }, (data: any, status: string) => {
          if (cancelled || !containerRef.current) return;
          if (status !== "OK" || !data?.location?.pano) {
            setError("No street imagery found near this landmark.");
            setLoading(false);
            return;
          }
          const panorama = new g.maps.StreetViewPanorama(containerRef.current, {
            position: data.location.latLng || coords,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            addressControl: false,
            linksControl: true,
            panControl: false,
            zoomControl: false,
            showRoadLabels: false,
            clickToGo: true,
            scrollwheel: true,
            disableDefaultUI: false,
            enableCloseButton: false,
            fullscreenControl: false,
            motionTracking: false,
            motionTrackingControl: false,
gestureHandling: "greedy",
          });
          panorama.setVisible(true);
          setLoading(false);
        });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destination]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div ref={containerRef} className="absolute inset-0" />

      {(loading || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-white/70">Opening the streets of {destination}…</p>
            </>
          ) : (
            <>
              <Footprints className="h-8 w-8 text-white/60" />
              <p className="max-w-sm text-sm text-white/80">{error}</p>
              <Button variant="secondary" size="sm" onClick={onClose}>Back to tour</Button>
            </>
          )}
        </div>
      )}

      <div className="absolute left-4 top-4 z-10 rounded-2xl border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-xl">
        <p className="text-sm font-bold leading-tight text-white">{destination}</p>
        <p className="text-xs text-white/60">{landmark || "Street walk"}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Close street walk"
        className="absolute right-4 top-4 z-10 rounded-xl border border-white/10 bg-black/60 text-white hover:bg-red-500/50"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs text-white/70 backdrop-blur-xl">
        Drag to look around · tap the arrows on the road to walk
      </div>
    </div>
  );
};

export default StreetWalkViewer;
