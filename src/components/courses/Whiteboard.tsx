import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Eraser, Pen, Circle, Square, Download, Trash2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface WhiteboardProps {
  lessonId: string;
  isInstructor: boolean;
}

interface Stroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: "pen" | "eraser" | "circle" | "square";
}

export function Whiteboard({ lessonId, isInstructor }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser" | "circle" | "square">("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentWidth, setCurrentWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<number[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`whiteboard-${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whiteboard_strokes",
          filter: `lesson_id=eq.${lessonId}`,
        },
        (payload) => {
      if (payload.new.stroke_data) {
        const strokeData = payload.new.stroke_data as unknown as Stroke;
        drawStroke(strokeData);
      }
        }
      )
      .subscribe();

    loadStrokes();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  const loadStrokes = async () => {
    const { data } = await supabase
      .from("whiteboard_strokes")
      .select("stroke_data")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });

    if (data) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      data.forEach((item) => {
        if (item.stroke_data) {
          drawStroke(item.stroke_data as unknown as Stroke);
        }
      });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInstructor) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentStroke([x, y]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isInstructor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : currentColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = "round";

    if (currentStroke.length === 0) {
      setCurrentStroke([x, y]);
    } else {
      ctx.beginPath();
      ctx.moveTo(currentStroke[currentStroke.length - 2], currentStroke[currentStroke.length - 1]);
      ctx.lineTo(x, y);
      ctx.stroke();
      setCurrentStroke([...currentStroke, x, y]);
    }
  };

  const stopDrawing = async () => {
    if (!isDrawing || !isInstructor) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const stroke: Stroke = {
        id: crypto.randomUUID(),
        points: currentStroke,
        color: currentColor,
        width: currentWidth,
        tool: currentTool,
      };

      await supabase.from("whiteboard_strokes").insert([{
        lesson_id: lessonId,
        user_id: user.id,
        stroke_data: stroke as any,
      }]);

      setCurrentStroke([]);
    }
  };

  const drawStroke = (stroke: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";

    for (let i = 0; i < stroke.points.length - 2; i += 2) {
      ctx.beginPath();
      ctx.moveTo(stroke.points[i], stroke.points[i + 1]);
      ctx.lineTo(stroke.points[i + 2], stroke.points[i + 3]);
      ctx.stroke();
    }
  };

  const clearCanvas = async () => {
    if (!isInstructor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Delete all strokes from database
    await supabase.from("whiteboard_strokes").delete().eq("lesson_id", lessonId);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `whiteboard-${lessonId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

  return (
    <>
      <FloatingHowItWorks title="How Whiteboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Collaborative Whiteboard</h3>
        <div className="flex gap-2">
          {isInstructor && (
            <>
              <Button
                variant={currentTool === "pen" ? "default" : "secondary"}
                size="sm"
                onClick={() => setCurrentTool("pen")}
              >
                <Pen className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === "eraser" ? "default" : "secondary"}
                size="sm"
                onClick={() => setCurrentTool("eraser")}
              >
                <Eraser className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === "circle" ? "default" : "secondary"}
                size="sm"
                onClick={() => setCurrentTool("circle")}
              >
                <Circle className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === "square" ? "default" : "secondary"}
                size="sm"
                onClick={() => setCurrentTool("square")}
              >
                <Square className="w-4 h-4" />
              </Button>
              <div className="flex gap-1 ml-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      currentColor === color ? "border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                  />
                ))}
              </div>
              <Button variant="destructive" size="sm" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={downloadCanvas}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="w-full border rounded-lg bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {!isInstructor && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          View-only mode. Only the instructor can draw.
        </p>
      )}
    </Card>
    </>
    );
}
