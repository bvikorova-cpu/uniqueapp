import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Footprints, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { STREET_WALK_STOPS, STREET_WALK_COORDS, hasStreetWalk } from "./streetWalkStops";

export { STREET_WALK_STOPS, STREET_WALK_COORDS, hasStreetWalk };

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
  const panoramaRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stopIndex, setStopIndex] = useState(0);

  const stops = STREET_WALK_STOPS[destination] || [];

  const goToStop = useCallback(
    (index: number) => {
      const stop = stops[index];
      if (!stop) return;
      setStopIndex(index);
      setError(null);
      const g = (window as any).google;
      if (!g?.maps || !panoramaRef.current) return;
      setLoading(true);
      const service = new g.maps.StreetViewService();
      service.getPanorama({ location: { lat: stop.lat, lng: stop.lng }, radius: 400 }, (data: any, status: string) => {
        if (status !== "OK" || !data?.location) {
          setError("No street imagery found near this spot.");
          setLoading(false);
          return;
        }
        panoramaRef.current.setPosition(data.location.latLng);
        panoramaRef.current.setPov({ heading: 0, pitch: 0 });
        setLoading(false);
      });
    },
    [stops]
  );

  useEffect(() => {
    let cancelled = false;
    const first = stops[0];
    if (!first) {
      setError("Street walk is not available for this destination.");
      setLoading(false);
      return;
    }

    loadMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        const service = new g.maps.StreetViewService();
        service.getPanorama({ location: { lat: first.lat, lng: first.lng }, radius: 400 }, (data: any, status: string) => {
          if (cancelled || !containerRef.current) return;
          if (status !== "OK" || !data?.location) {
            setError("No street imagery found near this landmark.");
            setLoading(false);
            return;
          }
          const panorama = new g.maps.StreetViewPanorama(containerRef.current, {
            position: data.location.latLng,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            addressControl: false,
            linksControl: true,
            panControl: false,
            zoomControl: false,
            showRoadLabels: true,
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
          panoramaRef.current = panorama;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentStop = stops[stopIndex];

  const walk = useCallback((backwards: boolean) => {
    const panorama = panoramaRef.current;
    if (!panorama) return;
    const links = panorama.getLinks?.() || [];
    if (!links.length) return;
    const pov = panorama.getPov?.() || { heading: 0 };
    const target = ((backwards ? pov.heading + 180 : pov.heading) % 360 + 360) % 360;
    let best = links[0];
    let bestDiff = 999;
    for (const link of links) {
      const diff = Math.abs(((link.heading - target + 540) % 360) - 180);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = link;
      }
    }
    if (!best?.pano) return;
    panorama.setPano(best.pano);
    panorama.setPov({ heading: best.heading ?? pov.heading, pitch: 0 });
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div ref={containerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

      {(loading || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-white/70">Opening {currentStop?.name || destination}…</p>
            </>
          ) : (
            <>
              <Footprints className="h-8 w-8 text-white/60" />
              <p className="max-w-sm text-sm text-white/80">{error}</p>
              <div className="flex gap-2">
                {stops.length > 1 && (
                  <Button variant="secondary" size="sm" onClick={() => goToStop((stopIndex + 1) % stops.length)}>
                    Next spot
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Back to tour
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="absolute left-4 top-4 z-10 max-w-[55%] rounded-2xl border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-xl">
        <p className="text-sm font-bold leading-tight text-white">{destination}</p>
        <p className="truncate text-xs text-white/60">{currentStop?.name || landmark || "Street walk"}</p>
        {stops.length > 1 && (
          <p className="text-[10px] text-white/40">
            Spot {stopIndex + 1} of {stops.length}
          </p>
        )}
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

      {stops.length > 1 && (
        <div className="absolute bottom-16 left-0 right-0 z-10 flex items-center gap-2 px-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous spot"
            className="shrink-0 rounded-full border border-white/10 bg-black/60 text-white hover:bg-black/80"
            onClick={() => goToStop((stopIndex - 1 + stops.length) % stops.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stops.map((stop, idx) => (
              <button
                key={stop.name}
                onClick={() => goToStop(idx)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs backdrop-blur-xl transition ${
                  idx === stopIndex
                    ? "border-primary/60 bg-primary/30 font-semibold text-white"
                    : "border-white/10 bg-black/60 text-white/70 hover:bg-black/80"
                }`}
              >
                {stop.name}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Next spot"
            className="shrink-0 rounded-full border border-white/10 bg-black/60 text-white hover:bg-black/80"
            onClick={() => goToStop((stopIndex + 1) % stops.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-xl hover:bg-black/90"
          onClick={() => walk(true)}
        >
          Step back
        </Button>
        <Button
          size="sm"
          className="rounded-full bg-primary/90 text-primary-foreground hover:bg-primary"
          onClick={() => walk(false)}
        >
          <Footprints className="mr-1.5 h-4 w-4" />
          Walk forward
        </Button>
      </div>
    </div>
  );
};

export default StreetWalkViewer;
