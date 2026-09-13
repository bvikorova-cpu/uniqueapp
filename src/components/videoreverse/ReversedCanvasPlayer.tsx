import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, VolumeX, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SoundLoop, TIKTOK_SOUNDS } from "@/lib/tiktokSounds";
import { drawWatermark } from "@/lib/exportReversedVideo";

interface ReversedCanvasPlayerProps {
  frames: ImageBitmap[];
  width: number;
  height: number;
  fps: number;
  /** Preview always shows the watermark; set false only for clean exports. */
  showWatermark?: boolean;
}

/**
 * Renders extracted frames in reverse order (last -> first) with a
 * requestAnimationFrame loop and custom playback controls.
 */
export default function ReversedCanvasPlayer({
  frames,
  width,
  height,
  fps,
  showWatermark = true,
}: ReversedCanvasPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number | null>(null);
  const playbackStartRef = useRef<number | null>(null);
  const playbackStartPosRef = useRef(0);
  /** Position in reversed order: 0 = last original frame. */
  const posRef = useRef(0);
  /** Last position pushed to React state (throttled — a setState every
   *  frame re-renders the whole component and makes playback stutter). */
  const lastSyncedPosRef = useRef(-1);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [soundId, setSoundId] = useState("none");
  const soundRef = useRef<SoundLoop>(new SoundLoop());

  const total = frames.length;
  const frameDuration = 1000 / fps;

  const getCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    ctxRef.current = canvas.getContext("2d", { alpha: false });
    return ctxRef.current;
  }, []);

  const drawAt = useCallback(
    (pos: number) => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      const clamped = Math.min(total - 1, Math.max(0, Math.round(pos)));
      const bitmap = frames[total - 1 - clamped];
      if (bitmap) ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      if (showWatermark) drawWatermark(ctx, canvas.width, canvas.height);
    },
    [frames, total, showWatermark, getCtx],
  );

  /** Update React state at most ~5x per second (slider + time label only). */
  const syncPosition = useCallback(
    (pos: number, force = false) => {
      if (force || Math.abs(pos - lastSyncedPosRef.current) >= Math.max(1, Math.round(fps / 5))) {
        lastSyncedPosRef.current = pos;
        setPosition(pos);
      }
    },
    [fps],
  );

  useEffect(() => {
    posRef.current = 0;
    syncPosition(0, true);
    drawAt(0);
  }, [drawAt, syncPosition]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    playbackStartRef.current = null;
    playbackStartPosRef.current = posRef.current;
    const loop = (ts: number) => {
      if (playbackStartRef.current === null) playbackStartRef.current = ts;
      const elapsed = ts - playbackStartRef.current;
      const next = playbackStartPosRef.current + Math.floor(elapsed / frameDuration);
      if (next !== posRef.current) {
        if (next >= total - 1) {
          posRef.current = total - 1;
          syncPosition(total - 1, true);
          drawAt(total - 1);
          setPlaying(false);
          return;
        }
        posRef.current = next;
        syncPosition(next);
        drawAt(next);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, frameDuration, total, drawAt, syncPosition]);

  // Sound loop follows playback state and selection.
  useEffect(() => {
    const loop = soundRef.current;
    const sound = TIKTOK_SOUNDS.find((s) => s.id === soundId);
    if (playing && sound && sound.id !== "none") loop.start(sound);
    else loop.stop();
  }, [playing, soundId]);

  useEffect(() => {
    const loop = soundRef.current;
    return () => loop.stop();
  }, []);

  const restart = () => {
    posRef.current = 0;
    syncPosition(0, true);
    drawAt(0);
    setPlaying(true);
  };

  const seconds = (position / fps).toFixed(1);
  const totalSeconds = (total / fps).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <canvas ref={canvasRef} width={width} height={height} className="mx-auto block h-auto w-full" />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-primary-foreground">
          <VolumeX className="h-3.5 w-3.5" /> Audio is muted in reverse preview
        </div>
      </div>

      <Slider
        value={[position]}
        min={0}
        max={Math.max(0, total - 1)}
        step={1}
        onValueChange={([v]) => {
          setPlaying(false);
          posRef.current = v;
          syncPosition(v, true);
          drawAt(v);
        }}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{seconds}s</span>
        <span>
          {total} frames · {totalSeconds}s reversed
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button className="rounded-full" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button variant="outline" className="rounded-full" onClick={restart}>
          <RotateCcw className="mr-2 h-4 w-4" /> Restart
        </Button>
        <div className="flex min-w-[180px] flex-1 items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <Select value={soundId} onValueChange={setSoundId}>
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="Add sound" />
            </SelectTrigger>
            <SelectContent>
              {TIKTOK_SOUNDS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
