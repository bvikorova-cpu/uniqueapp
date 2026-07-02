import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Download, Play, Pause } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LessonRecordingProps {
  lessonId: string;
  recordingUrl?: string;
  isInstructor: boolean;
}

export const LessonRecording = ({ lessonId, recordingUrl, isInstructor }: LessonRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      } as any);

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lesson-${lessonId}-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Recording downloaded");
  };

  return (
    <>
      <FloatingHowItWorks title="How Lesson Recording works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <h3 className="font-semibold">Lesson Recording</h3>
        </div>

        {isInstructor && (
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {recordedChunks.length > 0 && (
              <Button onClick={downloadRecording} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        )}
      </div>

      {recordingUrl && (
        <div className="mt-4">
          <video
            controls
            className="w-full rounded-lg"
            src={recordingUrl}
          >
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {!recordingUrl && !isRecording && recordedChunks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {isInstructor
            ? "Start recording to capture this lesson for students to replay later"
            : "No recording available yet"}
        </p>
      )}

      {isRecording && (
        <div className="flex items-center justify-center py-8 gap-2">
          <div className="animate-pulse h-3 w-3 bg-red-500 rounded-full" />
          <p className="text-sm font-medium">Recording in progress...</p>
        </div>
      )}
    </Card>
    </>
    );
};
