import { useEffect, useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, RotateCw } from "lucide-react";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function FutureFace3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!imgUrl || !wrapRef.current) return;
    const wrap = wrapRef.current;
    const w = wrap.clientWidth;
    const h = w;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    wrap.innerHTML = "";
    wrap.appendChild(renderer.domElement);

    const tex = new THREE.TextureLoader().load(imgUrl);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(2, 2, 32, 32);
    // subtle bowl curvature
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, -0.15 * (x * x + y * y));
    }
    pos.needsUpdate = true;
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    let rafId = 0;
    let dragging = false; let lastX = 0; let lastY = 0;
    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      mesh.rotation.y += (e.clientX - lastX) * 0.01;
      mesh.rotation.x += (e.clientY - lastY) * 0.01;
      lastX = e.clientX; lastY = e.clientY;
    };
    const onUp = () => { dragging = false; };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const animate = () => {
      if (autoRotate && !dragging) mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      tex.dispose();
    };
  }, [imgUrl, autoRotate]);

  const upload = async (f: File | null) => {
    if (!f) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast({ title: "Sign in first", variant: "destructive" }); return; }
    const path = `${session.user.id}/3d-${Date.now()}.${f.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("future-face-photos").upload(path, f, { contentType: f.type });
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    setImgUrl((await getReadableUrl("future-face-photos", path)));
  };

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-xl sm:text-2xl font-black">🌐 3D Face Viewer</h2>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          {!imgUrl ? (
            <Button onClick={() => fileRef.current?.click()} className="w-full">
              <Upload className="h-4 w-4 mr-2" /> Upload photo to view in 3D
            </Button>
          ) : (
            <>
              <div ref={wrapRef} className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-cyan-950/40 to-purple-950/40" />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setAutoRotate(v => !v)}>
                  <RotateCw className="h-4 w-4 mr-2" /> {autoRotate ? "Stop rotation" : "Auto rotate"}
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Change photo
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Drag with finger/mouse to rotate manually.</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => upload(e.target.files?.[0] || null)} />
        </CardContent>
      </Card>
    </div>
  );
}
