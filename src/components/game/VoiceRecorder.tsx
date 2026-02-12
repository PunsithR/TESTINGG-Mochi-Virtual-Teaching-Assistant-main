import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onRecordingComplete: (transcript: string) => void;
  isDisabled?: boolean;
}

const VoiceRecorder = ({ onRecordingComplete, isDisabled = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordClick = async () => {
    if (isDisabled) return;

    if (!isRecording) {
      setIsRecording(true);
      
      // Mock recording - in production, this would use Web Speech API
      // or send audio to Flask endpoint
      setTimeout(() => {
        setIsRecording(false);
        // Mock transcript - this would come from speech recognition
        onRecordingComplete("apple");
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3"
    >
      <Button
        variant="outline"
        size="lg"
        onClick={handleRecordClick}
        disabled={isDisabled}
        className={`
          relative w-20 h-20 rounded-full border-4 
          transition-all duration-300
          ${isRecording 
            ? "border-destructive bg-destructive/10" 
            : "border-primary bg-primary/10 hover:bg-primary/20"
          }
        `}
      >
        {/* Pulse animation when recording */}
        {isRecording && (
          <>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-destructive/30"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="absolute inset-0 rounded-full bg-destructive/20"
            />
          </>
        )}
        
        {isRecording ? (
          <MicOff className="w-8 h-8 text-destructive" />
        ) : (
          <Mic className="w-8 h-8 text-primary" />
        )}
      </Button>

      <p className={`text-sm font-medium ${isRecording ? "text-destructive" : "text-muted-foreground"}`}>
        {isRecording ? "Listening..." : "Speak Your Answer"}
      </p>
    </motion.div>
  );
};

export default VoiceRecorder;
