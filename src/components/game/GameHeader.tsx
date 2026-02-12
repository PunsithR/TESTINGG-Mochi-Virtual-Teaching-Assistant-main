import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";

interface GameHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  onEnd: () => void;
  onNext: () => void;
  canProceed: boolean;
}

const GameHeader = ({
  currentQuestion,
  totalQuestions,
  onEnd,
  onNext,
  canProceed,
}: GameHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 bg-card/80 backdrop-blur-sm rounded-2xl shadow-sm"
    >
      {/* End Button */}
      <Button
        variant="ghost"
        onClick={onEnd}
        className="text-muted-foreground hover:text-destructive font-semibold"
      >
        <X className="w-5 h-5 mr-2" />
        End
      </Button>

      {/* Progress Indicator */}
      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-1">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <div className="flex gap-2">
          {[...Array(totalQuestions)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < currentQuestion
                  ? "bg-success"
                  : i === currentQuestion - 1
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="bg-primary hover:bg-primary/90 font-semibold disabled:opacity-50"
      >
        Next
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </motion.header>
  );
};

export default GameHeader;
