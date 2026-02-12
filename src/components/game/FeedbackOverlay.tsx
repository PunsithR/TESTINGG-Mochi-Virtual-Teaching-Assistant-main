import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MochiAvatar from "./MochiAvatar";

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
  message: string;
  encouragement: string;
  onContinue: () => void;
  onRetry: () => void;
}

const FeedbackOverlay = ({
  isVisible,
  isCorrect,
  message,
  encouragement,
  onContinue,
  onRetry,
}: FeedbackOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${
              isCorrect 
                ? "bg-success/20" 
                : "bg-warning/20"
            }`}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 flex flex-col items-center p-8"
          >
            {/* Confetti/Sparkles for correct answer */}
            {isCorrect && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      scale: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.05,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute text-2xl"
                  >
                    {["⭐", "✨", "🎉", "💫", "🌟"][i % 5]}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mochi Avatar */}
            <MochiAvatar
              message={message}
              mood={isCorrect ? "celebrating" : "encouraging"}
              size="lg"
            />

            {/* Encouragement text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mt-6 text-2xl font-bold ${
                isCorrect ? "text-success" : "text-warning"
              }`}
            >
              {encouragement}
            </motion.p>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              {isCorrect ? (
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="bg-success hover:bg-success/90 text-success-foreground text-xl px-10 py-6 rounded-2xl"
                >
                  Continue →
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={onRetry}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground text-xl px-10 py-6 rounded-2xl"
                >
                  Try Again 💪
                </Button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackOverlay;
