import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface VoiceInputWaveformProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputWaveform({ onTranscript, disabled }: VoiceInputWaveformProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(5));
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return (
    <>
      <FloatingHowItWorks title={"Voice Input Waveform - How it works"} steps={[{ title: 'Open', desc: 'Access the Voice Input Waveform section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Voice Input Waveform.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      stopRecording();
    };
  }, []);

  const updateWaveform = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const levels = Array.from({ length: 20 }, (_, i) => {
        const index = Math.floor((i / 20) * dataArray.length);
        return Math.max(5, (dataArray[index] / 255) * 40);
      });
      setAudioLevels(levels);
    }
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      animationRef.current = requestAnimationFrame(updateWaveform);
    } catch {
      console.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setAudioLevels(Array(20).fill(5));
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
      onTranscript("🎤 Voice message recorded!");
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex items-end gap-0.5 h-10 overflow-hidden px-3 py-1 bg-red-50 rounded-full border border-red-200"
          >
            {audioLevels.map((level, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-red-500 to-pink-400 rounded-full"
                animate={{ height: level }}
                transition={{ duration: 0.05 }}
              />
            ))}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xs text-red-500 font-medium ml-2 whitespace-nowrap"
            >
              Recording...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={handleToggle}
          disabled={disabled}
          className={`rounded-full h-10 w-10 ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
          }`}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </motion.div>
    </div>
  );
}
